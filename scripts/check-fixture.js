const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFixture() {
  const partidos = await prisma.partido.findMany({
    include: { equipo_local: true, equipo_visitante: true }
  });

  console.log("MATCHES IN DB:", partidos.map(p => ({ id: p.id, local: p.equipo_local.nombre, visitante: p.equipo_visitante.nombre, fecha: p.fecha_hora_partido, estado: p.estado })));
}

checkFixture().catch(console.error).finally(() => prisma.$disconnect());
