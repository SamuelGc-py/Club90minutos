const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cargarResultadoOficialBucaramanga() {
  const partido31 = await prisma.partido.findUnique({
    where: { id: 31 },
    include: { equipo_local: true, equipo_visitante: true }
  });

  if (!partido31) {
    console.error("Partido 31 no encontrado");
    return;
  }

  const admin = await prisma.usuario.findFirst({
    where: { rol: { nombre: 'administrador' } }
  });

  const golesLocalReal = 1; // Bucaramanga 1
  const golesVisitanteReal = 1; // Llaneros 1
  const goleadoresIds = [13, 257]; // Fabian Sambueza (13), Francisco Meza (257)
  const equipoGanadorId = null; // Empate

  // 1. Upsert ResultadoOficial
  const resultadoOficial = await prisma.resultadoOficial.upsert({
    where: { partido_id: 31 },
    update: {
      goles_local_real: golesLocalReal,
      goles_visitante_real: golesVisitanteReal,
      equipo_ganador_id: equipoGanadorId,
      ingresado_por_usuario_id: admin ? admin.id : 1,
      timestamp_ingreso: new Date(),
    },
    create: {
      partido_id: 31,
      goles_local_real: golesLocalReal,
      goles_visitante_real: golesVisitanteReal,
      equipo_ganador_id: equipoGanadorId,
      ingresado_por_usuario_id: admin ? admin.id : 1,
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

  // 3. Estado -> resultado_cargado (Finalizado sin calcular puntos)
  await prisma.partido.update({
    where: { id: 31 },
    data: { estado: "resultado_cargado" },
  });

  // 4. Limpiar cualquier puntaje asignado a este partido
  await prisma.puntaje.deleteMany({
    where: { partido_id: 31 },
  });

  console.log("✅ RESULTADO BUCARAMANGA 1 - 1 LLANEROS CARGADO COMO FINALIZADO (SIN SUMAR PUNTOS).");
}

cargarResultadoOficialBucaramanga()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
