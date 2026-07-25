const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetCali() {
  const partido = await prisma.partido.findFirst({
    where: { equipo_local: { nombre: { contains: 'Cali' } } }
  });

  if (!partido) return;

  // 1. Borrar resultado oficial de prueba
  await prisma.resultadoGoleador.deleteMany({
    where: { resultado_oficial: { partido_id: partido.id } }
  });
  await prisma.resultadoOficial.deleteMany({
    where: { partido_id: partido.id }
  });

  // 2. Borrar puntajes calculados de prueba
  await prisma.puntaje.deleteMany({
    where: { partido_id: partido.id }
  });

  // 3. Volver el estado a predicciones_abiertas
  await prisma.partido.update({
    where: { id: partido.id },
    data: { estado: 'predicciones_abiertas' }
  });

  console.log("✅ Partido Cali vs Jaguares restaurado perfectamente a 'predicciones_abiertas'.");
}

resetCali().catch(console.error).finally(() => prisma.$disconnect());
