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

  // 4. Limpiar cualquier puntaje asignado a este partido (los puntos se gestionan manualmente)
  await prisma.puntaje.deleteMany({
    where: { partido_id: 27 },
  });

  console.log("✅ RESULTADO INTERNACIONAL 0 - 2 AMÉRICA CARGADO (PUNTOS REMOVIDOS PARA GESTIÓN MANUAL).");
}

cargarResultadoOficialAmerica()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



