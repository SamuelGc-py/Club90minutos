// Restaura la tabla `puntaje` exactamente al estado guardado por scripts/backup-antes-correccion.ts.
// Úsalo SOLO si la corrección de categorías produjo un resultado incorrecto y quieres deshacerla.
//
// Uso:  npx tsx scripts/restaurar-backup.ts "backups/2026-08-25T20-00-00-000Z"

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const dirArg = process.argv[2];
  if (!dirArg) {
    console.error('Falta la ruta del backup. Uso: npx tsx scripts/restaurar-backup.ts "backups/<timestamp>"');
    process.exit(1);
  }

  const dir = path.isAbsolute(dirArg) ? dirArg : path.join(process.cwd(), dirArg);
  const puntajePath = path.join(dir, "puntaje.json");

  if (!fs.existsSync(puntajePath)) {
    console.error(`No encontré ${puntajePath}. ¿La ruta del backup es correcta?`);
    process.exit(1);
  }

  const puntajesBackup = JSON.parse(fs.readFileSync(puntajePath, "utf-8"));
  console.log(`Restaurando ${puntajesBackup.length} registros de puntaje desde ${puntajePath}...`);

  const actuales = await prisma.puntaje.count();
  console.log(`(La tabla puntaje tiene actualmente ${actuales} registros; serán reemplazados)`);

  await prisma.puntaje.deleteMany({});

  // Reinsertar preservando los IDs originales para no romper referencias.
  for (const p of puntajesBackup) {
    await prisma.puntaje.create({
      data: {
        id: p.id,
        usuario_id: p.usuario_id,
        categoria: p.categoria,
        partido_id: p.partido_id,
        puntos_obtenidos: p.puntos_obtenidos,
        timestamp_calculo: p.timestamp_calculo,
      },
    });
  }

  console.log(`Restauración completa. ${puntajesBackup.length} registros de puntaje restaurados.`);
}

main()
  .catch((e) => {
    console.error("Error restaurando backup:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
