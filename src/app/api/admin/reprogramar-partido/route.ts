import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EstadoPartido } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { usuario_id, partido_id, jornada, fecha_hora_partido, estado } = await req.json();

    if (!usuario_id || !partido_id) {
      return NextResponse.json({ error: "Faltan datos requeridos (usuario_id, partido_id)" }, { status: 400 });
    }

    const admin = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
      include: { rol: true },
    });

    if (!admin || admin.rol.nombre !== "administrador") {
      return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });
    }

    const data: { jornada?: number; fecha_hora_partido?: Date; estado?: EstadoPartido } = {};
    if (jornada !== undefined && jornada !== null && jornada !== "") data.jornada = Number(jornada);
    if (fecha_hora_partido) data.fecha_hora_partido = new Date(fecha_hora_partido);
    if (estado) data.estado = estado as EstadoPartido;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay cambios para guardar" }, { status: 400 });
    }

    await prisma.partido.update({
      where: { id: Number(partido_id) },
      data,
    });

    return NextResponse.json({ exito: true, mensaje: "Programación del partido actualizada." });
  } catch (error: any) {
    console.error("Error al reprogramar partido:", error);
    return NextResponse.json({ error: error.message || "Error al reprogramar el partido" }, { status: 500 });
  }
}
