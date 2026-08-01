const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const nelson = await prisma.usuario.findFirst({
    where: { correo: { contains: 'nelson.berdugo', mode: 'insensitive' } }
  });
  console.log('Nelson ID:', nelson?.id, nelson?.nombre_completo);

  // 1. Tolima (Chino Sandoval)
  const tolPlayers = await prisma.jugador.findMany({
    where: { equipo: { nombre: { contains: 'Tolima' } } }
  });
  console.log('\nJUGADORES TOLIMA:');
  tolPlayers.forEach(j => console.log(`ID: ${j.id} | ${j.nombre}`));

  // 2. Medellín (Medina)
  const medPlayers = await prisma.jugador.findMany({
    where: { equipo: { nombre: { contains: 'Medellín' } } }
  });
  console.log('\nJUGADORES MEDELLÍN:');
  medPlayers.forEach(j => console.log(`ID: ${j.id} | ${j.nombre}`));

  // 3. Junior (Paiva)
  const junPlayers = await prisma.jugador.findMany({
    where: { equipo: { nombre: { contains: 'Junior' } } }
  });
  console.log('\nJUGADORES JUNIOR:');
  junPlayers.forEach(j => console.log(`ID: ${j.id} | ${j.nombre}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
