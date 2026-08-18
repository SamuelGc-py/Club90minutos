const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.puntaje.deleteMany();
  console.log('Puntajes eliminados. La base de puntos será la tabla fija.');
  await prisma.$disconnect();
}
run();
