import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.partido.findUnique({ where: { id: 92 } });
  console.log(JSON.stringify(p, null, 2));
}
main().finally(() => prisma.$disconnect());
