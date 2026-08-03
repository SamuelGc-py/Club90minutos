require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const partidos = await prisma.partido.findMany({
    where: {
      OR: [
        { equipo_local: { nombre: { contains: 'Santa Fe', mode: 'insensitive' } } },
        { equipo_visitante: { nombre: { contains: 'Santa Fe', mode: 'insensitive' } } }
      ]
    },
    include: {
      equipo_local: true,
      equipo_visitante: true,
      resultado_oficial: {
        include: {
          goleadores: {
            include: { jugador: true }
          }
        }
      }
    }
  });

  console.log('Partidos de Santa Fe:');
  partidos.forEach(p => {
    console.log(`ID: ${p.id} | Fecha ${p.jornada} | ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} | Estado: ${p.estado}`);
    if (p.resultado_oficial) {
      console.log(`   Resultado Oficial: ${p.resultado_oficial.goles_local} - ${p.resultado_oficial.goles_visitante}`);
      console.log(`   Goleadores:`, p.resultado_oficial.goleadores.map(g => g.jugador.nombre).join(', '));
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
