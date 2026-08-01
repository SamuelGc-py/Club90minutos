import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard",
      { cache: "no-store" }
    );
    const data = await res.json();
    const events = data.events || [];

    const listaPartidos: any[] = [];

    for (const event of events) {
      const comp = event.competitions?.[0];
      if (!comp) continue;

      const homeTeam = comp.competitors?.find((c: any) => c.homeAway === "home");
      const awayTeam = comp.competitors?.find((c: any) => c.homeAway === "away");
      const status = event.status;

      if (!homeTeam || !awayTeam) continue;

      const statusCode = status?.type?.name;
      const esEnVivo = statusCode === "STATUS_IN_PROGRESS" || statusCode === "STATUS_FIRST_HALF" || statusCode === "STATUS_SECOND_HALF" || statusCode === "STATUS_HALFTIME";
      const esFinalizado = statusCode === "STATUS_FULL_TIME";

      let statsObj: any = null;
      let keyEvents: any[] = [];

      // Si el partido está en vivo o recién terminado, consultar detalle en vivo (summary)
      if (event.id) {
        try {
          const sumRes = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/summary?event=${event.id}`,
            { cache: "no-store" }
          );
          const summary = await sumRes.json();

          // Extraer estadísticas del boxscore
          if (summary?.boxscore?.teams) {
            const homeBox = summary.boxscore.teams.find((t: any) => t.team?.id === homeTeam.team?.id) || summary.boxscore.teams[0];
            const awayBox = summary.boxscore.teams.find((t: any) => t.team?.id === awayTeam.team?.id) || summary.boxscore.teams[1];

            const getStat = (box: any, statName: string) => {
              const item = box?.statistics?.find((s: any) => s.name === statName);
              return item ? item.displayValue : "0";
            };

            statsObj = {
              posesionLocal: getStat(homeBox, "possessionPct") || "50%",
              posesionVisitante: getStat(awayBox, "possessionPct") || "50%",
              rematesLocal: getStat(homeBox, "shots") || "0",
              rematesVisitante: getStat(awayBox, "shots") || "0",
              rematesArcoLocal: getStat(homeBox, "shotsOnTarget") || "0",
              rematesArcoVisitante: getStat(awayBox, "shotsOnTarget") || "0",
              cornersLocal: getStat(homeBox, "wonCorners") || "0",
              cornersVisitante: getStat(awayBox, "wonCorners") || "0",
              faltasLocal: getStat(homeBox, "foulsCommitted") || "0",
              faltasVisitante: getStat(awayBox, "foulsCommitted") || "0",
              amarillasLocal: getStat(homeBox, "yellowCards") || "0",
              amarillasVisitante: getStat(awayBox, "yellowCards") || "0",
              rojasLocal: getStat(homeBox, "redCards") || "0",
              rojasVisitante: getStat(awayBox, "redCards") || "0",
            };
          }

          // Extraer incidencias (keyEvents)
          if (summary?.keyEvents) {
            keyEvents = summary.keyEvents.map((ke: any) => {
              const isGoal = ke.type?.type === "goal" || ke.scoringPlay;
              const isYellow = ke.type?.type === "yellow-card";
              const isRed = ke.type?.type === "red-card";
              const isSub = ke.type?.type === "substitution";

              let tipoStr = "evento";
              if (isGoal) tipoStr = "gol";
              else if (isYellow) tipoStr = "amarilla";
              else if (isRed) tipoStr = "roja";
              else if (isSub) tipoStr = "cambio";

              return {
                id: ke.id,
                minuto: ke.clock?.displayValue || `${Math.floor((ke.clock?.value || 0) / 60)}'`,
                tipo: tipoStr,
                texto: ke.shortText || ke.text,
                equipo: ke.team?.displayName || "",
              };
            });
          }
        } catch (err) {
          console.error("Error al obtener detalle de partido en vivo de ESPN:", err);
        }
      }

      listaPartidos.push({
        eventId: event.id,
        nombreEvento: event.name,
        estadio: event.venue?.displayName || "Liga BetPlay",
        fechaHora: event.date,
        equipoLocal: {
          nombre: homeTeam.team?.name || "Local",
          escudo: homeTeam.team?.logo,
          goles: parseInt(homeTeam.score || "0", 10),
        },
        equipoVisitante: {
          nombre: awayTeam.team?.name || "Visitante",
          escudo: awayTeam.team?.logo,
          goles: parseInt(awayTeam.score || "0", 10),
        },
        reloj: status?.displayClock || status?.type?.shortDetail || "",
        periodo: status?.period || 1,
        estadoDetail: status?.type?.detail || status?.type?.description || "Programado",
        esEnVivo,
        esFinalizado,
        estadisticas: statsObj,
        incidencias: keyEvents,
      });
    }

    return NextResponse.json({
      exito: true,
      partidos: listaPartidos,
    });
  } catch (error: any) {
    console.error("Error al consultar partidos en vivo:", error);
    return NextResponse.json(
      { error: "Error al consultar API en vivo: " + error.message },
      { status: 500 }
    );
  }
}
