require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const equipo = await prisma.equipo.findFirst({ where: { nombre: 'Cúcuta Deportivo' } });
  if (equipo) {
    const exists = await prisma.jugador.findFirst({
      where: { nombre: 'Léider Berdugo', equipo_id: equipo.id }
    });
    if (!exists) {
      await prisma.jugador.create({
        data: { nombre: 'Léider Berdugo', equipo_id: equipo.id }
      });
      console.log('Léider Berdugo añadido a Cúcuta Deportivo.');
    } else {
      console.log('Léider Berdugo ya existe en Cúcuta Deportivo.');
    }
  } else {
    console.log('No se encontró el equipo Cúcuta Deportivo.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
