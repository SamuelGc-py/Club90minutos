const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetPredictions() {
  console.log("Borrando todas las predicciones y puntajes (limpieza total)...");

  // Borrar resultados oficiales y goleadores de resultados
  await prisma.resultadoGoleador.deleteMany({});
  await prisma.resultadoOficial.deleteMany({});

  // Borrar puntajes
  await prisma.puntaje.deleteMany({});

  // Borrar predicciones
  await prisma.prediccionPartido.deleteMany({});
  await prisma.prediccionClasificado.deleteMany({});
  await prisma.prediccionInicial.deleteMany({});
  
  // Borrar resultados torneo y clasificados oficiales (si existen)
  await prisma.clasificadoOficial.deleteMany({});
  await prisma.resultadoTorneo.deleteMany({});

  console.log("¡Todo borrado! Base de datos lista para ingresar desde cero.");
}

resetPredictions().catch(console.error).finally(() => prisma.$disconnect());
