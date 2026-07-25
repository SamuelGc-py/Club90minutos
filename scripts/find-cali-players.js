const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findCaliScorers() {
  const caliPlayers = await prisma.jugador.findMany({
    where: { equipo: { nombre: { contains: 'Cali' } } }
  });

  console.log("JUGADORES DEPORTIVO CALI EN DB:", caliPlayers.map(j => ({ id: j.id, nombre: j.nombre })));
}

findCaliScorers().catch(console.error).finally(() => prisma.$disconnect());
