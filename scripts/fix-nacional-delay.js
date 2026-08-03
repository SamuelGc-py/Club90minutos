const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p37 = await prisma.partido.update({
    where: { id: 37 },
    data: { estado: 'aplazado' }
  });
  console.log('Partido 37 (Jaguares vs Nacional) actualizado a aplazado:', p37);
}

main().finally(() => prisma.$disconnect());
