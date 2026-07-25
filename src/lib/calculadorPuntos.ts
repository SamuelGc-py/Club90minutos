import { prisma } from "./db";
import { CategoriaPuntaje } from "@prisma/client";

export async function calcularPuntosPartido(
  partidoId: number,
  golesLocalReal: number,
  golesVisitanteReal: number,
  goleadorRealJugadorId: number | null,
  usuarioIdAdmin: number
) {
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

  // Si se envió goleador real, guardar en ResultadoGoleador
  if (goleadorRealJugadorId) {
    await prisma.resultadoGoleador.deleteMany({
      where: { resultado_oficial_id: resultadoOficial.id },
    });
    await prisma.resultadoGoleador.create({
      data: {
        resultado_oficial_id: resultadoOficial.id,
        jugador_id: goleadorRealJugadorId,
      },
    });
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

  // Limpiar puntajes anteriores de este partido para recalcular
  await prisma.puntaje.deleteMany({
    where: { partido_id: partidoId },
  });

  const realWinner = golesLocalReal > golesVisitanteReal ? "local" : golesVisitanteReal > golesLocalReal ? "visitante" : "empate";

  for (const pred of predicciones) {
    const pLocal = pred.goles_local_predicho;
    const pVisitante = pred.goles_visitante_predicho;
    const predWinner = pLocal > pVisitante ? "local" : pVisitante > pLocal ? "visitante" : "empate";

    // 1. Acierto ganador / empate: 3 Pts
    if (predWinner === realWinner) {
      await prisma.puntaje.create({
        data: {
          usuario_id: pred.usuario_id,
          partido_id: partidoId,
          categoria: CategoriaPuntaje.ganador_partido,
          puntos_obtenidos: 3,
        },
      });
    }

    // 2. Acierto exacto adicional: 5 Pts
    if (pLocal === golesLocalReal && pVisitante === golesVisitanteReal) {
      await prisma.puntaje.create({
        data: {
          usuario_id: pred.usuario_id,
          partido_id: partidoId,
          categoria: CategoriaPuntaje.resultado_exacto,
          puntos_obtenidos: 5,
        },
      });
    }

    // Acierto goleador: 2 Pts
    if (goleadorRealJugadorId && pred.jugador_goleador_predicho_id === goleadorRealJugadorId) {
      await prisma.puntaje.create({
        data: {
          usuario_id: pred.usuario_id,
          partido_id: partidoId,
          categoria: CategoriaPuntaje.goleador,
          puntos_obtenidos: 2,
        },
      });
    }
  }

  return { exito: true, totalPrediccionesLiquidadas: predicciones.length };
}
