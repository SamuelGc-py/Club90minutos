import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const equipos = await prisma.equipo.findMany({
      orderBy: { nombre: "asc" },
    });

    const jugadores = await prisma.jugador.findMany({
      include: {
        equipo: true,
      },
      orderBy: { nombre: "asc" },
    });

    const partidos = await prisma.partido.findMany({
      include: {
        equipo_local: {
          include: { jugadores: true },
        },
        equipo_visitante: {
          include: { jugadores: true },
        },
      },
      orderBy: [
        { fase: "asc" },
        { jornada: "asc" },
      ],
    });

    return NextResponse.json({
      equipos,
      jugadores,
      partidos,
    });
  } catch (error: any) {
    console.error("Error al obtener datos maestros:", error);
    return NextResponse.json(
      { error: "Error al consultar equipos y partidos: " + error.message },
      { status: 500 }
    );
  }
}
