import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calcularPuntosPartido } from "@/lib/calculadorPuntos";

export const dynamic = "force-dynamic";

/**
 * Función sencilla para normalizar nombres y permitir cruces flexibles.
 * Por ejemplo: "C. Bacca" -> "bacca", "Atlético Nacional" -> "atleticonacional"
 */
function normalizeName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-z0-9]/g, "");      // quitar espacios y puntos
}

/**
 * Endpoint para ser llamado por un Cron Job (ej. desde Hostinger) cada 30 min.
 * Carga los partidos del día y busca sus equivalentes en ESPN.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Para seguridad, podrías requerir un token en el header si lo deseas. 
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const espnUrl = "https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard";
    const res = await fetch(espnUrl);
    const espnData = await res.json();

    if (!espnData.events || espnData.events.length === 0) {
      return NextResponse.json({ message: "No hay eventos en ESPN hoy." });
    }

    // Buscar partidos de nuestra BD programados para las últimas 24 horas y próximas 12 horas.
    const now = new Date();
    const ayer = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const manana = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    const partidosBD = await prisma.partido.findMany({
      where: {
        fecha_hora_partido: { gte: ayer, lt: manana },
        estado: { not: "puntaje_calculado" } // No actualizar los que ya terminaron y liquidaron
      },
      include: {
        equipo_local: true,
        equipo_visitante: true
      }
    });

    const resultados = [];

    for (const pBD of partidosBD) {
      const normLocalBD = normalizeName(pBD.equipo_local.nombre);
      const normVisitBD = normalizeName(pBD.equipo_visitante.nombre);

      // Buscar si algún evento de ESPN coincide
      const eventoEspn = espnData.events.find((ev: any) => {
        const match = ev.competitions[0];
        const hTeam = match.competitors.find((c: any) => c.homeAway === 'home');
        const aTeam = match.competitors.find((c: any) => c.homeAway === 'away');
        const normLocalEspn = normalizeName(hTeam.team.displayName || hTeam.team.name);
        const normVisitEspn = normalizeName(aTeam.team.displayName || aTeam.team.name);

        // Permitimos coincidencia parcial si el nombre está muy recortado
        const localMatch = normLocalBD.includes(normLocalEspn) || normLocalEspn.includes(normLocalBD);
        const visitMatch = normVisitBD.includes(normVisitEspn) || normVisitEspn.includes(normVisitBD);
        
        return localMatch && visitMatch;
      });

      if (eventoEspn) {
        const matchInfo = eventoEspn.competitions[0];
        const statusType = matchInfo.status.type.name; // STATUS_SCHEDULED, STATUS_IN_PROGRESS, STATUS_FULL_TIME, STATUS_POSTPONED
        
        const isFinished = statusType === 'STATUS_FULL_TIME';
        const hTeam = matchInfo.competitors.find((c: any) => c.homeAway === 'home');
        const aTeam = matchInfo.competitors.find((c: any) => c.homeAway === 'away');

        const golesLocal = parseInt(hTeam.score || "0");
        const golesVisitante = parseInt(aTeam.score || "0");

        // Intentar mapear los goleadores
        const goleadoresIds: number[] = [];
        if (matchInfo.details) {
          // Extraer jugadores de ambos equipos para buscar cruces
          const jugadoresBD = await prisma.jugador.findMany({
            where: {
              equipo_id: { in: [pBD.equipo_local_id, pBD.equipo_visitante_id] }
            }
          });

          for (const detail of matchInfo.details) {
            if (detail.scoringPlay && detail.type.text === 'Goal') {
              const playerNameEspn = detail.participants?.[0]?.athlete?.displayName;
              if (playerNameEspn) {
                // "C. Bacca" -> bacca. "carlos arturo bacca" -> carlosarturobacca
                // Si 'bacca' está contenido en 'carlosarturobacca', lo damos por válido.
                const normPlayerEspn = normalizeName(playerNameEspn);
                
                // Tratar de buscar coincidencia por apellido (la última palabra antes de normalizar)
                const partesNombre = playerNameEspn.split(' ');
                const apellido = normalizeName(partesNombre[partesNombre.length - 1]);

                const jugadorMatch = jugadoresBD.find(j => {
                  const normJ = normalizeName(j.nombre);
                  return normJ.includes(normPlayerEspn) || normJ.includes(apellido);
                });

                if (jugadorMatch && !goleadoresIds.includes(jugadorMatch.id)) {
                  goleadoresIds.push(jugadorMatch.id);
                }
              }
            }
          }
        }

        // Si el partido está finalizado en ESPN, guardamos y sumamos puntos.
        if (isFinished) {
          // El ID 1 se asume como admin de sistema automático.
          await calcularPuntosPartido(pBD.id, golesLocal, golesVisitante, goleadoresIds, 1);
          resultados.push({ id: pBD.id, estado: "FINALIZADO", marcador: `${golesLocal}-${golesVisitante}` });
        } else if (statusType === 'STATUS_IN_PROGRESS') {
          // Sólo actualizamos el ResultadoOficial pero NO calculamos puntos aún
          // Pasos 1, 2 y 3 manuales (sin sumar a PrediccionPartido)
          await prisma.resultadoOficial.upsert({
            where: { partido_id: pBD.id },
            update: { goles_local_real: golesLocal, goles_visitante_real: golesVisitante },
            create: { partido_id: pBD.id, goles_local_real: golesLocal, goles_visitante_real: golesVisitante }
          });
          
          await prisma.resultadoGoleador.deleteMany({ where: { partido_id: pBD.id } });
          for (const gId of goleadoresIds) {
            await prisma.resultadoGoleador.create({
              data: { partido_id: pBD.id, jugador_id: gId }
            });
          }
          await prisma.partido.update({ where: { id: pBD.id }, data: { estado: "en_curso" } });
          
          resultados.push({ id: pBD.id, estado: "EN_CURSO", marcador: `${golesLocal}-${golesVisitante}` });
        } else if (statusType === 'STATUS_POSTPONED' || statusType === 'STATUS_CANCELED') {
          await prisma.partido.update({ where: { id: pBD.id }, data: { estado: "aplazado" } });
          resultados.push({ id: pBD.id, estado: "APLAZADO" });
        }
      }
    }

    return NextResponse.json({ success: true, processed: resultados.length, resultados });
  } catch (error: any) {
    console.error("Error en cron ESPN:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
