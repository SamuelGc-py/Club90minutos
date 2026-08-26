import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const preds = await prisma.prediccionInicial.findMany({
    include: {
      usuario: true,
      campeon: true,
      finalista_2: true,
      goleador_torneo: true
    }
  });
  console.log(JSON.stringify(preds, null, 2));
}

main().finally(() => prisma.$disconnect());
