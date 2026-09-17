import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { usuario_id, jugador_id } = await req.json();

    if (!usuario_id || !jugador_id) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (usuario_id, jugador_id)" },
        { status: 400 }
      );
    }

    // Verificar permisos de administrador
    const admin = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
      include: { rol: true },
    });

    if (!admin || admin.rol.nombre !== "administrador") {
      return NextResponse.json(
        { error: "No tienes permisos de administrador" },
        { status: 403 }
      );
    }

    const jugador = await prisma.jugador.findUnique({
      where: { id: Number(jugador_id) },
      include: {
        goles: true,
        predicciones_como_goleador: true,
        predicciones_goleador_torneo: true,
      },
    });

    if (!jugador) {
      return NextResponse.json(
        { error: "El jugador no existe o ya fue eliminado." },
        { status: 404 }
      );
    }

    if (
      jugador.goles.length > 0 ||
      jugador.predicciones_como_goleador.length > 0 ||
      jugador.predicciones_goleador_torneo.length > 0
    ) {
      return NextResponse.json(
        {
          error: `No se puede eliminar a "${jugador.nombre}" porque ya tiene goles oficiales o pronósticos registrados.`,
        },
        { status: 400 }
      );
    }

    await prisma.jugador.delete({
      where: { id: Number(jugador_id) },
    });

    return NextResponse.json({
      exito: true,
      mensaje: `Jugador "${jugador.nombre}" eliminado exitosamente.`,
    });
  } catch (error: any) {
    console.error("Error al eliminar jugador:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al eliminar jugador" },
      { status: 500 }
    );
  }
}
