import { NextResponse } from "next/server";
import { secretoValido } from "@/lib/auth";
import { enviarRecordatoriosDelDia, recordatoriosActivos } from "@/lib/recordatorios";

export const dynamic = "force-dynamic";

/**
 * Recordatorio diario para un cron externo (respaldo del reloj interno).
 * GET ?secret=<CRON_SECRET o SYNC_LIVE_SECRET>. Respeta la hora (09:00) y el interruptor,
 * y nunca envía dos veces el mismo día a la misma persona.
 */
export async function GET(request: Request) {
  if (!secretoValido(request, ["CRON_SECRET", "SYNC_LIVE_SECRET"])) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!recordatoriosActivos()) return NextResponse.json({ exito: true, omitido: "Recordatorios apagados" });
  const reporte = await enviarRecordatoriosDelDia();
  return NextResponse.json({ exito: true, reporte });
}
