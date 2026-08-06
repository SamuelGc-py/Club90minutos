import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic"; // Siempre consulta datos frescos: ya se manda no-store en los headers, y el revalidate=30 de Next quedaba atascado en Hostinger tras ediciones manuales de partidos

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
        resultado_oficial: {
          include: {
            goleadores: {
              include: { jugador: true },
            },
          },
        },
      },
      orderBy: [
        { jornada: "asc" },
        { fecha_hora_partido: "asc" },
      ],
    });

    return NextResponse.json(
      {
        equipos,
        jugadores,
        partidos,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Error al obtener datos maestros:", error);
    return NextResponse.json(
      { error: "Error al consultar equipos y partidos: " + error.message },
      { status: 500 }
    );
  }
}
