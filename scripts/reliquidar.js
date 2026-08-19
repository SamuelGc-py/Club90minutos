const { PrismaClient, CategoriaPuntaje } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.usuario.findFirst({
    where: { rol: { nombre: 'administrador' } }
  });
  if (!admin) throw new Error("No admin user found");

  console.log("Reliquidando todos los partidos con resultado oficial...");

  const partidosConResultado = await prisma.partido.findMany({
    where: { resultado_oficial: { isNot: null } },
    include: {
      resultado_oficial: {
        include: { goleadores: true }
      }
    }
  });

  console.log(`Encontrados ${partidosConResultado.length} partidos con resultado_oficial.`);

  for (const partido of partidosConResultado) {
    const ro = partido.resultado_oficial;
    const goleadoresIds = ro.goleadores.map(g => g.jugador_id).filter(Boolean);
    const partidoId = partido.id;
    const golesLocalReal = ro.goles_local_real;
    const golesVisitanteReal = ro.goles_visitante_real;

    const predicciones = await prisma.prediccionPartido.findMany({
      where: { partido_id: partidoId },
    });

    const realWinner = golesLocalReal > golesVisitanteReal ? "local" : golesVisitanteReal > golesLocalReal ? "visitante" : "empate";

    const nuevosPuntajes = [];

    for (const pred of predicciones) {
      const pLocal = pred.goles_local_predicho;
      const pVisitante = pred.goles_visitante_predicho;
      const predWinner = pLocal > pVisitante ? "local" : pVisitante > pLocal ? "visitante" : "empate";

      // 1. Acierto ganador / empate: 3 Pts
      if (predWinner === realWinner) {
        nuevosPuntajes.push({
          usuario_id: pred.usuario_id,
          partido_id: partidoId,
          categoria: CategoriaPuntaje.ganador_partido,
          puntos_obtenidos: 3,
        });
      }

      // 2. Acierto exacto adicional: 5 Pts
      if (pLocal === golesLocalReal && pVisitante === golesVisitanteReal) {
        nuevosPuntajes.push({
          usuario_id: pred.usuario_id,
          partido_id: partidoId,
          categoria: CategoriaPuntaje.resultado_exacto,
          puntos_obtenidos: 5,
        });
      }

      // 3. Acierto goleador: 2 Pts si predijo a cualquiera de los goleadores reales del partido
      if (
        pred.jugador_goleador_predicho_id &&
        goleadoresIds.includes(pred.jugador_goleador_predicho_id)
      ) {
        nuevosPuntajes.push({
          usuario_id: pred.usuario_id,
          partido_id: partidoId,
          categoria: CategoriaPuntaje.goleador,
          puntos_obtenidos: 2,
        });
      }
    }

    await prisma.$transaction([
      prisma.puntaje.deleteMany({ where: { partido_id: partidoId } }),
      ...(nuevosPuntajes.length > 0 ? [prisma.puntaje.createMany({ data: nuevosPuntajes })] : []),
    ]);

    await prisma.partido.update({
      where: { id: partidoId },
      data: { estado: "resultado_cargado" }
    });
  }

  console.log("Reliquidacion completada exitosamente para todos los partidos con resultado oficial.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
