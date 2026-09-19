// =============================================================================
// RESTAURAR PUNTOS Y GOLEADORES DESDE UN RESPALDO
// =============================================================================
//
// Vuelve la tabla `puntaje` (y opcionalmente `resultado_goleador`) al estado
// exacto guardado en una carpeta de backups/. Es el botón de "deshacer" de la
// homologación.
//
// USO:
//   npx tsx scripts/hotfixes/restaurar_puntos_backup.ts --dir backups/PRE-HOMOLOGACION-...           (dry-run)
//   npx tsx scripts/hotfixes/restaurar_puntos_backup.ts --dir backups/PRE-HOMOLOGACION-... --aplicar
//   ... --aplicar --con-goleadores    (además restaura resultado_goleador)
//
// Antes de escribir, guarda el estado ACTUAL en <dir>/_antes_de_restaurar/ para
// que la propia restauración también sea reversible.
// =============================================================================

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const APLICAR = process.argv.includes("--aplicar");
const CON_GOLEADORES = process.argv.includes("--con-goleadores");
const idxDir = process.argv.indexOf("--dir");
const DIR = idxDir >= 0 ? process.argv[idxDir + 1] : null;

interface PuntajeBackup {
  id: number;
  usuario_id: number;
  categoria: string;
  partido_id: number | null;
  puntos_obtenidos: number;
  timestamp_calculo?: string;
}

interface GoleadorBackup {
  id: number;
  resultado_oficial_id: number;
  jugador_id: number | null;
  es_autogol?: boolean;
}

async function main() {
  if (!DIR) {
    console.error("Falta --dir <carpeta del respaldo>. Ej: --dir backups/PRE-HOMOLOGACION-2026-09-19T13-30-21Z");
    process.exit(1);
  }
  const base = path.isAbsolute(DIR) ? DIR : path.join(process.cwd(), DIR);
  if (!fs.existsSync(base)) {
    console.error(`No existe la carpeta: ${base}`);
    process.exit(1);
  }

  console.log("=".repeat(78));
  console.log(APLICAR ? "MODO: APLICANDO RESTAURACIÓN" : "MODO: DRY-RUN (agrega --aplicar para escribir)");
  console.log(`Respaldo: ${base}`);
  console.log("=".repeat(78) + "\n");

  const meta = JSON.parse(fs.readFileSync(path.join(base, "_metadata.json"), "utf-8"));
  console.log("Motivo del respaldo:", meta.motivo);
  console.log("Registros:", JSON.stringify(meta.registros_por_tabla), "\n");

  const puntajes: PuntajeBackup[] = JSON.parse(fs.readFileSync(path.join(base, "puntaje.json"), "utf-8"));

  const actuales = await prisma.puntaje.count();
  console.log(`puntaje — ahora en la base: ${actuales} | en el respaldo: ${puntajes.length}`);

  const totalRespaldo = puntajes.reduce((a, c) => a + c.puntos_obtenidos, 0);
  const totalActual = (await prisma.puntaje.aggregate({ _sum: { puntos_obtenidos: true } }))._sum.puntos_obtenidos ?? 0;
  console.log(`puntos totales — ahora: ${totalActual} | respaldo: ${totalRespaldo}\n`);

  if (!APLICAR) {
    console.log("Dry-run: no se escribió nada. Agrega --aplicar para restaurar de verdad.");
    await prisma.$disconnect();
    return;
  }

  // Guardar el estado actual para que la restauración también sea reversible
  const dirAntes = path.join(base, "_antes_de_restaurar");
  fs.mkdirSync(dirAntes, { recursive: true });
  fs.writeFileSync(path.join(dirAntes, "puntaje.json"), JSON.stringify(await prisma.puntaje.findMany(), null, 1), "utf-8");
  fs.writeFileSync(
    path.join(dirAntes, "resultado_goleador.json"),
    JSON.stringify(await prisma.resultadoGoleador.findMany(), null, 1),
    "utf-8"
  );
  console.log(`Estado actual guardado en ${path.relative(process.cwd(), dirAntes)}/\n`);

  await prisma.$transaction(
    async (tx) => {
      await tx.puntaje.deleteMany({});
      // Se reinsertan con su id original para dejar la tabla idéntica al respaldo.
      for (const p of puntajes) {
        await tx.puntaje.create({
          data: {
            id: p.id,
            usuario_id: p.usuario_id,
            categoria: p.categoria as any,
            partido_id: p.partido_id,
            puntos_obtenidos: p.puntos_obtenidos,
            ...(p.timestamp_calculo ? { timestamp_calculo: new Date(p.timestamp_calculo) } : {}),
          },
        });
      }

      if (CON_GOLEADORES) {
        const goleadores: GoleadorBackup[] = JSON.parse(
          fs.readFileSync(path.join(base, "resultado_goleador.json"), "utf-8")
        );
        await tx.resultadoGoleador.deleteMany({});
        for (const g of goleadores) {
          await tx.resultadoGoleador.create({
            data: {
              id: g.id,
              resultado_oficial_id: g.resultado_oficial_id,
              jugador_id: g.jugador_id,
              es_autogol: g.es_autogol ?? false,
            },
          });
        }
        console.log(`resultado_goleador restaurado: ${goleadores.length} registros`);
      }
    },
    { timeout: 120000, maxWait: 20000 }
  );

  // Dejar las secuencias de autoincremento coherentes con los ids reinsertados
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('puntaje','id'), COALESCE((SELECT MAX(id) FROM puntaje), 1))`
  );
  if (CON_GOLEADORES) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('resultado_goleador','id'), COALESCE((SELECT MAX(id) FROM resultado_goleador), 1))`
    );
  }

  const final = await prisma.puntaje.count();
  const totalFinal = (await prisma.puntaje.aggregate({ _sum: { puntos_obtenidos: true } }))._sum.puntos_obtenidos ?? 0;
  console.log(`\nRestaurado: ${final} filas de puntaje, ${totalFinal} puntos totales.`);
  console.log(final === puntajes.length && totalFinal === totalRespaldo ? "COINCIDE con el respaldo." : "*** NO COINCIDE: revisar ***");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Error fatal:", e);
  await prisma.$disconnect();
  process.exit(1);
});
