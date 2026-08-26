import { PrismaClient } from '@prisma/client';
import { calcularPuntosPartido } from '../src/lib/calculadorPuntos';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando reliquidación de puntos...');
  
  // 1. Borrar todos los puntajes
  await prisma.puntaje.deleteMany();
  console.log('Todos los puntajes anteriores borrados.');

  // 2. Obtener todos los partidos liquidados
  const partidosLiquidados = await prisma.partido.findMany({
    where: { estado: 'resultado_cargado' },
    include: {
      resultado_oficial: {
        include: {
          goleadores: true
        }
      }
    }
  });

  console.log(`Encontrados ${partidosLiquidados.length} partidos para reliquidar.`);

  // 3. Reliquidar
  let count = 0;
  for (const partido of partidosLiquidados) {
    if (partido.resultado_oficial) {
      const ro = partido.resultado_oficial;
      const goleadoresIds = ro.goleadores.map(g => g.jugador_id === null ? -1 : g.jugador_id);
      
      await calcularPuntosPartido(
        partido.id,
        ro.goles_local_real,
        ro.goles_visitante_real,
        goleadoresIds,
        ro.ingresado_por_usuario_id || 1 // Admin ID 1
      );
      count++;
    }
  }

  console.log(`Reliquidación exitosa. ${count} partidos procesados y puntos sumados a la tabla.`);
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
