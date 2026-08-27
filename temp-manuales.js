const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const m = await prisma.puntaje.findMany({ where: { partido_id: null }, include: { usuario: true } });
  console.log(m.map(p => ({ user: p.usuario.nombre_completo, diff: p.puntos_obtenidos })));
}
main().finally(() => prisma.$disconnect());
