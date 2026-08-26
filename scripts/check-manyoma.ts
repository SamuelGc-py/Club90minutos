import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const m = await prisma.jugador.findMany({ where: { nombre: { contains: 'Manyoma' } }, include: { equipo: true }});
  console.log(JSON.stringify(m, null, 2));
}
main().finally(() => prisma.$disconnect());
