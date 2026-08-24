import { prisma } from "@/lib/db";

export async function sincronizarMarcadoresEnVivo() {
  const res = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard",
    { cache: "no-store" }
  );
  const data = await res.json();
  const events = data.events || [];

  let actualizados = 0;
  const partidosDb = await prisma.partido.findMany({
    include: { equipo_local: true, equipo_visitante: true },
  });

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/f\.c\.|fc|d.a.f.|c.d./gi, "")
      .trim();

  for (const event of events) {
    const competition = event.competitions?.[0];
    if (!competition) continue;

    const homeTeam = competition.competitors?.find((c: any) => c.homeAway === "home");
    const awayTeam = competition.competitors?.find((c: any) => c.homeAway === "away");
    const status = event.status;

    if (!homeTeam || !awayTeam) continue;

    const homeNameNorm = normalize(homeTeam.team.name);
    const awayNameNorm = normalize(awayTeam.team.name);
    const eventDate = event.date ? new Date(event.date) : null;

    const partido = partidosDb.find((p) => {
      const dbLocalNorm = normalize(p.equipo_local.nombre);
      const dbVisitanteNorm = normalize(p.equipo_visitante.nombre);

      const localMatch = dbLocalNorm.includes(homeNameNorm) || homeNameNorm.includes(dbLocalNorm);
      const visitanteMatch = dbVisitanteNorm.includes(awayNameNorm) || awayNameNorm.includes(dbVisitanteNorm);
      if (!localMatch || !visitanteMatch) return false;

      // El mismo cruce de equipos puede repetirse en otra fase (ej. fase de grupos vs.
      // cuadrangulares). Exigir que la fecha del evento de ESPN coincida (±1 día) con la
      // fecha programada del partido evita actualizar el partido equivocado ya liquidado.
      if (eventDate) {
        const diffMs = Math.abs(eventDate.getTime() - new Date(p.fecha_hora_partido).getTime());
        const unDiaMs = 24 * 60 * 60 * 1000;
        if (diffMs > unDiaMs) return false;
      }

      return true;
    });

    if (!partido) continue;

    // Nunca sobrescribir un partido que el admin ya liquidó manualmente: el marcador
    // oficial y los Puntaje ya fueron calculados con esos valores.
    if (partido.estado === "resultado_cargado") continue;

    const golesLocalReal = parseInt(homeTeam.score || "0", 10);
    const golesVisitanteReal = parseInt(awayTeam.score || "0", 10);

    let equipoGanadorId: number | null = null;
    if (golesLocalReal > golesVisitanteReal) equipoGanadorId = partido.equipo_local_id;
    if (golesVisitanteReal > golesLocalReal) equipoGanadorId = partido.equipo_visitante_id;

    const statusCode = status?.type?.name;

    // Ignorar partidos programados que aún no inician
    if (statusCode === "STATUS_SCHEDULED" || statusCode === "STATUS_POSTPONED") continue;



    const esFinalizado = statusCode === "STATUS_FULL_TIME";
    const nuevoEstado = esFinalizado ? "resultado_cargado" : "resultado_pendiente";

    const admin = await prisma.usuario.findFirst({
      where: { rol: { nombre: "administrador" } },
    });
    const adminId = admin ? admin.id : 1;

    if (esFinalizado) {
      // 1. Extraer goleadores desde el summary de ESPN
      let goleadoresEncontradosIds: number[] = [];
      try {
        const summaryRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/summary?event=${event.id}`);
        const summaryData = await summaryRes.json();
        if (summaryData.keyEvents) {
          const goalEvents = summaryData.keyEvents.filter((ke: any) => ke.type?.type === "goal" || ke.scoringPlay);
          if (goalEvents.length > 0) {
            const jugadoresPartido = await prisma.jugador.findMany({
              where: { equipo_id: { in: [partido.equipo_local_id, partido.equipo_visitante_id] } }
            });
            for (const goal of goalEvents) {
              let playerName = goal.shortText || goal.text;
              if (!playerName) continue;
              playerName = playerName.replace(/ Goal.*/i, "").replace(/\(.*\)/g, "").trim();
              const parts = playerName.split(" ");
              const lastName = parts[parts.length - 1];
              const matchedJugador = jugadoresPartido.find(j => normalize(j.nombre).includes(normalize(lastName)));
              if (matchedJugador && !goleadoresEncontradosIds.includes(matchedJugador.id)) {
                goleadoresEncontradosIds.push(matchedJugador.id);
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error extrayendo goleadores en segundo plano para partido ${partido.id}:`, err);
      }

      // 2. Liquidar puntos automáticamente!
      // (calcularPuntosPartido guarda el resultado oficial, los goleadores, cambia el estado a resultado_cargado y calcula los puntos)
      const { calcularPuntosPartido } = await import("@/lib/calculadorPuntos");
      await calcularPuntosPartido(
        partido.id,
        golesLocalReal,
        golesVisitanteReal,
        goleadoresEncontradosIds,
        adminId
      );
    } else {
      // ÚNICAMENTE actualiza el Marcador Oficial temporal sin alterar ni liquidar puntos
      await prisma.resultadoOficial.upsert({
        where: { partido_id: partido.id },
        update: {
          goles_local_real: golesLocalReal,
          goles_visitante_real: golesVisitanteReal,
          equipo_ganador_id: equipoGanadorId,
          timestamp_ingreso: new Date(),
        },
        create: {
          partido_id: partido.id,
          goles_local_real: golesLocalReal,
          goles_visitante_real: golesVisitanteReal,
          equipo_ganador_id: equipoGanadorId,
          ingresado_por_usuario_id: adminId,
        },
      });

      await prisma.partido.update({
        where: { id: partido.id },
        data: { estado: nuevoEstado },
      });
    }

    actualizados++;
  }

  return actualizados;
}
