const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cutoffDate = new Date('2026-08-25T00:00:00.000Z');

  const puntosNuevos = await prisma.puntaje.findMany({
    where: {
      partido: { fecha_hora_partido: { gte: cutoffDate } }
    },
    include: { partido: { include: { equipo_local: true, equipo_visitante: true } } }
  });

  const porPartido = {};
  puntosNuevos.forEach(p => {
    const title = `${p.partido.equipo_local.nombre} vs ${p.partido.equipo_visitante.nombre}`;
    if (!porPartido[title]) porPartido[title] = { id: p.partido.id, total_pts: 0 };
    porPartido[title].total_pts += p.puntos_obtenidos;
  });

  console.log("Partidos de ayer/hoy y sus puntos totales repartidos:");
  console.log(porPartido);
}
main().finally(() => prisma.$disconnect());
