const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p37 = await prisma.partido.update({
    where: { id: 37 },
    data: { estado: 'programado' }
  });
  console.log('Partido 37 (Jaguares vs Nacional) actualizado a programado:', p37);
}

main().finally(() => prisma.$disconnect());
