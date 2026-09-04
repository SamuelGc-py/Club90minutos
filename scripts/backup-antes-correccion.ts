// FASE 1 — BACKUP. Corre esto SIEMPRE antes de scripts/corregir-categorias-desde-maestro.ts.
// Exporta a JSON, sin tocar nada, todo lo que la corrección podría afectar:
// usuario, puntaje, resultado_oficial, resultado_goleador, prediccion_partido, prediccion_inicial.
//
// Uso:  npx tsx scripts/backup-antes-correccion.ts
//
// Restaurar un backup (si algo sale mal):
//   1. Abre el .json del backup que quieras restaurar (backups/<timestamp>/puntaje.json, etc.)
//   2. Para restaurar SOLO la tabla puntaje (la que toca la corrección):
//        npx tsx scripts/restaurar-backup.ts backups/<timestamp>
//   El script de restauración (abajo, en este mismo archivo por si prefieres correrlo aparte)
//   borra los puntaje actuales y los reemplaza exactamente por los del backup.

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(__dirname, "..", "backups", timestamp);
  fs.mkdirSync(dir, { recursive: true });

  console.log(`Creando backup en: ${dir}`);

  const tablas: Record<string, () => Promise<any>> = {
    usuario: () => prisma.usuario.findMany(),
    puntaje: () => prisma.puntaje.findMany(),
    resultado_oficial: () => prisma.resultadoOficial.findMany({ include: { goleadores: true } }),
    prediccion_partido: () => prisma.prediccionPartido.findMany(),
    prediccion_inicial: () => prisma.prediccionInicial.findMany({ include: { clasificados: true } }),
    partido: () => prisma.partido.findMany(),
  };

  const resumen: Record<string, number> = {};

  for (const [nombre, fetcher] of Object.entries(tablas)) {
    const datos = await fetcher();
    fs.writeFileSync(path.join(dir, `${nombre}.json`), JSON.stringify(datos, null, 2));
    resumen[nombre] = Array.isArray(datos) ? datos.length : 1;
    console.log(`  ✓ ${nombre}.json (${resumen[nombre]} registros)`);
  }

  fs.writeFileSync(
    path.join(dir, "_metadata.json"),
    JSON.stringify(
      {
        fecha_backup: new Date().toISOString(),
        motivo: "Backup previo a corrección de distribución de categorías (Fase 5, corregir-categorias-desde-maestro.ts)",
        registros_por_tabla: resumen,
      },
      null,
      2
    )
  );

  console.log(`\nBackup completo. Ubicación: ${dir}`);
  console.log(`Para restaurar la tabla puntaje desde este backup si algo sale mal:`);
  console.log(`  npx tsx scripts/restaurar-backup.ts "${dir}"`);
}

main()
  .catch((e) => {
    console.error("Error creando backup:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
