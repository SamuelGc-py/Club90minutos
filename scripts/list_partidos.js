const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const partidos = await prisma.partido.findMany({
    include: { equipo_local: true, equipo_visitante: true },
    orderBy: { fecha_hora_partido: 'asc' }
  });
  console.log('TOTAL PARTIDOS:', partidos.length);
  partidos.forEach(p => {
    console.log(`ID: ${p.id} | Jornada: ${p.jornada} | Estado: ${p.estado} | Fecha: ${p.fecha_hora_partido.toISOString()} | ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
