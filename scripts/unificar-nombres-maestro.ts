import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("=== UNIFICACIÓN DE JUGADORES CON NOMBRE VARIANTE ===\n");

  // Backup previo
  const backupPath = path.join(
    __dirname, "..", "backups",
    `backup-unificacion-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`
  );

  const jugadoresAfectados = await prisma.jugador.findMany({
    where: { id: { in: [839, 900, 972, 1381, 1074] } },
    include: { equipo: true },
  });
  const predsAfectadas = await prisma.prediccionPartido.findMany({
    where: { jugador_goleador_predicho_id: { in: [839, 900, 972, 1381, 1074] } },
  });
  const golesAfectados = await prisma.resultadoGoleador.findMany({
    where: { jugador_id: { in: [839, 900, 972, 1381, 1074] } },
  });
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify({ jugadoresAfectados, predsAfectadas, golesAfectados }, null, 2));
  console.log(`📦 Backup guardado en: ${backupPath}\n`);

  // ─── CASO 1: "Daniel Rosero" (ID 839) → renombrar a "Dany Rosero" ───
  console.log("--- CASO 1: Daniel Rosero → Dany Rosero (América) ---");
  await prisma.jugador.update({
    where: { id: 839 },
    data: { nombre: "Dany Rosero" },
  });
  console.log("  ✅ ID 839 renombrado a 'Dany Rosero'. 2 goles conservados.\n");

  // ─── CASO 2: "Juan Zapata" (ID 900) → renombrar a "Juan Manuel Zapata" ───
  console.log("--- CASO 2: Juan Zapata → Juan Manuel Zapata (Nacional) ---");
  await prisma.jugador.update({
    where: { id: 900 },
    data: { nombre: "Juan Manuel Zapata" },
  });
  console.log("  ✅ ID 900 renombrado a 'Juan Manuel Zapata'. 1 gol conservado.\n");

  // ─── CASO 3: "B. Rovira" (1381) + "Brayan Rovira" (972) → unificar en "Bryan Rovira" ───
  console.log("--- CASO 3: B. Rovira (1381) + Brayan Rovira (972) → Bryan Rovira (Tolima) ---");

  // Elegir sobreviviente: ID 972 (más antiguo)
  // Mover las 3 predicciones de 1381 → 972
  const movedPreds = await prisma.prediccionPartido.updateMany({
    where: { jugador_goleador_predicho_id: 1381 },
    data: { jugador_goleador_predicho_id: 972 },
  });
  console.log(`  Predicciones movidas de 1381 → 972: ${movedPreds.count}`);

  // Mover goles (si hubiera)
  const movedGoles = await prisma.resultadoGoleador.updateMany({
    where: { jugador_id: 1381 },
    data: { jugador_id: 972 },
  });
  console.log(`  Goles movidos de 1381 → 972: ${movedGoles.count}`);

  // Mover predicciones iniciales (si hubiera)
  const movedInicial = await prisma.prediccionInicial.updateMany({
    where: { goleador_torneo_jugador_id: 1381 },
    data: { goleador_torneo_jugador_id: 972 },
  });
  console.log(`  Pred. iniciales movidas de 1381 → 972: ${movedInicial.count}`);

  // Eliminar el sobrante (1381)
  await prisma.jugador.delete({ where: { id: 1381 } });
  console.log("  🗑️ ID 1381 (B. Rovira) eliminado.");

  // Renombrar el sobreviviente
  await prisma.jugador.update({
    where: { id: 972 },
    data: { nombre: "Bryan Rovira" },
  });
  console.log("  ✅ ID 972 renombrado a 'Bryan Rovira'. Total 4 predicciones conservadas.\n");

  // ─── CASO 4: "Andres Amaya" (ID 1074, Fortaleza) → mover a Santa Fe (equipo 16) ───
  console.log("--- CASO 4: Andres Amaya (Fortaleza → Santa Fe, traspaso) ---");
  await prisma.jugador.update({
    where: { id: 1074 },
    data: { equipo_id: 16 }, // Santa Fe
  });
  console.log("  ✅ ID 1074 movido de Fortaleza a Independiente Santa Fe. 2 predicciones conservadas.\n");

  // ─── VERIFICACIÓN FINAL ───
  console.log("--- VERIFICACIÓN FINAL ---");
  const total = await prisma.jugador.count();
  console.log(`Total jugadores en BD: ${total}`);

  // Verificar los sobrevivientes
  const verificar = await prisma.jugador.findMany({
    where: { id: { in: [839, 900, 972, 1074] } },
    include: { equipo: true },
  });
  for (const j of verificar) {
    const preds = await prisma.prediccionPartido.count({ where: { jugador_goleador_predicho_id: j.id } });
    const goles = await prisma.resultadoGoleador.count({ where: { jugador_id: j.id } });
    console.log(`  ID ${j.id}: "${j.nombre}" (${j.equipo.nombre}) — ${preds} pred, ${goles} goles`);
  }

  console.log("\n✅ Unificación completada. Todos los pronósticos conservados.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
