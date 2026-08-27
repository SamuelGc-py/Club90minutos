import { prisma } from "./db";
import { CategoriaPuntaje } from "@prisma/client";

export async function calcularPuntosPartido(
  partidoId: number,
  golesLocalReal: number,
  golesVisitanteReal: number,
  goleadorRealJugadorId: number[] | number | null,
  usuarioIdAdmin: number | null
) {
  // Normalizar a arreglo de IDs
  let goleadoresIds: number[] = [];
  if (Array.isArray(goleadorRealJugadorId)) {
    goleadoresIds = goleadorRealJugadorId.map((id) => Number(id)).filter(Boolean);
  } else if (goleadorRealJugadorId) {
    goleadoresIds = [Number(goleadorRealJugadorId)].filter(Boolean);
  }

  // 1. Determinar ganador o empate real
  let equipoGanadorId: number | null = null;

  const partido = await prisma.partido.findUnique({
    where: { id: partidoId },
  });

  if (!partido) {
    throw new Error("Partido no encontrado");
  }

  if (golesLocalReal > golesVisitanteReal) {
    equipoGanadorId = partido.equipo_local_id;
  } else if (golesVisitanteReal > golesLocalReal) {
    equipoGanadorId = partido.equipo_visitante_id;
  }

  // 2. Guardar / Actualizar ResultadoOficial
  const resultadoOficial = await prisma.resultadoOficial.upsert({
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

  // Guardar todos los goleadores en ResultadoGoleador
  await prisma.resultadoGoleador.deleteMany({
    where: { resultado_oficial_id: resultadoOficial.id },
  });

  if (goleadoresIds.length > 0) {
    const validPlayers = await prisma.jugador.findMany({
      where: { id: { in: goleadoresIds } },
      select: { id: true }
    });
    const validPlayerIds = validPlayers.map(p => p.id);
    const validGoleadoresIds = goleadoresIds.filter(id => validPlayerIds.includes(id) || id === -1);

    if (validGoleadoresIds.length > 0) {
      await prisma.resultadoGoleador.createMany({
        data: validGoleadoresIds.map((jid) => ({
          resultado_oficial_id: resultadoOficial.id,
          jugador_id: jid === -1 ? null : jid,
        })),
      });
    }
  }

  // 3. Cambiar el estado del partido a resultado_cargado
  await prisma.partido.update({
    where: { id: partidoId },
    data: { estado: "resultado_cargado" },
  });

  // 4. Buscar todas las predicciones registradas para este partido
  const predicciones = await prisma.prediccionPartido.findMany({
    where: { partido_id: partidoId },
  });

  const realWinner = golesLocalReal > golesVisitanteReal ? "local" : golesVisitanteReal > golesLocalReal ? "visitante" : "empate";

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

    // 1. Acierto ganador / empate: 3 Pts
    if (predWinner === realWinner) {
      nuevosPuntajes.push({
        usuario_id: pred.usuario_id,
        partido_id: partidoId,
        categoria: CategoriaPuntaje.ganador_partido,
        puntos_obtenidos: 3,
      });
    }

    // 2. Acierto exacto adicional: 5 Pts
    if (pLocal === golesLocalReal && pVisitante === golesVisitanteReal) {
      nuevosPuntajes.push({
        usuario_id: pred.usuario_id,
        partido_id: partidoId,
        categoria: CategoriaPuntaje.resultado_exacto,
        puntos_obtenidos: 5,
      });
    }

    // 3. Acierto goleador: 2 Pts si predijo a cualquiera de los goleadores reales del partido,
    // O si pronosticó 0-0 (jugador_goleador_predicho_id es null) y el partido terminó 0-0 (sin goleadores oficiales)
    const acertoGoleadorNormal = pred.jugador_goleador_predicho_id && goleadoresIds.includes(pred.jugador_goleador_predicho_id);
    const acertoCeroCero = (golesLocalReal === 0 && golesVisitanteReal === 0) && (pLocal === 0 && pVisitante === 0) && (!pred.jugador_goleador_predicho_id || pred.jugador_goleador_predicho_id === -1);
    
    if (acertoGoleadorNormal || acertoCeroCero) {
      nuevosPuntajes.push({
        usuario_id: pred.usuario_id,
        partido_id: partidoId,
        categoria: CategoriaPuntaje.goleador,
        puntos_obtenidos: 2,
      });
    }
  }

  // Limpiar puntajes anteriores e insertar los nuevos de forma atómica: si algo falla
  // a mitad de camino, no queda el partido con puntajes borrados y sin recrear.
  await prisma.$transaction([
    prisma.puntaje.deleteMany({ where: { partido_id: partidoId } }),
    ...(nuevosPuntajes.length > 0 ? [prisma.puntaje.createMany({ data: nuevosPuntajes })] : []),
  ]);

  return { exito: true, totalPrediccionesLiquidadas: predicciones.length };
}
