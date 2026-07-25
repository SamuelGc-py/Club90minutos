const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMaestros() {
  const partidos = await prisma.partido.findMany({
    include: {
      equipo_local: {
        include: { jugadores: true }
      },
      equipo_visitante: {
        include: { jugadores: true }
      }
    },
    orderBy: { fecha_hora_partido: 'asc' }
  });

  console.log(`Cargados ${partidos.length} partidos correctamente.`);
  partidos.forEach(p => {
    console.log(`- ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} (Estado: ${p.estado})`);
  });
}

checkMaestros().catch(console.error).finally(() => prisma.$disconnect());
