import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenerTablaLiga, claveEquipo } from "@/lib/ligaEspn";

export const dynamic = "force-dynamic";

/**
 * Tabla de posiciones de la Liga BetPlay (ESPN) con la racha de los últimos 5 partidos.
 * Cada equipo trae además su `equipo_id` de nuestra base, para cruzarlo con los
 * partidos de la polla. Datos públicos y cacheados 20 minutos (ver src/lib/ligaEspn.ts).
 */
export async function GET() {
  try {
    const tabla = await obtenerTablaLiga();
    const equiposBD = await prisma.equipo.findMany({ select: { id: true, nombre: true } });
    const idPorClave = new Map(equiposBD.map((e) => [claveEquipo(e.nombre), e.id]));

    return NextResponse.json({
      ...tabla,
      equipos: tabla.equipos.map((e) => ({ ...e, equipo_id: idPorClave.get(claveEquipo(e.nombre)) ?? null })),
    });
  } catch (error: any) {
    console.error("Error en /api/liga/tabla:", error?.message);
    return NextResponse.json(
      { error: "No se pudo obtener la tabla de la liga en este momento. Intenta en unos minutos." },
      { status: 502 }
    );
  }
}
