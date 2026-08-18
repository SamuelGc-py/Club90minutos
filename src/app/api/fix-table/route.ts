import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calcularPuntosPartido } from "@/lib/calculadorPuntos";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.puntaje.deleteMany();
    const resultadosOficiales = await prisma.resultadoOficial.findMany({
      include: { goleadores: true },
    });
    for (const ro of resultadosOficiales) {
      if (ro.goles_local_real !== null && ro.goles_visitante_real !== null) {
        const goleadoresIds =
          ro.goles_local_real + ro.goles_visitante_real === 0
            ? [-1]
            : ro.goleadores.map((g) => g.jugador_id);
        await calcularPuntosPartido(
          ro.partido_id,
          ro.goles_local_real,
          ro.goles_visitante_real,
          goleadoresIds,
          2
        );
      }
    }
    return NextResponse.json({ success: true, count: resultadosOficiales.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
