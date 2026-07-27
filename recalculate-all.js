const { PrismaClient, CategoriaPuntaje } = require('@prisma/client');
const prisma = new PrismaClient();

async function calcularPuntosPartido(partidoId, golesLocalReal, golesVisitanteReal, goleadoresIds, usuarioIdAdmin) {
  let equipoGanadorId = null;

  const partido = await prisma.partido.findUnique({
    where: { id: partidoId },
  });

  if (!partido) return;

  if (golesLocalReal > golesVisitanteReal) {
    equipoGanadorId = partido.equipo_local_id;
  } else if (golesVisitanteReal > golesLocalReal) {
    equipoGanadorId = partido.equipo_visitante_id;
  }

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

  await prisma.partido.update({
    where: { id: partidoId },
    data: { estado: "resultado_cargado" },
  });

  const predicciones = await prisma.prediccionPartido.findMany({
    where: { partido_id: partidoId },
  });

  await prisma.puntaje.deleteMany({
    where: { partido_id: partidoId },
  });

  const realWinner = golesLocalReal > golesVisitanteReal ? "local" : golesVisitanteReal > golesLocalReal ? "visitante" : "empate";

  for (const pred of predicciones) {
    const pLocal = pred.goles_local_predicho;
    const pVisitante = pred.goles_visitante_predicho;
    const predWinner = pLocal > pVisitante ? "local" : pVisitante > pLocal ? "visitante" : "empate";

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

    if (
      pred.jugador_goleador_predicho_id &&
      goleadoresIds.includes(pred.jugador_goleador_predicho_id)
    ) {
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
}

async function recalculateAll() {
  const admin = await prisma.usuario.findFirst({ where: { rol_id: 2 } });
  const adminId = admin ? admin.id : 3;

  const resultados = await prisma.resultadoOficial.findMany({
    include: { goleadores: true }
  });

  console.log(`Encontrados ${resultados.length} resultados oficiales registrados.`);

  for (const res of resultados) {
    const goleadoresIds = res.goleadores.map(g => g.jugador_id);
    console.log(`Recalculando partido ID ${res.partido_id} (Goles: ${res.goles_local_real}-${res.goles_visitante_real})...`);
    await calcularPuntosPartido(
      res.partido_id,
      res.goles_local_real,
      res.goles_visitante_real,
      goleadoresIds,
      adminId
    );
  }

  console.log("\n=== RECALCULO DE PUNTOS FINALIZADO ===");

  const puntajes = await prisma.puntaje.findMany({
    include: { usuario: true }
  });

  const totales = {};
  for (const p of puntajes) {
    totales[p.usuario.nombre_completo] = (totales[p.usuario.nombre_completo] || 0) + p.puntos_obtenidos;
  }

  console.log("\n=== NUEVA TABLA DE POSICIONES EN BASE DE DATOS ===");
  console.log(totales);

  await prisma.$disconnect();
}

recalculateAll().catch(console.error);
