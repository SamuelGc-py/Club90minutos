const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJornada6() {
  const partidos = await prisma.partido.findMany({
    where: { jornada: 6 },
    include: {
      equipo_local: true,
      equipo_visitante: true
    },
    orderBy: { fecha_hora_partido: 'asc' }
  });

  console.log(`Partidos de la Jornada 6 (${partidos.length}):`);
  partidos.forEach(p => {
    console.log(`- [ID: ${p.id}] ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} | ${p.fecha_hora_partido} | Estado: ${p.estado}`);
  });
}

checkJornada6()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
