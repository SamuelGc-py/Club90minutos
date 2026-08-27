const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const m = await prisma.puntaje.findMany({ where: { usuario_id: 32 } });
  console.log('Total Pedro Cantero in DB:', m.reduce((a, b) => a + b.puntos_obtenidos, 0));
}
main().finally(() => prisma.$disconnect());
