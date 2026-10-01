import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requerirAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Identidad tomada de la cookie de sesión, nunca del body (ver src/lib/auth.ts).
    const auth = await requerirAdmin(req);
    if (auth.error) return auth.error;
    const { usuario_id: _usuarioIdDelCliente, nombre, equipo_id } = await req.json();
    const usuario_id = auth.sesion.usuarioId;

    if (!usuario_id || !nombre || !equipo_id) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (usuario_id, nombre, equipo_id)" },
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

    const equipo = await prisma.equipo.findUnique({
      where: { id: Number(equipo_id) },
    });

    if (!equipo) {
      return NextResponse.json(
        { error: "El equipo seleccionado no existe" },
        { status: 404 }
      );
    }

    const nombreLimpio = String(nombre).trim();
    if (!nombreLimpio) {
      return NextResponse.json(
        { error: "El nombre del jugador no puede estar vacío" },
        { status: 400 }
      );
    }

    // Verificar si el jugador ya existe en ese equipo para evitar duplicados accidentales
    const existente = await prisma.jugador.findFirst({
      where: {
        nombre: { equals: nombreLimpio, mode: "insensitive" },
        equipo_id: Number(equipo_id),
      },
    });

    if (existente) {
      return NextResponse.json(
        { error: `El jugador "${nombreLimpio}" ya existe en la plantilla de ${equipo.nombre}.` },
        { status: 400 }
      );
    }

    const nuevoJugador = await prisma.jugador.create({
      data: {
        nombre: nombreLimpio,
        equipo_id: Number(equipo_id),
      },
      include: {
        equipo: true,
      },
    });

    return NextResponse.json({
      exito: true,
      jugador: nuevoJugador,
      mensaje: `Jugador "${nuevoJugador.nombre}" añadido exitosamente a ${nuevoJugador.equipo.nombre}.`,
    });
  } catch (error: any) {
    console.error("Error al crear jugador:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al crear jugador" },
      { status: 500 }
    );
  }
}
