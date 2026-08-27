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

    let eqGanadorId = null;
    if (Number(goles_local) > Number(goles_visitante)) {
      const p = await prisma.partido.findUnique({ where: { id: Number(partido_id) } });
      if (p) eqGanadorId = p.equipo_local_id;
    } else if (Number(goles_visitante) > Number(goles_local)) {
      const p = await prisma.partido.findUnique({ where: { id: Number(partido_id) } });
      if (p) eqGanadorId = p.equipo_visitante_id;
    }

    const ro = await prisma.resultadoOficial.upsert({
      where: { partido_id: Number(partido_id) },
      update: {
        goles_local_real: Number(goles_local),
        goles_visitante_real: Number(goles_visitante),
        equipo_ganador_id: eqGanadorId,
        ingresado_por_usuario_id: Number(usuario_id),
        timestamp_ingreso: new Date()
      },
      create: {
        partido_id: Number(partido_id),
        goles_local_real: Number(goles_local),
        goles_visitante_real: Number(goles_visitante),
        equipo_ganador_id: eqGanadorId,
        ingresado_por_usuario_id: Number(usuario_id)
      }
    });

    await prisma.resultadoGoleador.deleteMany({
      where: { resultado_oficial_id: ro.id }
    });

    if (idsGoleadores.length > 0) {
      await prisma.resultadoGoleador.createMany({
        data: idsGoleadores.map(id => ({
          resultado_oficial_id: ro.id,
          jugador_id: id,
          es_autogol: false
        }))
      });
    }

    await prisma.partido.update({
      where: { id: Number(partido_id) },
      data: { estado: 'resultado_cargado' }
    });

    return NextResponse.json({
      exito: true,
      mensaje: `Resultado oficial guardado en pantalla. (Los puntos NO se han calculado).`,
    });
  } catch (error: any) {
    console.error("Error al cargar resultado oficial:", error);
    return NextResponse.json({ error: error.message || "Error al procesar resultado" }, { status: 500 });
  }
}
