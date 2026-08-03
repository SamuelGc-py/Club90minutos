require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Importar la función exacta de la app usando ts-node o la lógica directa
async function main() {
  const partidoId = 39; // Santa Fe vs Once Caldas DAF
  const golesLocalReal = 2;
  const golesVisitanteReal = 2;
  const goleadoresIds = [355, 376, 368, 359]; // Obrian, Zapata, Colorado, Correa
  const usuarioIdAdmin = 2; // Samuel Admin

  console.log(`Liquidador Oficial: Santa Fe 2 - 2 Once Caldas (Partido ID: ${partidoId})`);

  // 1. Determinar ganador o empate real
  let equipoGanadorId = null;
  const partido = await prisma.partido.findUnique({
    where: { id: partidoId },
  });

  if (!partido) {
    throw new Error("Partido no encontrado");
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

  // Guardar todos los goleadores
  await prisma.resultadoGoleador.deleteMany({
    where: { resultado_oficial_id: resultadoOficial.id },
  });

  if (goleadoresIds.length > 0) {
    await prisma.resultadoGoleador.createMany({
      data: goleadoresIds.map((jid) => ({
        resultado_oficial_id: resultadoOficial.id,
        jugador_id: jid,
      })),
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
    include: { usuario: true, jugador_goleador: true }
  });

  // Limpiar puntajes anteriores de este partido
  await prisma.puntaje.deleteMany({
    where: { partido_id: partidoId },
  });

  const realWinner = "empate";

  console.log(`\nProcesando ${predicciones.length} predicciones de los usuarios:`);

  for (const pred of predicciones) {
    const pLocal = pred.goles_local_predicho;
    const pVisitante = pred.goles_visitante_predicho;
    const predWinner = pLocal > pVisitante ? "local" : pVisitante > pLocal ? "visitante" : "empate";

    let ptsObtenidosUser = 0;
    let desglose = [];

    // 1. Acierto ganador / empate: 3 Pts
    if (predWinner === realWinner) {
      ptsObtenidosUser += 3;
      desglose.push("Empate (+3)");
      await prisma.puntaje.create({
        data: {
          usuario_id: pred.usuario_id,
          partido_id: partidoId,
          categoria: "ganador_partido",
          puntos_obtenidos: 3,
        },
      });
    }

    // 2. Acierto exacto adicional: 5 Pts
    if (pLocal === golesLocalReal && pVisitante === golesVisitanteReal) {
      ptsObtenidosUser += 5;
      desglose.push("Marcador Exacto (+5)");
      await prisma.puntaje.create({
        data: {
          usuario_id: pred.usuario_id,
          partido_id: partidoId,
          categoria: "resultado_exacto",
          puntos_obtenidos: 5,
        },
      });
    }

    // 3. Acierto goleador: 2 Pts
    if (
      pred.jugador_goleador_predicho_id &&
      goleadoresIds.includes(pred.jugador_goleador_predicho_id)
    ) {
      ptsObtenidosUser += 2;
      desglose.push(`Goleador (${pred.jugador_goleador?.nombre || 'OK'}) (+2)`);
      await prisma.puntaje.create({
        data: {
          usuario_id: pred.usuario_id,
          partido_id: partidoId,
          categoria: "goleador",
          puntos_obtenidos: 2,
        },
      });
    }

    console.log(`✅ ${pred.usuario.nombre_completo}: Predijo [${pLocal} - ${pVisitante}] -> Sumpo ${ptsObtenidosUser} pts [${desglose.join(', ') || 'Sin aciertos'}]`);
  }

  console.log('\n======================================================');
  console.log('      TABLA DE POSICIONES GENERAL DE LA POLLA');
  console.log('======================================================');
  
  const usuarios = await prisma.usuario.findMany({
    include: {
      puntajes: true
    }
  });

  const tabla = usuarios.map(u => {
    const totalPts = u.puntajes.reduce((acc, curr) => acc + curr.puntos_obtenidos, 0);
    const exactos = u.puntajes.filter(p => p.categoria === 'resultado_exacto').length;
    return {
      Participante: u.nombre_completo,
      Puntos: totalPts,
      Exactos: exactos
    };
  }).sort((a, b) => b.Puntos - a.Puntos || b.Exactos - a.Exactos);

  console.table(tabla);
}

main().catch(console.error).finally(() => prisma.$disconnect());
