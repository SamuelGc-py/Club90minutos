const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bacca = await prisma.jugador.findMany({
    where: { nombre: { contains: 'Bacca', mode: 'insensitive' } },
    include: { equipo: true }
  });
  console.log('Bacca en DB:', JSON.stringify(bacca, null, 2));

  const cali = await prisma.equipo.findFirst({
    where: { nombre: { contains: 'Cali', mode: 'insensitive' } }
  });
  console.log('Cali en DB:', cali);

  const junior = await prisma.equipo.findFirst({
    where: { nombre: { contains: 'Junior', mode: 'insensitive' } }
  });
  console.log('Junior en DB:', junior);
}

main().finally(() => prisma.$disconnect());
