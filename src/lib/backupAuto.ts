import { prisma } from "@/lib/db";
import * as fs from "fs";
import * as path from "path";

/**
 * Genera un respaldo automático en disco (formato JSON) de las tablas críticas de la aplicación.
 * Se ejecuta automáticamente al cargar/editar el resultado de un partido o liquidar puntos.
 */
export async function generarBackupAutomatico(partidoId: number, motivo: string = "Carga de resultado de partido") {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dir = path.join(process.cwd(), "backups", `partido_${partidoId}_${timestamp}`);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const tablas: Record<string, () => Promise<any>> = {
      usuario: () => prisma.usuario.findMany(),
      puntaje: () => prisma.puntaje.findMany(),
      resultado_oficial: () => prisma.resultadoOficial.findMany({ include: { goleadores: true } }),
      prediccion_partido: () => prisma.prediccionPartido.findMany(),
      prediccion_inicial: () => prisma.prediccionInicial.findMany({ include: { clasificados: true } }),
      partido: () => prisma.partido.findMany(),
      jugador: () => prisma.jugador.findMany(),
    };

    const resumen: Record<string, number> = {};

    for (const [nombre, fetcher] of Object.entries(tablas)) {
      const datos = await fetcher();
      fs.writeFileSync(path.join(dir, `${nombre}.json`), JSON.stringify(datos, null, 2));
      resumen[nombre] = Array.isArray(datos) ? datos.length : 1;
    }

    fs.writeFileSync(
      path.join(dir, "_metadata.json"),
      JSON.stringify(
        {
          partido_id: partidoId,
          fecha_backup: new Date().toISOString(),
          motivo,
          registros_por_tabla: resumen,
        },
        null,
        2
      )
    );

    console.log(`[BACKUP AUTOMÁTICO OK] Guardado en: ${dir}`);
    return { exito: true, ruta: dir };
  } catch (error) {
    console.error("[BACKUP AUTOMÁTICO ERROR] No se pudo generar respaldo:", error);
    return { exito: false, error };
  }
}
