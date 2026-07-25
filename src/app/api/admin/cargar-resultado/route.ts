import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calcularPuntosPartido } from "@/lib/calculadorPuntos";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { usuario_id, partido_id, goles_local, goles_visitante, goleador_jugador_id, goleadores_ids } = await req.json();

    if (!usuario_id || !partido_id || goles_local === undefined || goles_visitante === undefined) {
      return NextResponse.json({ error: "Faltan datos requeridos (usuario_id, partido_id, goles)" }, { status: 400 });
    }

    // Verificar permisos de administrador
    const admin = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
      include: { rol: true },
    });

    if (!admin || admin.rol.nombre !== "administrador") {
      return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });
    }

    const idsGoleadores: number[] = Array.isArray(goleadores_ids)
      ? goleadores_ids.map((id: any) => Number(id)).filter(Boolean)
      : goleador_jugador_id
      ? [Number(goleador_jugador_id)]
      : [];

    const resultado = await calcularPuntosPartido(
      Number(partido_id),
      Number(goles_local),
      Number(goles_visitante),
      idsGoleadores,
      Number(usuario_id)
    );

    return NextResponse.json({
      exito: true,
      mensaje: `Resultado oficial guardado y puntos calculados para ${resultado.totalPrediccionesLiquidadas} participantes.`,
    });
  } catch (error: any) {
    console.error("Error al cargar resultado oficial:", error);
    return NextResponse.json({ error: error.message || "Error al procesar resultado" }, { status: 500 });
  }
}
