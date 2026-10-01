import { NextResponse } from "next/server";
import { secretoValido, requerirAdmin } from "@/lib/auth";
import { dispararLiquidacionAutomatica, ultimoReporte } from "@/lib/liquidacionAutomatica";

export const dynamic = "force-dynamic";

/**
 * Ejecuta YA la liquidación automática (sin esperar el intervalo de 10 minutos).
 * La lógica vive en src/lib/liquidacionAutomatica.ts.
 *
 * GET  ?secret=<CRON_SECRET o SYNC_LIVE_SECRET>  → para un cron externo. Respeta el
 *      interruptor: si la liquidación automática está apagada, no hace nada.
 * POST con sesión de administrador → botón "Revisar ahora" del panel. Es POST para que
 *      no se pueda disparar con un simple enlace (la cookie viaja en GET desde otro sitio).
 */
export async function GET(request: Request) {
  if (!secretoValido(request, ["CRON_SECRET", "SYNC_LIVE_SECRET"])) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const reporte = await dispararLiquidacionAutomatica(true, false);
  return NextResponse.json({ exito: true, ejecutado: !!reporte, reporte: reporte ?? ultimoReporte });
}

export async function POST(request: Request) {
  const auth = await requerirAdmin(request);
  if (auth.error) return auth.error;
  try {
    const reporte = await dispararLiquidacionAutomatica(true, true);
    return NextResponse.json({ exito: true, reporte: reporte ?? ultimoReporte });
  } catch (error: any) {
    console.error("Error en cron/espn:", error?.message);
    return NextResponse.json({ error: "Error al liquidar" }, { status: 500 });
  }
}
