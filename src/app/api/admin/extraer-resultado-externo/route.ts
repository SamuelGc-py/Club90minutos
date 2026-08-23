import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { partidoId } = await req.json();
    if (!partidoId) return NextResponse.json({ error: "Falta partidoId" }, { status: 400 });

    const partido = await prisma.partido.findUnique({
      where: { id: partidoId },
      include: { equipo_local: true, equipo_visitante: true }
    });

    if (!partido) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

    const normalize = (str: string) =>
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/f\.c\.|fc|d.a.f.|c.d./gi, "").trim();

    const dbLocalNorm = normalize(partido.equipo_local.nombre);
    const dbVisitanteNorm = normalize(partido.equipo_visitante.nombre);

    // Agregar timeout de 10 segundos para no bloquear la conexión si ESPN no responde
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard?dates=20260801-20260831", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    const events = data.events || [];

    const matchEvent = events.find((event: any) => {
      const competition = event.competitions?.[0];
      if (!competition) return false;

      const homeTeam = competition.competitors?.find((c: any) => c.homeAway === "home");
      const awayTeam = competition.competitors?.find((c: any) => c.homeAway === "away");
      if (!homeTeam || !awayTeam) return false;

      const homeNameNorm = normalize(homeTeam.team.name);
      const awayNameNorm = normalize(awayTeam.team.name);

      const localMatch = dbLocalNorm.includes(homeNameNorm) || homeNameNorm.includes(dbLocalNorm);
      const visitanteMatch = dbVisitanteNorm.includes(awayNameNorm) || awayNameNorm.includes(dbVisitanteNorm);
      
      return localMatch && visitanteMatch;
    });

    if (!matchEvent) {
      return NextResponse.json({ error: "No se encontró el partido en ESPN." }, { status: 404 });
    }

    const espnStatus = matchEvent.status.type.name;

    // Regla: solo se extrae el resultado como oficial cuando ESPN confirma que el
    // partido ya terminó. Antes de eso el marcador es provisional y puede cambiar,
    // así que no se debe usar para liquidar puntos.
    if (espnStatus !== "STATUS_FULL_TIME") {
      return NextResponse.json(
        {
          error: `El partido todavía no aparece finalizado en ESPN (estado: ${espnStatus}). Espera a que termine para extraer el resultado oficial.`,
          espnStatus,
        },
        { status: 409 }
      );
    }

    const competition = matchEvent.competitions[0];
    const homeTeam = competition.competitors.find((c: any) => c.homeAway === "home");
    const awayTeam = competition.competitors.find((c: any) => c.homeAway === "away");

    const golesLocal = parseInt(homeTeam.score, 10) || 0;
    const golesVisitante = parseInt(awayTeam.score, 10) || 0;

    // Buscar goleadores en summary
    const summaryController = new AbortController();
    const summaryTimeoutId = setTimeout(() => summaryController.abort(), 10000);
    const summaryRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/summary?event=${matchEvent.id}`, {
      signal: summaryController.signal
    });
    clearTimeout(summaryTimeoutId);
    
    const summaryData = await summaryRes.json();
    
    const goleadoresEncontradosIds: number[] = [];
    const logs: string[] = [];

    if (summaryData.keyEvents) {
      const goalEvents = summaryData.keyEvents.filter((ke: any) => ke.type?.type === "goal" || ke.scoringPlay);
      
      if (goalEvents.length > 0) {
        const jugadoresPartido = await prisma.jugador.findMany({
          where: { equipo_id: { in: [partido.equipo_local_id, partido.equipo_visitante_id] } }
        });

        for (const goal of goalEvents) {
          let playerName = goal.shortText || goal.text;
          if (!playerName) continue;

          // ESPN format: "Jorge Obregón Goal" or "Player Name (Team) Goal at 14'"
          playerName = playerName.replace(/ Goal.*/i, "").replace(/\(.*\)/g, "").trim();
          const parts = playerName.split(" ");
          const lastName = parts[parts.length - 1];
          
          const matchedJugador = jugadoresPartido.find(j => normalize(j.nombre).includes(normalize(lastName)));

          if (matchedJugador && !goleadoresEncontradosIds.includes(matchedJugador.id)) {
            goleadoresEncontradosIds.push(matchedJugador.id);
            logs.push(`Goleador ESPN: ${playerName} -> BD: ${matchedJugador.nombre}`);
          } else if (!matchedJugador) {
            logs.push(`No se pudo emparejar goleador ESPN: ${playerName}`);
          }
        }
      }
    }

    return NextResponse.json({
      golesLocal,
      golesVisitante,
      goleadoresIds: goleadoresEncontradosIds,
      logs,
      espnStatus: matchEvent.status.type.name
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
