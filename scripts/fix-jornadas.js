const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const allJ6 = await prisma.partido.findMany({where: {jornada: 6}, include: {equipo_local: true, equipo_visitante: true}});
  
  // Find which matches belong to Jornada 2 and 4 by checking the teams' previous fixtures
  console.log("J6 matches:");
  allJ6.forEach(m => console.log(`${m.id}: ${m.equipo_local.nombre} vs ${m.equipo_visitante.nombre}`));

  // Move 40 and 57
  const updated40 = await prisma.partido.update({where: {id: 40}, data: {jornada: 2}});
  const updated57 = await prisma.partido.update({where: {id: 57}, data: {jornada: 4}});
  
  console.log("Moved 40 to J2, 57 to J4");
  await prisma.$disconnect();
}
run();
