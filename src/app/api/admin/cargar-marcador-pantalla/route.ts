import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    const golesLocalReal = Number(goles_local);
    const golesVisitanteReal = Number(goles_visitante);
    const idPartido = Number(partido_id);

    // 1. Determinar ganador o empate real
    let equipoGanadorId: number | null = null;
    const partido = await prisma.partido.findUnique({
      where: { id: idPartido },
    });

    if (!partido) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    if (golesLocalReal > golesVisitanteReal) {
      equipoGanadorId = partido.equipo_local_id;
    } else if (golesVisitanteReal > golesLocalReal) {
      equipoGanadorId = partido.equipo_visitante_id;
    }

    // 2. Guardar / Actualizar ResultadoOficial
    const resultadoOficial = await prisma.resultadoOficial.upsert({
      where: { partido_id: idPartido },
      update: {
        goles_local_real: golesLocalReal,
        goles_visitante_real: golesVisitanteReal,
        equipo_ganador_id: equipoGanadorId,
        ingresado_por_usuario_id: Number(usuario_id),
        timestamp_ingreso: new Date(),
      },
      create: {
        partido_id: idPartido,
        goles_local_real: golesLocalReal,
        goles_visitante_real: golesVisitanteReal,
        equipo_ganador_id: equipoGanadorId,
        ingresado_por_usuario_id: Number(usuario_id),
      },
    });

    // Guardar todos los goleadores en ResultadoGoleador
    await prisma.resultadoGoleador.deleteMany({
      where: { resultado_oficial_id: resultadoOficial.id },
    });

    if (idsGoleadores.length > 0) {
      await prisma.resultadoGoleador.createMany({
        data: idsGoleadores.map((jid) => ({
          resultado_oficial_id: resultadoOficial.id,
          jugador_id: jid,
        })),
      });
    }

    // 3. Cambiar el estado del partido a resultado_cargado SIN calcular puntos
    await prisma.partido.update({
      where: { id: idPartido },
      data: { estado: "resultado_cargado" },
    });

    return NextResponse.json({
      exito: true,
      mensaje: `Marcador oficial guardado en pantalla. No se han calculado puntos.`,
    });
  } catch (error: any) {
    console.error("Error al cargar marcador en pantalla:", error);
    return NextResponse.json({ error: error.message || "Error al procesar resultado" }, { status: 500 });
  }
}
