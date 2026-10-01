const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const partidos = await prisma.partido.findMany({
    include: { equipo_local: true, equipo_visitante: true },
    where: {
      equipo_local: {
        nombre: {
          in: ['Fortaleza', 'Once Caldas DAF', 'Junior F.C.']
        }
      }
    }
  });
  console.log(partidos.map(p => `${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} | Fase: ${p.fase} | Jornada: ${p.jornada}`).join('\n'));
}

run().finally(() => prisma.$disconnect());
