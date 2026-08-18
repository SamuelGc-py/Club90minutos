const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const p = await prisma.puntaje.count();
  console.log('Total puntajes en DB:', p);

  // Let's also check which matches have resultado_cargado
  const partidos = await prisma.partido.findMany({
    where: { estado: 'resultado_cargado' }
  });
  console.log('Partidos con resultado cargado:', partidos.map(p => `ID: ${p.id} J${p.jornada}`));

  await prisma.$disconnect();
}
run();
