import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { calcularPuntosPartido } from '../src/lib/calculadorPuntos';

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando restauración de puntos dinámicos...");
  // 1. Borrar todos los puntajes actuales para empezar limpios
  await prisma.puntaje.deleteMany();
  console.log("Puntajes actuales borrados.");

  // 2. Obtener todos los partidos que tienen resultado cargado
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

  console.log(`Encontrados ${partidosLiquidados.length} partidos con resultado cargado.`);

  // 3. Reliquidar cada uno
  for (const partido of partidosLiquidados) {
    if (partido.resultado_oficial) {
      const ro = partido.resultado_oficial;
      const goleadoresIds = ro.goleadores.map(g => g.jugador_id);
      
      console.log(`Reliquidando partido ${partido.id}...`);
      await calcularPuntosPartido(
        partido.id,
        ro.goles_local_real,
        ro.goles_visitante_real,
        goleadoresIds,
        ro.ingresado_por_usuario_id || 2 // fallback a admin
      );
    }
  }

  console.log("Restauración completada. La tabla vuelve a ser 100% dinámica.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
