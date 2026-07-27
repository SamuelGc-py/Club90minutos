const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cargarResultadoOficialAmerica() {
  const partido27 = await prisma.partido.findUnique({
    where: { id: 27 },
    include: { equipo_local: true, equipo_visitante: true }
  });

  if (!partido27) {
    console.error("Partido 27 no encontrado");
    return;
  }

  const admin = await prisma.usuario.findFirst({
    where: { rol: { nombre: 'administrador' } }
  });

  const golesLocalReal = 0;
  const golesVisitanteReal = 2; // Internacional 0 - 2 América de Cali
  const goleadoresIds = [328, 319]; // Jhon Palacios (328), Yeison Guzmán (319)
  const equipoGanadorId = partido27.equipo_visitante_id; // América de Cali (14)

  // 1. Upsert ResultadoOficial
  const resultadoOficial = await prisma.resultadoOficial.upsert({
    where: { partido_id: 27 },
    update: {
      goles_local_real: golesLocalReal,
      goles_visitante_real: golesVisitanteReal,
      equipo_ganador_id: equipoGanadorId,
      ingresado_por_usuario_id: admin.id,
      timestamp_ingreso: new Date(),
    },
    create: {
      partido_id: 27,
      goles_local_real: golesLocalReal,
      goles_visitante_real: golesVisitanteReal,
      equipo_ganador_id: equipoGanadorId,
      ingresado_por_usuario_id: admin.id,
    },
  });

  // 2. Refresh ResultadoGoleador
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

  // 3. Estado -> resultado_cargado
  await prisma.partido.update({
    where: { id: 27 },
    data: { estado: "resultado_cargado" },
  });

  // 4. Recalcular puntos
  const predicciones = await prisma.prediccionPartido.findMany({
    where: { partido_id: 27 },
  });

  await prisma.puntaje.deleteMany({
    where: { partido_id: 27 },
  });

  const realWinner = "visitante";

  for (const pred of predicciones) {
    const pLocal = pred.goles_local_predicho;
    const pVisitante = pred.goles_visitante_predicho;
    const predWinner = pLocal > pVisitante ? "local" : pVisitante > pLocal ? "visitante" : "empate";

    if (predWinner === realWinner) {
      await prisma.puntaje.create({
        data: {
          usuario_id: pred.usuario_id,
          partido_id: 27,
          categoria: "ganador_partido",
          puntos_obtenidos: 3,
        },
      });
    }

    if (pLocal === golesLocalReal && pVisitante === golesVisitanteReal) {
      await prisma.puntaje.create({
        data: {
          usuario_id: pred.usuario_id,
          partido_id: 27,
          categoria: "resultado_exacto",
          puntos_obtenidos: 5,
        },
      });
    }

    if (pred.jugador_goleador_predicho_id && goleadoresIds.includes(pred.jugador_goleador_predicho_id)) {
      await prisma.puntaje.create({
        data: {
          usuario_id: pred.usuario_id,
          partido_id: 27,
          categoria: "goleador",
          puntos_obtenidos: 2,
        },
      });
    }
  }

  console.log("✅ RESULTADO INTERNACIONAL 0 - 2 AMÉRICA CARGADO OK.");

  const puntajesGenerados = await prisma.puntaje.findMany({
    where: { partido_id: 27 },
    include: { usuario: true }
  });

  console.log("\nDesglose de puntos otorgados con 0 - 2:");
  puntajesGenerados.forEach(p => {
    console.log(`- ${p.usuario.nombre_completo}: +${p.puntos_obtenidos} Pts (${p.categoria})`);
  });
}

cargarResultadoOficialAmerica()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


