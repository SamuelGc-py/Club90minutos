import { NextResponse } from "next/server";
// Usa la misma liquidación segura que el disparo automático (src/lib/liquidacionAutomatica.ts).
// Antes llamaba a syncLive.ts, que emparejaba goleadores por apellido "contenido".
import { dispararLiquidacionAutomatica } from "@/lib/liquidacionAutomatica";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secretoEsperado = process.env.SYNC_LIVE_SECRET;
  const { searchParams } = new URL(req.url);
  const secretoRecibido = req.headers.get("x-sync-secret") || searchParams.get("secret");

  if (!secretoEsperado || secretoRecibido !== secretoEsperado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const reporte = await dispararLiquidacionAutomatica(true);
    return NextResponse.json({
      exito: true,
      mensaje: `Partidos liquidados: ${reporte?.liquidados.length ?? 0}. Requieren revisión: ${reporte?.requierenRevision.length ?? 0}.`,
      reporte,
    });
  } catch (error: any) {
    console.error("Error al sincronizar resultados en vivo:", error);
    return NextResponse.json(
      { error: "Error al sincronizar." },
      { status: 500 }
    );
  }
}
