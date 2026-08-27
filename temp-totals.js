const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const m = await prisma.puntaje.findMany({ include: { usuario: true } });
  const map = {};
  for (const p of m) {
    if (!map[p.usuario.nombre_completo]) map[p.usuario.nombre_completo] = 0;
    map[p.usuario.nombre_completo] += p.puntos_obtenidos;
  }
  console.log(map);
}
main().finally(() => prisma.$disconnect());
