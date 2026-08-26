import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const predsPartidos = await prisma.prediccionPartido.findMany({
    orderBy: { timestamp_envio: 'desc' },
    take: 10
  });
  console.log(`Total predicciones: ${predsPartidos.length}`);
  console.log(JSON.stringify(predsPartidos, null, 2));
}

main().finally(() => prisma.$disconnect());
