import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const {
      usuario_id,
      campeon_equipo_id,
      finalista_1_equipo_id,
      finalista_2_equipo_id,
      goleador_torneo_jugador_id,
      clasificados_ids,
      partidos,
    } = await req.json();

    if (!usuario_id) {
      return NextResponse.json(
        { error: "Usuario ID inválido" },
        { status: 400 }
      );
    }

    // Verificar que usuario esté activo
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
    });

    if (!usuario || !usuario.activo) {
      return NextResponse.json(
        { error: "Usuario no autorizado o inactivo" },
        { status: 403 }
      );
    }

    const now = new Date();

    // Buscar la fecha de cierre de la Fecha 5 (último partido de la jornada 5)
    const ultimoPartidoFecha5 = await prisma.partido.findFirst({
      where: { jornada: 5 },
      orderBy: { fecha_hora_partido: "desc" },
    });

    const prediccionesInicialesCerradas = false; // ABRIERTAS MANUALMENTE

    const seIntentoEnviarInicial = !!(campeon_equipo_id || finalista_1_equipo_id || finalista_2_equipo_id || goleador_torneo_jugador_id || (Array.isArray(clasificados_ids) && clasificados_ids.length > 0));
    let prediccionInicialRechazada = false;
    const partidosGuardados: number[] = [];
    const partidosRechazados: number[] = [];

    // Guardar mediante transacción Prisma
    await prisma.$transaction(async (tx: any) => {
      // 1. Predicción inicial (Solo si no están cerradas las de Fecha 5)
      if (prediccionesInicialesCerradas && seIntentoEnviarInicial) {
        prediccionInicialRechazada = true;
      }
      if (!prediccionesInicialesCerradas && seIntentoEnviarInicial) {
        const prediccionInicial = await tx.prediccionInicial.upsert({
          where: { usuario_id: usuario.id },
          create: {
            usuario_id: usuario.id,
            campeon_equipo_id: campeon_equipo_id ? Number(campeon_equipo_id) : null,
            finalista_1_equipo_id: finalista_1_equipo_id ? Number(finalista_1_equipo_id) : null,
            finalista_2_equipo_id: finalista_2_equipo_id ? Number(finalista_2_equipo_id) : null,
            goleador_torneo_jugador_id: goleador_torneo_jugador_id ? Number(goleador_torneo_jugador_id) : null,
            timestamp_envio: now,
            estado: "enviada",
          },
          update: {
            campeon_equipo_id: campeon_equipo_id ? Number(campeon_equipo_id) : null,
            finalista_1_equipo_id: finalista_1_equipo_id ? Number(finalista_1_equipo_id) : null,
            finalista_2_equipo_id: finalista_2_equipo_id ? Number(finalista_2_equipo_id) : null,
            goleador_torneo_jugador_id: goleador_torneo_jugador_id ? Number(goleador_torneo_jugador_id) : null,
            timestamp_envio: now,
            estado: "enviada",
          },
        });

        // 2. Clasificados a cuadrangulares
        if (Array.isArray(clasificados_ids)) {
          await tx.prediccionClasificado.deleteMany({
            where: { prediccion_inicial_id: prediccionInicial.id },
          });

          for (const eqId of clasificados_ids) {
            await tx.prediccionClasificado.create({
              data: {
                prediccion_inicial_id: prediccionInicial.id,
                equipo_id: Number(eqId),
              },
            });
          }
        }
      }

      // 3. Pronósticos de partidos (Marcador + Goleador) con cierre 1 hora antes
      if (Array.isArray(partidos) && partidos.length > 0) {
        const partidoIds = partidos
          .filter((p: any) => p.partido_id && p.goles_local !== "" && p.goles_visitante !== "")
          .map((p: any) => Number(p.partido_id));

        const partidosDbList = await tx.partido.findMany({
          where: { id: { in: partidoIds } },
        });

        const partidosMap = new Map(partidosDbList.map((p: any) => [p.id, p]));
        const esAdmin = usuario.rol_id === 2;

        for (const p of partidos) {
          if (
            p.partido_id &&
            p.goles_local !== undefined &&
            p.goles_local !== null &&
            p.goles_local !== "" &&
            p.goles_visitante !== undefined &&
            p.goles_visitante !== null &&
            p.goles_visitante !== ""
          ) {
            const partidoIdNum = Number(p.partido_id);
            const partidoDb: any = partidosMap.get(partidoIdNum);

            if (partidoDb) {
              const limiteCierre = new Date(new Date(partidoDb.fecha_hora_partido).getTime() - 30 * 60 * 1000);
              const esExcepcionHaroldMedellin = usuario.correo === "hberdugodelosreyes0@gmail.com" && partidoDb.id === 24;
              const esExcepcionSamu = usuario.correo === "samucobaggg@gmail.com" && partidoDb.id === 25;
              const esExcepcionIgnacio = usuario.correo === "iangelbarrios16@gmail.com" && (partidoDb.id === 27 || partidoDb.id === 31);
              // Si ya pasó la hora de cierre (30 minutos antes del partido), no guardar (salvo admin o excepción)
              if (now >= limiteCierre && !esAdmin && !esExcepcionHaroldMedellin && !esExcepcionSamu && !esExcepcionIgnacio) {
                partidosRechazados.push(partidoIdNum);
                continue;
              }
            }

            const goleadorId = p.jugador_goleador_id ? Number(p.jugador_goleador_id) : null;

            await tx.prediccionPartido.upsert({
              where: {
                usuario_id_partido_id: {
                  usuario_id: usuario.id,
                  partido_id: partidoIdNum,
                },
              },
              create: {
                usuario_id: usuario.id,
                partido_id: partidoIdNum,
                goles_local_predicho: Number(p.goles_local),
                goles_visitante_predicho: Number(p.goles_visitante),
                jugador_goleador_predicho_id: goleadorId,
                timestamp_envio: now,
                estado: "enviada",
              },
              update: {
                goles_local_predicho: Number(p.goles_local),
                goles_visitante_predicho: Number(p.goles_visitante),
                jugador_goleador_predicho_id: goleadorId,
                timestamp_envio: now,
                estado: "enviada",
              },
            });

            partidosGuardados.push(partidoIdNum);
          }
        }
      }
    });

    const mensajeBase = "¡Tus pronósticos se han guardado exitosamente!";
    const huboRechazos = prediccionInicialRechazada || partidosRechazados.length > 0;

    return NextResponse.json({
      exito: true,
      mensaje: huboRechazos
        ? "Algunos pronósticos no se guardaron porque ya cerró el plazo (ver detalle)."
        : mensajeBase,
      partidosGuardados,
      partidosRechazados,
      prediccionInicialRechazada,
    });
  } catch (error: any) {
    console.error("Error al guardar pronósticos:", error);
    return NextResponse.json(
      { error: "Error al guardar en la base de datos: " + error.message },
      { status: 500 }
    );
  }
}
