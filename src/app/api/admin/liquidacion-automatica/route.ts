import { NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/auth";
import { liquidacionAutomaticaActiva, ultimoReporte } from "@/lib/liquidacionAutomatica";

export const dynamic = "force-dynamic";

/** Estado de la liquidación automática y el reporte de la última revisión (no ejecuta nada). */
export async function GET(req: Request) {
  const auth = await requerirAdmin(req);
  if (auth.error) return auth.error;
  return NextResponse.json({ activa: liquidacionAutomaticaActiva(), ultimoReporte });
}
