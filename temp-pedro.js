const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cutoffDate = new Date('2026-08-25T00:00:00.000Z');
  const pts = await prisma.puntaje.findMany({
    where: {
      usuario_id: 32,
      partido: { fecha_hora_partido: { gte: cutoffDate } }
    },
    include: { partido: { include: { equipo_local: true, equipo_visitante: true } } }
  });
  console.log(JSON.stringify(pts, null, 2));
}
main().finally(() => prisma.$disconnect());
