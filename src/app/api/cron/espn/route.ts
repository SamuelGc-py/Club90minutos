import { NextResponse } from "next/server";
import { secretoValido, obtenerSesion } from "@/lib/auth";
import { dispararLiquidacionAutomatica, ultimoReporte } from "@/lib/liquidacionAutomatica";

export const dynamic = "force-dynamic";

/**
 * Ejecuta YA la liquidación automática (sin esperar el intervalo de 10 minutos).
 * Para un cron externo (cron-job.org, cron de Hostinger) o para el administrador.
 *
 *   GET /api/cron/espn?secret=<CRON_SECRET o SYNC_LIVE_SECRET>
 *
 * La lógica vive en src/lib/liquidacionAutomatica.ts. Esta ruta antes tenía su
 * propia implementación, con un cruce de goleadores por "contiene" y sin autenticación.
 */
export async function GET(request: Request) {
  if (!secretoValido(request, ["CRON_SECRET", "SYNC_LIVE_SECRET"]) && !(await obtenerSesion(request))?.esAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const reporte = await dispararLiquidacionAutomatica(true);
    return NextResponse.json({ exito: true, reporte: reporte ?? ultimoReporte });
  } catch (error: any) {
    console.error("Error en cron/espn:", error?.message);
    return NextResponse.json({ error: "Error al liquidar" }, { status: 500 });
  }
}
