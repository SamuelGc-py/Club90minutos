import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EstadoPartido } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { usuario_id, partido_id, jornada, fecha_hora_partido, estado, estadio } = await req.json();

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

    const partidoExistente = await prisma.partido.findUnique({
      where: { id: Number(partido_id) },
    });

    if (!partidoExistente) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    const data: { jornada?: number; jornada_original?: number | null; fecha_hora_partido?: Date; estado?: EstadoPartido; estadio?: string | null } = {};
    if (jornada !== undefined && jornada !== null && jornada !== "") {
      const nuevaJornada = Number(jornada);
      if (nuevaJornada !== partidoExistente.jornada) {
        data.jornada_original = partidoExistente.jornada_original ?? partidoExistente.jornada;
        data.jornada = nuevaJornada;
      }
    }
    if (fecha_hora_partido) data.fecha_hora_partido = new Date(fecha_hora_partido);
    if (estado) {
      data.estado = estado as EstadoPartido;
      if (estado === "aplazado") {
        if (partidoExistente.jornada_original) {
          data.jornada = partidoExistente.jornada_original;
          data.jornada_original = null;
        }
      } else if (estado === "programado" && partidoExistente.estado === "aplazado") {
        if (!partidoExistente.jornada_original) {
          data.jornada_original = partidoExistente.jornada;
        }
      }
    }
    if (estadio !== undefined && estadio !== null) data.estadio = String(estadio).trim() || null;

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
