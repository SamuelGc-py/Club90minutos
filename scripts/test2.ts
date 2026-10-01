import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const p14 = await prisma.partido.findMany({ where: { jornada: 14 }});
  p14.forEach(x => {
    console.log(`J${x.jornada} orig: ${x.jornada_original}`);
  });

  const p13 = await prisma.partido.findMany({ where: { jornada: 13 }});
  p13.forEach(x => {
    console.log(`J${x.jornada} orig: ${x.jornada_original}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
