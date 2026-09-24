import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const FALCAO_ID = 1256;

  console.log("=== Eliminando Radamel Falcao (ID 1256) de Millonarios ===\n");

  // 1. Ver qué predicciones lo referencian
  const preds = await prisma.prediccionPartido.findMany({
    where: { jugador_goleador_predicho_id: FALCAO_ID },
    select: { id: true, usuario_id: true, partido_id: true },
  });
  console.log(`Predicciones que lo referencian: ${preds.length}`);
  for (const p of preds) {
    console.log(`  Predicción ID ${p.id} (usuario ${p.usuario_id}, partido ${p.partido_id})`);
  }

  // 2. Nullificar la referencia al goleador (conserva el pronóstico de marcador)
  const updated = await prisma.prediccionPartido.updateMany({
    where: { jugador_goleador_predicho_id: FALCAO_ID },
    data: { jugador_goleador_predicho_id: null },
  });
  console.log(`\nPredicciones actualizadas (goleador → null): ${updated.count}`);

  // 3. Verificar que no queden más referencias
  const predInicial = await prisma.prediccionInicial.count({ where: { goleador_torneo_jugador_id: FALCAO_ID } });
  const goles = await prisma.resultadoGoleador.count({ where: { jugador_id: FALCAO_ID } });
  console.log(`Pred. iniciales restantes: ${predInicial} | Goles restantes: ${goles}`);

  if (predInicial > 0 || goles > 0) {
    console.log("\n❌ ABORTADO: Aún hay referencias. No se puede borrar seguro.");
    return;
  }

  // 4. Eliminar a Falcao
  await prisma.jugador.delete({ where: { id: FALCAO_ID } });
  console.log("\n✅ Radamel Falcao (ID 1256) eliminado de la BD.");

  const total = await prisma.jugador.count();
  console.log(`Total jugadores en BD ahora: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
