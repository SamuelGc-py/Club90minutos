import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get("usuario_id");

    if (!usuarioId) {
      return NextResponse.json(
        { error: "Se requiere usuario_id" },
        { status: 400 }
      );
    }

    // Verificar que el usuario exista y esté activo
    const usr = await prisma.usuario.findUnique({
      where: { id: Number(usuarioId) },
    });

    if (!usr || !usr.activo) {
      return NextResponse.json(
        { error: "Usuario no autorizado o inactivo" },
        { status: 403 }
      );
    }

    // Obtener todos los usuarios activos
    const usuarios = await prisma.usuario.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre_completo: true,
        correo: true,
      },
      orderBy: { nombre_completo: "asc" },
    });

    // Obtener todos los pronósticos de partidos
    const prediccionesPartidos = await prisma.prediccionPartido.findMany({
      include: {
        usuario: { select: { nombre_completo: true, correo: true } },
        partido: {
          include: {
            equipo_local: { select: { nombre: true } },
            equipo_visitante: { select: { nombre: true } },
          },
        },
        jugador_goleador: { select: { nombre: true } },
      },
      orderBy: [
        { usuario: { nombre_completo: "asc" } },
        { partido: { jornada: "asc" } },
      ],
    });

    // Obtener todas las predicciones iniciales (campeón, finalistas, clasificados)
    const prediccionesIniciales = await prisma.prediccionInicial.findMany({
      include: {
        usuario: { select: { nombre_completo: true, correo: true } },
        campeon: { select: { nombre: true } },
        finalista_1: { select: { nombre: true } },
        finalista_2: { select: { nombre: true } },
        goleador_torneo: { select: { nombre: true } },
        clasificados: {
          include: { equipo: { select: { nombre: true } } },
        },
      },
      orderBy: { usuario: { nombre_completo: "asc" } },
    });

    // Obtener puntajes de la base de datos
    const puntajes = await prisma.puntaje.findMany();

    // Estructurar la Tabla de Posiciones estilo afiche por participante
    const tablaPosicionesMap = new Map<number, {
      usuario_id: number;
      nombre_completo: string;
      correo: string;
      pts_campeon: number;
      pts_finalistas: number;
      pts_clasificados: number;
      pts_goleador_torneo: number;
      pts_resultado_exacto: number;
      pts_ganador_partido: number;
      pts_goleador_partido: number;
      pts_total: number;
    }>();

    for (const u of usuarios) {
      tablaPosicionesMap.set(u.id, {
        usuario_id: u.id,
        nombre_completo: u.nombre_completo,
        correo: u.correo,
        pts_campeon: 0,
        pts_finalistas: 0,
        pts_clasificados: 0,
        pts_goleador_torneo: 0,
        pts_resultado_exacto: 0,
        pts_ganador_partido: 0,
        pts_goleador_partido: 0,
        pts_total: 0,
      });
    }

    for (const p of puntajes) {
      const fila = tablaPosicionesMap.get(p.usuario_id);
      if (fila) {
        if (p.categoria === "campeon") fila.pts_campeon += p.puntos_obtenidos;
        else if (p.categoria === "finalistas") fila.pts_finalistas += p.puntos_obtenidos;
        else if (p.categoria === "clasificados_cuadrangulares") fila.pts_clasificados += p.puntos_obtenidos;
        else if (p.categoria === "goleador" && !p.partido_id) fila.pts_goleador_torneo += p.puntos_obtenidos;
        else if (p.categoria === "resultado_exacto") fila.pts_resultado_exacto += p.puntos_obtenidos;
        else if (p.categoria === "ganador_partido") fila.pts_ganador_partido += p.puntos_obtenidos;
        else if (p.categoria === "goleador" && p.partido_id) fila.pts_goleador_partido += p.puntos_obtenidos;

        fila.pts_total += p.puntos_obtenidos;
      }
    }

    const tablaPosiciones = Array.from(tablaPosicionesMap.values())
      .sort((a, b) => b.pts_total - a.pts_total)
      .map((item, index) => ({
        posicion: index + 1,
        ...item,
      }));

    return NextResponse.json({
      usuarios,
      tablaPosiciones,
      prediccionesPartidos,
      prediccionesIniciales,
    });
  } catch (error: any) {
    console.error("Error al obtener consolidados:", error);
    return NextResponse.json(
      { error: "Error al consultar consolidados: " + error.message },
      { status: 500 }
    );
  }
}
