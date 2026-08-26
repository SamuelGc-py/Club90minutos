import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calcularPuntosPartido } from "@/lib/calculadorPuntos";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { usuario_id } = await req.json();

    if (!usuario_id) {
      return NextResponse.json({ error: "Falta usuario_id" }, { status: 400 });
    }

    const admin = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
      include: { rol: true },
    });

    if (!admin || admin.rol.nombre !== "administrador") {
      return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });
    }

    // 1. Borrar todos los puntajes
    await prisma.puntaje.deleteMany({
      where: { partido_id: { not: null } }
    });

    // 2. Obtener todos los partidos liquidados
    const partidosLiquidados = await prisma.partido.findMany({
      where: { estado: 'resultado_cargado' },
      include: {
        resultado_oficial: {
          include: {
            goleadores: true
          }
        }
      }
    });

    // 3. Reliquidar
    for (const partido of partidosLiquidados) {
      if (partido.resultado_oficial) {
        const ro = partido.resultado_oficial;
        const goleadoresIds = ro.goleadores.map(g => g.jugador_id === null ? -1 : g.jugador_id);
        
        await calcularPuntosPartido(
          partido.id,
          ro.goles_local_real,
          ro.goles_visitante_real,
          goleadoresIds,
          ro.ingresado_por_usuario_id || admin.id
        );
      }
    }

    return NextResponse.json({
      exito: true,
      mensaje: `Puntos reliquidados desde cero para ${partidosLiquidados.length} partidos.`
    });

  } catch (error: any) {
    console.error("Error al reliquidar todo:", error);
    return NextResponse.json({ error: error.message || "Error al reliquidar todo" }, { status: 500 });
  }
}
