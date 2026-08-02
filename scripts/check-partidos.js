const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const partidos = await prisma.partido.findMany({
    include: {
      equipo_local: true,
      equipo_visitante: true,
    },
    orderBy: [{ jornada: 'asc' }, { fecha_hora_partido: 'asc' }]
  });

  console.log('TODOS LOS PARTIDOS EN DB (' + partidos.length + '):');
  partidos.forEach(p => {
    console.log(`Jornada ${p.jornada} | ID ${p.id}: ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} | Fecha: ${p.fecha_hora_partido.toISOString()} | Estado: ${p.estado}`);
  });
}

main().finally(() => prisma.$disconnect());
