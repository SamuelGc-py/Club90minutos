const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJornada() {
  const p5 = await prisma.partido.findMany({ 
    where: { id: { in: [40, 57] } }, 
    include: { equipo_local: true, equipo_visitante: true } 
  }); 
  console.log(p5.map(p => `[ID: ${p.id}] J${p.jornada}: ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} | ${p.fecha_hora_partido}`));

  const j5 = await prisma.partido.findMany({
    where: { jornada: 5 },
    orderBy: { fecha_hora_partido: 'asc' }
  });
  console.log(`Jornada 5 tiene ${j5.length} partidos.`);

  await prisma.$disconnect();
}
checkJornada();
