const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const partidos = await prisma.partido.findMany({
    where: {
      fecha_hora_partido: {
        gte: new Date('2026-08-15T00:00:00.000Z'),
        lte: new Date('2026-08-22T23:59:59.000Z'),
      }
    },
    include: { equipo_local: true, equipo_visitante: true },
    orderBy: { fecha_hora_partido: 'asc' }
  });
  console.log('PARTIDOS ESTA SEMANA (Aug 15 - Aug 22):', partidos.length);
  partidos.forEach(p => {
    console.log(`ID: ${p.id} | Jornada: ${p.jornada} | Estado: ${p.estado} | Fecha: ${p.fecha_hora_partido.toISOString()} | ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
