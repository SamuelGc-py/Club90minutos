const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const partidosConResultado = await prisma.partido.findMany({
    where: {
      resultado_oficial: { isNot: null }
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
    },
    orderBy: { fecha_hora_partido: 'asc' }
  });

  console.log("PARTIDOS CON RESULTADO OFICIAL EN LA BASE DE DATOS:", partidosConResultado.length);
  partidosConResultado.forEach(p => {
    const r = p.resultado_oficial;
    const golsGoleadores = r.goleadores.map(g => `${g.jugador.nombre} (${g.goles_marcados})`).join(', ');
    console.log(`[ID ${p.id} - Fecha ${p.jornada}] ${p.equipo_local.nombre} ${r.goles_local_real} - ${r.goles_visitante_real} ${p.equipo_visitante.nombre} | Goleadores: ${golsGoleadores || 'Ninguno'}`);
  });

  console.log("\nTOTAL DE REGISTROS EN TABLA PUNTAJE:", await prisma.puntaje.count());
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
