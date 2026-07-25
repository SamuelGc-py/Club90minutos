const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findLlanerosPlayers() {
  const players = await prisma.jugador.findMany({
    where: {
      OR: [
        { equipo: { nombre: { contains: 'Llaneros' } } },
        { equipo: { nombre: { contains: 'Pereira' } } }
      ]
    }
  });

  console.log("JUGADORES LLANEROS Y PEREIRA:", players.map(j => ({ id: j.id, nombre: j.nombre })));
}

findLlanerosPlayers().catch(console.error).finally(() => prisma.$disconnect());
