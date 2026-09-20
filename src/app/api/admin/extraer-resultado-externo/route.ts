import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function normalize(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/f\.c\.|fc|d\.a\.f\.|c\.d\.|ceif|de cordoba/gi, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { partidoId } = await req.json();
    if (!partidoId) return NextResponse.json({ error: "Falta partidoId" }, { status: 400 });

    const partido = await prisma.partido.findUnique({
      where: { id: Number(partidoId) },
      include: { equipo_local: true, equipo_visitante: true },
    });

    if (!partido) return NextResponse.json({ error: "Partido no encontrado en la base de datos." }, { status: 404 });

    const dbLocalNorm = normalize(partido.equipo_local.nombre);
    const dbVisitanteNorm = normalize(partido.equipo_visitante.nombre);

    const fp = new Date(partido.fecha_hora_partido);
    const formatDateStr = (d: Date) => d.toISOString().split("T")[0].replace(/-/g, "");

    // Construir fechas individuales para evitar que la API de ESPN falle por el parámetro de rango con guion
    const datesToTry = Array.from(new Set([
      formatDateStr(fp),
      formatDateStr(new Date(fp.getTime() - 86400000)),
      formatDateStr(new Date(fp.getTime() + 86400000)),
      formatDateStr(new Date(fp.getTime() - 2 * 86400000)),
      formatDateStr(new Date(fp.getTime() + 2 * 86400000)),
      formatDateStr(new Date(fp.getTime() - 3 * 86400000)),
      formatDateStr(new Date(fp.getTime() + 3 * 86400000)),
      formatDateStr(new Date(fp.getTime() - 4 * 86400000)),
      formatDateStr(new Date(fp.getTime() + 4 * 86400000)),
      formatDateStr(new Date(fp.getTime() - 5 * 86400000)),
      formatDateStr(new Date(fp.getTime() + 5 * 86400000)),
      "", // scoreboard por defecto
    ]));

    let matchEvent: any = null;

    // Consultar fechas de manera paralela con timeout
    const fetchPromises = datesToTry.map(async (dStr) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard${dStr ? `?dates=${dStr}` : ""}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) return [];
        const data = await res.json();
        return data.events || [];
      } catch (err) {
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    const allEvents = results.flat();

    for (const event of allEvents) {
      const competition = event.competitions?.[0];
      if (!competition) continue;

      const homeTeam = competition.competitors?.find((c: any) => c.homeAway === "home");
      const awayTeam = competition.competitors?.find((c: any) => c.homeAway === "away");
      if (!homeTeam || !awayTeam) continue;

      const homeNameNorm = normalize(homeTeam.team.name);
      const awayNameNorm = normalize(awayTeam.team.name);

      const localMatch = dbLocalNorm.includes(homeNameNorm) || homeNameNorm.includes(dbLocalNorm);
      const visitanteMatch = dbVisitanteNorm.includes(awayNameNorm) || awayNameNorm.includes(dbVisitanteNorm);

      if (localMatch && visitanteMatch) {
        matchEvent = event;
        break;
      }
    }

    if (!matchEvent) {
      return NextResponse.json(
        { error: `No se encontró el partido (${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}) en ESPN.` },
        { status: 404 }
      );
    }

    const espnStatus = matchEvent.status?.type?.name || "";
    const isCompleted =
      matchEvent.status?.type?.completed === true ||
      matchEvent.status?.type?.state === "post" ||
      espnStatus.includes("FINAL") ||
      espnStatus.includes("FULL_TIME");

    const competition = matchEvent.competitions[0];
    const homeTeam = competition.competitors.find((c: any) => c.homeAway === "home");
    const awayTeam = competition.competitors.find((c: any) => c.homeAway === "away");

    const golesLocal = parseInt(homeTeam?.score, 10) || 0;
    const golesVisitante = parseInt(awayTeam?.score, 10) || 0;

    // Buscar goleadores en summary
    const goleadoresEncontradosIds: number[] = [];
    const logs: string[] = [];

    try {
      const summaryController = new AbortController();
      const summaryTimeoutId = setTimeout(() => summaryController.abort(), 6000);
      const summaryRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/summary?event=${matchEvent.id}`, {
        signal: summaryController.signal,
      });
      clearTimeout(summaryTimeoutId);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        if (summaryData.keyEvents) {
          const goalEvents = summaryData.keyEvents.filter((ke: any) => ke.type?.type === "goal" || ke.scoringPlay);

          if (goalEvents.length > 0) {
            const jugadoresPartido = await prisma.jugador.findMany({
              where: { equipo_id: { in: [partido.equipo_local_id, partido.equipo_visitante_id] } },
            });

            for (const goal of goalEvents) {
              let playerName = goal.shortText || goal.text;
              if (!playerName) continue;

              playerName = playerName
                .replace(/Goal.*/i, "")
                .replace(/\(.*\)/g, "")
                .replace(/Own Goal.*/i, "")
                .replace(/Penalty.*/i, "")
                .trim();

              const normClean = normalize(playerName);
              const parts = normClean.split(" ").filter((p: string) => p.length > 2);

              let matchedJugador = jugadoresPartido.find((j) => {
                const dbNorm = normalize(j.nombre);
                if (dbNorm === normClean) return true;
                if (dbNorm.includes(normClean) || normClean.includes(dbNorm)) return true;
                return false;
              });

              if (!matchedJugador && parts.length > 0) {
                const lastName = parts[parts.length - 1];
                matchedJugador = jugadoresPartido.find((j) => {
                  const dbNorm = normalize(j.nombre);
                  return dbNorm.includes(lastName);
                });
              }

              if (matchedJugador && !goleadoresEncontradosIds.includes(matchedJugador.id)) {
                goleadoresEncontradosIds.push(matchedJugador.id);
                logs.push(`Goleador ESPN: ${playerName} -> BD: ${matchedJugador.nombre}`);
              } else if (!matchedJugador) {
                logs.push(`Goleador en ESPN (${playerName}) no hallado en la lista del partido.`);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Error obteniendo summary de ESPN:", e);
    }

    if (!isCompleted && golesLocal === 0 && golesVisitante === 0 && goleadoresEncontradosIds.length === 0) {
      return NextResponse.json(
        {
          error: `El partido todavía aparece en estado no finalizado en ESPN (${espnStatus || "programado"}). Espera a que termine o cargue marcadores para extraerlo oficialmente.`,
          espnStatus,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      golesLocal,
      golesVisitante,
      goleadoresIds: goleadoresEncontradosIds,
      logs,
      espnStatus,
      isCompleted,
    });
  } catch (error: any) {
    console.error("Error en /api/admin/extraer-resultado-externo:", error);
    return NextResponse.json({ error: "Error interno del servidor al extraer ESPN: " + error.message }, { status: 500 });
  }
}
