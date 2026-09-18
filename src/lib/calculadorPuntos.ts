import { prisma } from "./db";
import { CategoriaPuntaje } from "@prisma/client";

/**
 * Sentinela histórico para "gol sin goleador identificable" (autogol).
 * Se persiste como jugador_id = null y NO otorga puntos a nadie,
 * porque ningún participante puede pronosticar un autogol.
 */
const SENTINELA_AUTOGOL = -1;

export type GoleadoresInput = number[] | number | null | undefined;

/**
 * Normaliza la entrada de goleadores.
 * Devuelve `undefined` cuando el llamador NO envió información de goleadores,
 * lo que significa "no tocar los goleadores ya guardados".
 */
function normalizarGoleadores(entrada: GoleadoresInput): number[] | undefined {
  if (entrada === undefined || entrada === null) return undefined;
  if (Array.isArray(entrada)) {
    return entrada.map((id) => Number(id)).filter((id) => !Number.isNaN(id) && id !== 0);
  }
  const n = Number(entrada);
  return Number.isNaN(n) || n === 0 ? [] : [n];
}

export interface ResultadoLiquidacion {
  exito: boolean;
  totalPrediccionesLiquidadas: number;
  goleadoresAplicados: number[];
  goleadoresPreservados: boolean;
  advertencias: string[];
}

/**
 * Liquida un partido: guarda el resultado oficial, los goleadores y recalcula los Puntaje.
 *
 * GARANTÍAS ESTRUCTURALES (ver docs/incidente-puntos-goleadores-2026-09-18.md):
 *
 * 1. NO DESTRUCCIÓN IMPLÍCITA: si el llamador no envía goleadores (undefined), los
 *    goleadores ya guardados se preservan. Si envía una lista vacía para un partido
 *    CON goles que YA tenía goleadores, también se preservan (salvo forzarVaciarGoleadores).
 *    Esta es la causa raíz de la pérdida histórica de puntos de goleador.
 *
 * 2. FUENTE ÚNICA DE VERDAD: los puntos se calculan leyendo los goleadores YA PERSISTIDOS,
 *    nunca el parámetro recibido. Así el resultado no depende de lo que el llamador
 *    recordó pasar, y reliquidar dos veces siempre da lo mismo (idempotencia).
 *
 * 3. ATOMICIDAD TOTAL: resultado oficial + goleadores + estado del partido + puntajes se
 *    escriben en UNA sola transacción. Un fallo a mitad no puede dejar puntos borrados
 *    sin recrear (riesgo real de OOM en el hosting compartido).
 *
 * 4. DETECCIÓN DE GOLEADORES FANTASMA: registros con jugador_id = null en un partido con
 *    goles se reportan como advertencia; ese partido parece liquidado pero no puede
 *    otorgar puntos de goleador a nadie.
 */
