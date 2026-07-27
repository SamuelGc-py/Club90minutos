const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function evaluateAllCorrect() {
  const samuel = await prisma.usuario.findFirst({ where: { correo: 'samucobaggg@gmail.com' } });
  
  const partidos = await prisma.partido.findMany({
    include: {
      resultado_oficial: {
        include: { goleadores: true }
      },
      equipo_local: true,
      equipo_visitante: true
    }
  });

  const preds = await prisma.prediccionPartido.findMany({
    where: { usuario_id: samuel.id }
  });

  const todosJugadores = await prisma.jugador.findMany();

  console.log("=== EVALUACIÓN CORRECTA DE PREDICCIONES DE SAMUEL ===");
  let totalPts = 0;

  for (const p of partidos) {
    if (!p.resultado_oficial) continue;
    const pred = preds.find(x => x.partido_id === p.id);
    if (!pred) continue;

    const res = p.resultado_oficial;
    const realLocal = res.goles_local_real;
    const realVis = res.goles_visitante_real;
    const predLocal = pred.goles_local_predicho;
    const predVis = pred.goles_visitante_predicho;

    let ptsResultadoExacto = 0; // 5 pts
    let ptsGanador = 0; // 3 pts
    let ptsGoleador = 0; // 2 pts

    // Check exact score
    if (predLocal === realLocal && predVis === realVis) {
      ptsResultadoExacto = 5;
    } else {
      // Check winner/draw
      const realWinner = realLocal > realVis ? 'local' : realVis > realLocal ? 'vis' : 'empate';
      const predWinner = predLocal > predVis ? 'local' : predVis > predLocal ? 'vis' : 'empate';
      if (realWinner === predWinner) {
        ptsGanador = 3;
      }
    }

    // Check scorer
    const predGoleadorObj = todosJugadores.find(j => j.id === pred.jugador_goleador_predicho_id);
    if (pred.jugador_goleador_predicho_id) {
      const gHit = res.goleadores.some(g => g.jugador_id === pred.jugador_goleador_predicho_id && !g.es_autogol);
      if (gHit) {
        ptsGoleador = 2;
      }
    }

    const partidoPts = ptsResultadoExacto + ptsGanador + ptsGoleador;
    totalPts += partidoPts;

    console.log(`Match ${p.id} (${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}):`);
    console.log(`  Predicho: ${predLocal}-${predVis} (goleador: ${predGoleadorObj?.nombre} [id: ${pred.jugador_goleador_predicho_id}])`);
    console.log(`  Real: ${realLocal}-${realVis} (goleadores_ids: ${res.goleadores.map(g => g.jugador_id).join(',')})`);
    console.log(`  Puntos: Exacto=${ptsResultadoExacto}, Ganador=${ptsGanador}, Goleador=${ptsGoleador} => Subtotal: ${partidoPts}`);
  }

  console.log("\nTOTAL CALCULADO CORRECTO PARA SAMUEL:", totalPts);

  await prisma.$disconnect();
}

evaluateAllCorrect().catch(console.error);
