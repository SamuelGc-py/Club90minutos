import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calcularPuntosPartido } from "@/lib/calculadorPuntos";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.partido.updateMany({
      where: { jornada_original: { not: null } },
      data: { jornada_original: null }
    });

    // Solo se borran los puntajes ligados a partidos. Los ajustes de homologación
    // (partido_id = null) se conservan: no provienen de un partido recalculable.
    await prisma.puntaje.deleteMany({ where: { partido_id: { not: null } } });
    const resultadosOficiales = await prisma.resultadoOficial.findMany({
      include: { goleadores: true },
    });
    for (const ro of resultadosOficiales) {
      if (ro.goles_local_real !== null && ro.goles_visitante_real !== null) {
        try {
          // `undefined` = recalcular con los goleadores ya guardados, sin reescribirlos.
          await calcularPuntosPartido(
            ro.partido_id,
            ro.goles_local_real,
            ro.goles_visitante_real,
            undefined,
            2
          );
        } catch (err: any) {
          console.error(`Error on partido_id ${ro.partido_id}:`, err.message);
        }
      }
    }
    return NextResponse.json({ success: true, count: resultadosOficiales.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
