import { NextResponse } from "next/server";
import { sincronizarMarcadoresEnVivo } from "@/lib/syncLive";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const total = await sincronizarMarcadoresEnVivo();
    return NextResponse.json({
      exito: true,
      mensaje: `Partidos en vivo sincronizados (${total}).`,
    });
  } catch (error: any) {
    console.error("Error al sincronizar resultados en vivo:", error);
    return NextResponse.json(
      { error: "Error al sincronizar: " + error.message },
      { status: 500 }
    );
  }
}