export async function calcularPuntosPartido(
  partidoId: number,
  golesLocalReal: number,
  golesVisitanteReal: number,
  goleadorRealJugadorId: GoleadoresInput,
  usuarioIdAdmin: number | null,
  opciones: { forzarVaciarGoleadores?: boolean } = {}
): Promise<ResultadoLiquidacion> {
  const advertencias: string[] = [];
  const goleadoresEntrada = normalizarGoleadores(goleadorRealJugadorId);
  const hayGoles = golesLocalReal + golesVisitanteReal > 0;

  const partido = await prisma.partido.findUnique({ where: { id: partidoId } });
  if (!partido) throw new Error(`Partido ${partidoId} no encontrado`);

  let equipoGanadorId: number | null = null;
  if (golesLocalReal > golesVisitanteReal) equipoGanadorId = partido.equipo_local_id;
  else if (golesVisitanteReal > golesLocalReal) equipoGanadorId = partido.equipo_visitante_id;

  // Goleadores actualmente guardados (antes de tocar nada)
  const resultadoPrevio = await prisma.resultadoOficial.findUnique({
    where: { partido_id: partidoId },
    include: { goleadores: true },
  });
  const goleadoresPrevios = resultadoPrevio?.goleadores ?? [];
  const goleadoresPreviosValidos = goleadoresPrevios
    .map((g) => g.jugador_id)
    .filter((id): id is number => id !== null);

  // --- GARANTÍA 1: decidir si se reemplazan los goleadores o se preservan ---
  let reemplazarGoleadores = goleadoresEntrada !== undefined;
  let goleadoresPreservados = false;

  if (goleadoresEntrada === undefined) {
    goleadoresPreservados = goleadoresPrevios.length > 0;
  } else if (
    goleadoresEntrada.length === 0 &&
    hayGoles &&
    goleadoresPreviosValidos.length > 0 &&
    !opciones.forzarVaciarGoleadores
  ) {
    // Se pidió vaciar los goleadores de un partido con goles que sí los tenía:
    // es casi siempre un llamador que perdió el dato, no una decisión real.
    reemplazarGoleadores = false;
    goleadoresPreservados = true;
    advertencias.push(
      `Se preservaron ${goleadoresPreviosValidos.length} goleador(es) del partido ${partidoId}: ` +
        `se recibió una lista vacía para un partido con ${golesLocalReal + golesVisitanteReal} gol(es). ` +
        `Usa forzarVaciarGoleadores:true si de verdad quieres borrarlos.`
    );
  }

  // Validar que los jugadores enviados existan (evita FK rotas y "goleadores fantasma")
  let goleadoresAPersistir: number[] = [];
  if (reemplazarGoleadores && goleadoresEntrada && goleadoresEntrada.length > 0) {
    const idsReales = goleadoresEntrada.filter((id) => id !== SENTINELA_AUTOGOL);
    const existentes = idsReales.length
      ? await prisma.jugador.findMany({ where: { id: { in: idsReales } }, select: { id: true } })
      : [];
    const idsExistentes = new Set(existentes.map((j) => j.id));
    const inexistentes = idsReales.filter((id) => !idsExistentes.has(id));
    if (inexistentes.length > 0) {
      advertencias.push(
        `Ignorados ${inexistentes.length} goleador(es) inexistentes en la tabla jugador: ${inexistentes.join(", ")}`
      );
    }
    goleadoresAPersistir = goleadoresEntrada.filter(
      (id) => id === SENTINELA_AUTOGOL || idsExistentes.has(id)
    );
  }

  // --- GARANTÍA 3: todo en una sola transacción ---
  const totalPredicciones = await prisma.$transaction(
    async (tx) => {
      const resultadoOficial = await tx.resultadoOficial.upsert({
        where: { partido_id: partidoId },
        update: {
          goles_local_real: golesLocalReal,
          goles_visitante_real: golesVisitanteReal,
          equipo_ganador_id: equipoGanadorId,
          ingresado_por_usuario_id: usuarioIdAdmin,
          timestamp_ingreso: new Date(),
        },
        create: {
          partido_id: partidoId,
          goles_local_real: golesLocalReal,
          goles_visitante_real: golesVisitanteReal,
          equipo_ganador_id: equipoGanadorId,
          ingresado_por_usuario_id: usuarioIdAdmin,
        },
      });

      if (reemplazarGoleadores) {
        await tx.resultadoGoleador.deleteMany({
          where: { resultado_oficial_id: resultadoOficial.id },
        });
        if (goleadoresAPersistir.length > 0) {
          await tx.resultadoGoleador.createMany({
            data: goleadoresAPersistir.map((jid) => ({
              resultado_oficial_id: resultadoOficial.id,
              jugador_id: jid === SENTINELA_AUTOGOL ? null : jid,
              es_autogol: jid === SENTINELA_AUTOGOL,
            })),
          });
        }
      }

      await tx.partido.update({
        where: { id: partidoId },
        data: { estado: "resultado_cargado" },
      });

      // --- GARANTÍA 2: leer los goleadores REALMENTE persistidos ---
      const goleadoresPersistidos = await tx.resultadoGoleador.findMany({
        where: { resultado_oficial_id: resultadoOficial.id },
        select: { jugador_id: true },
      });
      const idsGoleadores = goleadoresPersistidos
        .map((g) => g.jugador_id)
        .filter((id): id is number => id !== null);

      const predicciones = await tx.prediccionPartido.findMany({
        where: { partido_id: partidoId },
      });

      const realWinner =
        golesLocalReal > golesVisitanteReal
          ? "local"
          : golesVisitanteReal > golesLocalReal
          ? "visitante"
          : "empate";

      const nuevosPuntajes: {
        usuario_id: number;
        partido_id: number;
        categoria: CategoriaPuntaje;
        puntos_obtenidos: number;
      }[] = [];

      for (const pred of predicciones) {
        const pLocal = pred.goles_local_predicho;
        const pVisitante = pred.goles_visitante_predicho;
        const predWinner = pLocal > pVisitante ? "local" : pVisitante > pLocal ? "visitante" : "empate";

        if (predWinner === realWinner) {
          nuevosPuntajes.push({
            usuario_id: pred.usuario_id,
            partido_id: partidoId,
            categoria: CategoriaPuntaje.ganador_partido,
            puntos_obtenidos: 3,
          });
        }

        if (pLocal === golesLocalReal && pVisitante === golesVisitanteReal) {
          nuevosPuntajes.push({
            usuario_id: pred.usuario_id,
            partido_id: partidoId,
            categoria: CategoriaPuntaje.resultado_exacto,
            puntos_obtenidos: 5,
          });
        }

        const acertoGoleador =
          pred.jugador_goleador_predicho_id !== null &&
          idsGoleadores.includes(pred.jugador_goleador_predicho_id);
        const acertoCeroCero =
          golesLocalReal === 0 &&
          golesVisitanteReal === 0 &&
          pLocal === 0 &&
          pVisitante === 0 &&
          !pred.jugador_goleador_predicho_id;

        if (acertoGoleador || acertoCeroCero) {
          nuevosPuntajes.push({
            usuario_id: pred.usuario_id,
            partido_id: partidoId,
            categoria: CategoriaPuntaje.goleador,
            puntos_obtenidos: 2,
          });
        }
      }

      // Solo se borran los puntajes DE ESTE PARTIDO; los ajustes de homologación
      // (partido_id = null) nunca se tocan.
      await tx.puntaje.deleteMany({ where: { partido_id: partidoId } });
      if (nuevosPuntajes.length > 0) {
        await tx.puntaje.createMany({ data: nuevosPuntajes });
      }

      return predicciones.length;
    },
    { timeout: 30000, maxWait: 15000 }
  );

  // --- GARANTÍA 4: avisar de goleadores fantasma ---
  const goleadoresFinales = await prisma.resultadoGoleador.findMany({
    where: { resultado_oficial: { partido_id: partidoId } },
    select: { jugador_id: true },
  });
  const validosFinales = goleadoresFinales
    .map((g) => g.jugador_id)
    .filter((id): id is number => id !== null);
  const fantasmas = goleadoresFinales.length - validosFinales.length;

  if (hayGoles && validosFinales.length === 0) {
    advertencias.push(
      `ATENCION: el partido ${partidoId} terminó ${golesLocalReal}-${golesVisitanteReal} pero no tiene ` +
        `ningún goleador válido registrado` +
        (fantasmas > 0 ? ` (${fantasmas} registro(s) fantasma con jugador_id nulo)` : "") +
        `. Nadie puede recibir puntos de goleador en este partido.`
    );
  }

  if (advertencias.length > 0) {
    console.warn(
      `[calcularPuntosPartido] partido ${partidoId}:\n  - ${advertencias.join("\n  - ")}`
    );
  }

  return {
    exito: true,
    totalPrediccionesLiquidadas: totalPredicciones,
    goleadoresAplicados: validosFinales,
    goleadoresPreservados,
    advertencias,
  };
}
