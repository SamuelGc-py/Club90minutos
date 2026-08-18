const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cucuta = await prisma.equipo.findFirst({where: {nombre: 'Cúcuta Deportivo'}});
  if (cucuta) {
    const cucutaMatches = await prisma.partido.findMany({
      where: { OR: [{equipo_local_id: cucuta.id}, {equipo_visitante_id: cucuta.id}]},
      orderBy: {fecha_hora_partido: 'asc'},
      include: {equipo_local: true, equipo_visitante: true}
    });
    console.log(cucutaMatches.map(m => `ID: ${m.id} | J${m.jornada} | ${m.equipo_local.nombre} vs ${m.equipo_visitante.nombre} | ${m.fecha_hora_partido}`));
  }
  const llaneros = await prisma.equipo.findFirst({where: {nombre: 'Llaneros F.C.'}});
  if (llaneros) {
    const llanerosMatches = await prisma.partido.findMany({
      where: { OR: [{equipo_local_id: llaneros.id}, {equipo_visitante_id: llaneros.id}]},
      orderBy: {fecha_hora_partido: 'asc'},
      include: {equipo_local: true, equipo_visitante: true}
    });
    console.log(llanerosMatches.map(m => `ID: ${m.id} | J${m.jornada} | ${m.equipo_local.nombre} vs ${m.equipo_visitante.nombre} | ${m.fecha_hora_partido}`));
  }
  await prisma.$disconnect();
}
run();
