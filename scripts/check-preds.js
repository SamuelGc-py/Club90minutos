const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const preds = await prisma.prediccionPartido.findMany({
    include: {
      usuario: true,
      jugador_goleador: true,
      partido: {
        include: {
          equipo_local: true,
          equipo_visitante: true
        }
      }
    },
    orderBy: { partido_id: 'asc' }
  });

  console.log(`Total Predicciones: ${preds.length}`);
  
  const grouped = {};
  preds.forEach(p => {
    const match = `${p.partido.equipo_local.nombre} vs ${p.partido.equipo_visitante.nombre}`;
    if (!grouped[match]) grouped[match] = [];
    grouped[match].push({
      usuario: p.usuario.nombre_completo,
      pred: `${p.goles_local_predicho} - ${p.goles_visitante_predicho}`,
      goleador_id: p.jugador_goleador_id,
      goleador_predicho_id: p.jugador_goleador_predicho_id,
      goleador_real_nom: p.jugador_goleador ? p.jugador_goleador.nombre : null
    });
  });

  for (const [match, list] of Object.entries(grouped)) {
    console.log(`\n=== Partido: ${match} ===`);
    list.slice(0, 5).forEach(l => {
      console.log(`  Usuario: ${l.usuario} | Predicción: ${l.pred} | Goleador ID Predicho: ${l.goleador_predicho_id} | Nombre: ${l.goleador_real_nom}`);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
