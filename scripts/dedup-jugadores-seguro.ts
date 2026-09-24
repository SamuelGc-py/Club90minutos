import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupDir = path.join(__dirname, "..", "backups", `backup-dedup-${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`=== BACKUP + DEDUPLICACIÓN SEGURA ===`);
  console.log(`Directorio de backup: ${backupDir}\n`);

  // ─── PASO 1: BACKUP COMPLETO ─────────────────────────────────
  console.log("--- PASO 1: Backup de tablas afectadas ---");

  const jugadores = await prisma.jugador.findMany({ include: { equipo: true } });
  fs.writeFileSync(path.join(backupDir, "jugador.json"), JSON.stringify(jugadores, null, 2));
  console.log(`  ✅ jugador: ${jugadores.length} registros`);

  const prediccionesPartido = await prisma.prediccionPartido.findMany();
  fs.writeFileSync(path.join(backupDir, "prediccion_partido.json"), JSON.stringify(prediccionesPartido, null, 2));
  console.log(`  ✅ prediccion_partido: ${prediccionesPartido.length} registros`);

  const prediccionesInicial = await prisma.prediccionInicial.findMany();
  fs.writeFileSync(path.join(backupDir, "prediccion_inicial.json"), JSON.stringify(prediccionesInicial, null, 2));
  console.log(`  ✅ prediccion_inicial: ${prediccionesInicial.length} registros`);

  const resultadoGoleador = await prisma.resultadoGoleador.findMany();
  fs.writeFileSync(path.join(backupDir, "resultado_goleador.json"), JSON.stringify(resultadoGoleador, null, 2));
  console.log(`  ✅ resultado_goleador: ${resultadoGoleador.length} registros`);

  console.log(`\n  📦 Backup completo guardado en: ${backupDir}\n`);

  // ─── PASO 2: ENCONTRAR DUPLICADOS ─────────────────────────────
  console.log("--- PASO 2: Identificación de duplicados exactos ---");

  function normalize(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  }

  const map = new Map<string, typeof jugadores>();
  for (const j of jugadores) {
    const key = `${j.equipo_id}::${normalize(j.nombre)}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(j);
  }

  const duplicados = [...map.entries()].filter(([, list]) => list.length > 1);
  console.log(`  Grupos de duplicados encontrados: ${duplicados.length}`);

  if (duplicados.length === 0) {
    console.log("  ✅ No hay duplicados. Nada que limpiar.");
    return;
  }

  // ─── PASO 3: REASIGNAR REFERENCIAS Y ELIMINAR SOBRANTES ──────
  console.log("\n--- PASO 3: Reasignación de referencias y limpieza ---");

  for (const [key, list] of duplicados) {
    // Elegir el "sobreviviente": el que tenga el ID más bajo (es el original)
    list.sort((a, b) => a.id - b.id);
    const sobreviviente = list[0];
    const sobrantes = list.slice(1);

    console.log(`\n  Jugador: "${sobreviviente.nombre}" (${sobreviviente.equipo.nombre})`);
    console.log(`  Sobreviviente: ID ${sobreviviente.id}`);
    console.log(`  Sobrantes a eliminar: ${sobrantes.map((j) => `ID ${j.id}`).join(", ")}`);

    for (const sobrante of sobrantes) {
      // 3a. Reasignar predicciones de partido (goleador predicho)
      const p1 = await prisma.prediccionPartido.updateMany({
        where: { jugador_goleador_predicho_id: sobrante.id },
        data: { jugador_goleador_predicho_id: sobreviviente.id },
      });
      if (p1.count > 0) console.log(`    → Reasignadas ${p1.count} predicciones de partido (ID ${sobrante.id} → ${sobreviviente.id})`);

      // 3b. Reasignar predicciones iniciales (goleador torneo)
      const p2 = await prisma.prediccionInicial.updateMany({
        where: { goleador_torneo_jugador_id: sobrante.id },
        data: { goleador_torneo_jugador_id: sobreviviente.id },
      });
      if (p2.count > 0) console.log(`    → Reasignadas ${p2.count} predicciones iniciales (ID ${sobrante.id} → ${sobreviviente.id})`);

      // 3c. Reasignar resultados de goleador
      const p3 = await prisma.resultadoGoleador.updateMany({
        where: { jugador_id: sobrante.id },
        data: { jugador_id: sobreviviente.id },
      });
      if (p3.count > 0) console.log(`    → Reasignados ${p3.count} goles registrados (ID ${sobrante.id} → ${sobreviviente.id})`);

      // 3d. Eliminar el jugador sobrante (ahora sin referencias)
      await prisma.jugador.delete({ where: { id: sobrante.id } });
      console.log(`    ✅ Eliminado jugador sobrante ID ${sobrante.id}`);
    }
  }

  // ─── VERIFICACIÓN FINAL ────────────────────────────────────────
  console.log("\n--- VERIFICACIÓN FINAL ---");
  const totalFinal = await prisma.jugador.count();
  console.log(`  Total jugadores en BD ahora: ${totalFinal}`);

  // Verificar que ya no hay duplicados
  const jugadoresPost = await prisma.jugador.findMany();
  const mapPost = new Map<string, number>();
  let dupsPost = 0;
  for (const j of jugadoresPost) {
    const key = `${j.equipo_id}::${normalize(j.nombre)}`;
    mapPost.set(key, (mapPost.get(key) || 0) + 1);
    if ((mapPost.get(key) || 0) > 1) dupsPost++;
  }
  console.log(`  Duplicados restantes: ${dupsPost}`);
  console.log(`\n✅ Deduplicación completada exitosamente. Backup disponible en:\n   ${backupDir}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
