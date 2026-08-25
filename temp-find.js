const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const jugadores = await prisma.jugador.findMany({
    where: {
      OR: [
        { nombre: { contains: 'Bacca', mode: 'insensitive' } },
        { nombre: { contains: 'Bello', mode: 'insensitive' } }
      ]
    },
    include: { equipo: true }
  });
  console.log('Resultados de busqueda:');
  jugadores.forEach(j => {
    console.log('- ' + j.nombre + ' (ID: ' + j.id + ') -> Equipo: ' + j.equipo.nombre + ' (ID: ' + j.equipo.id + ')');
  });

  const todos = await prisma.jugador.findMany({ include: { equipo: true } });
  const map = new Map();
  const duplicados = [];
  for (const j of todos) {
    const key = j.nombre.toLowerCase().trim() + '-' + j.equipo_id;
    if (map.has(key)) {
      duplicados.push(j.nombre + ' en ' + j.equipo.nombre);
    } else {
      map.set(key, true);
    }
  }
  console.log('Duplicados encontrados en toda la DB:', duplicados.length === 0 ? 'NINGUNO' : duplicados);
}
main().catch(console.error).finally(() => prisma.$disconnect());
