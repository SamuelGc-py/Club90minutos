import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TABLA_POSICIONES_FIJA } from "@/lib/tablaFija";

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

    const esAdmin = usr.rol_id === 2;
    const correosExcluidos = [
      "adminpollabetplay@gmail.com",
      "prueba.admin@pollabetplay.com",
      "pruebas@pollabetplay.com"
    ];

    // Obtener todos los usuarios participantes activos (excluyendo la cuenta del Administrador y cuentas de prueba)
    const usuarios = await prisma.usuario.findMany({
      where: {
        activo: true,
        NOT: {
          correo: { in: correosExcluidos },
        },
      },
      select: {
        id: true,
        nombre_completo: true,
        correo: true,
      },
      orderBy: { nombre_completo: "asc" },
    });

    // Obtener todos los pronósticos de partidos
    const prediccionesPartidos = await prisma.prediccionPartido.findMany({
      where: {
        usuario: {
          correo: { notIn: correosExcluidos },
        },
      },
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
        { partido: { fecha_hora_partido: "asc" } },
      ],
    });

    // Obtener todas las predicciones iniciales (campeón, finalistas, clasificados)
    const prediccionesIniciales = await prisma.prediccionInicial.findMany({
      where: {
        usuario: {
          correo: { notIn: correosExcluidos },
        },
      },
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
      // Buscar si el usuario tiene puntos base en la tabla fija
      const baseFija = TABLA_POSICIONES_FIJA.find(f => f.correo.toLowerCase() === u.correo.toLowerCase());
      
      tablaPosicionesMap.set(u.id, {
        usuario_id: u.id,
        nombre_completo: u.nombre_completo,
        correo: u.correo,
        pts_campeon: baseFija ? baseFija.pts_campeon : 0,
        pts_finalistas: baseFija ? baseFija.pts_finalistas : 0,
        pts_clasificados: baseFija ? baseFija.pts_clasificados : 0,
        pts_goleador_torneo: baseFija ? baseFija.pts_goleador_torneo : 0,
        pts_resultado_exacto: baseFija ? baseFija.pts_resultado_exacto : 0,
        pts_ganador_partido: baseFija ? baseFija.pts_ganador_partido : 0,
        pts_goleador_partido: baseFija ? baseFija.pts_goleador_partido : 0,
        pts_total: baseFija ? baseFija.pts_total : 0,
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
      .sort((a, b) => {
        // 1. Criterio Principal: Puntos Totales
        if (b.pts_total !== a.pts_total) return b.pts_total - a.pts_total;
        // 2. Desempate 1: Mayor cantidad de Marcadores Exactos acertados (5 Pts)
        if (b.pts_resultado_exacto !== a.pts_resultado_exacto) return b.pts_resultado_exacto - a.pts_resultado_exacto;
        // 3. Desempate 2: Mayor cantidad de Goleadores acertados (2 Pts)
        if (b.pts_goleador_partido !== a.pts_goleador_partido) return b.pts_goleador_partido - a.pts_goleador_partido;
        // 4. Desempate 3: Mayor cantidad de Ganadores/Empates acertados (3 Pts)
        if (b.pts_ganador_partido !== a.pts_ganador_partido) return b.pts_ganador_partido - a.pts_ganador_partido;
        // 5. Desempate 4: Orden alfabético por nombre completo
        return a.nombre_completo.localeCompare(b.nombre_completo);
      })
      .map((item, index) => ({
        posicion: index + 1,
        ...item,
      }));

    return NextResponse.json(
      {
        usuarios,
        tablaPosiciones,
        prediccionesPartidos,
        prediccionesIniciales,
        puntajes,
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
    console.error("Error al obtener consolidados:", error);
    return NextResponse.json(
      { error: "Error al consultar consolidados: " + error.message },
      { status: 500 }
    );
  }
}
