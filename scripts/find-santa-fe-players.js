require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jugadores = await prisma.jugador.findMany({
    where: {
      OR: [
        { equipo: { nombre: { contains: 'Santa Fe', mode: 'insensitive' } } },
        { equipo: { nombre: { contains: 'Once Caldas', mode: 'insensitive' } } }
      ]
    },
    include: { equipo: true }
  });

  console.log('Jugadores de Santa Fe y Once Caldas en la BD:');
  jugadores.forEach(j => {
    console.log(`ID: ${j.id} | ${j.nombre} (${j.equipo.nombre})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
