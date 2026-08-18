const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const j2 = await prisma.partido.count({where: {jornada: 2}});
  const j4 = await prisma.partido.count({where: {jornada: 4}});
  console.log(`J2 matches: ${j2}, J4 matches: ${j4}`);
  await prisma.$disconnect();
}
run();
