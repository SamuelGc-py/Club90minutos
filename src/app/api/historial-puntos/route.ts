import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Historial de puntos de un participante, partido por partido.
 *
 * Objetivo: transparencia total. Cada participante puede ver exactamente de dónde salió
 * cada punto suyo: qué pronosticó, qué pasó de verdad y cuántos puntos le dio cada
 * concepto. Los ajustes de homologación (puntajes sin partido asociado) se muestran aparte,
 * nunca disfrazados de acierto en un partido.
 *
 * GET /api/historial-puntos?usuario_id=5
 * GET /api/historial-puntos?usuario_id=5&formato=excel   -> descarga .xlsx
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = Number(searchParams.get("usuario_id"));
    const formato = searchParams.get("formato");

    if (!usuarioId || Number.isNaN(usuarioId)) {
      return NextResponse.json({ error: "Se requiere usuario_id" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: "Usuario no autorizado o inactivo" }, { status: 403 });
    }

    // Todos los puntajes del participante
    const puntajes = await prisma.puntaje.findMany({ where: { usuario_id: usuarioId } });

    // Sus pronósticos, con el partido y el resultado oficial
    const predicciones = await prisma.prediccionPartido.findMany({
      where: { usuario_id: usuarioId },
      include: {
        jugador_goleador: { select: { id: true, nombre: true } },
        partido: {
          include: {
            equipo_local: { select: { nombre: true, escudo_url: true } },
            equipo_visitante: { select: { nombre: true, escudo_url: true } },
            resultado_oficial: {
              include: { goleadores: { include: { jugador: { select: { nombre: true } } } } },
            },
          },
        },
      },
      orderBy: { partido: { fecha_hora_partido: "asc" } },
    });

    // Puntos por partido y categoría
    const puntosPorPartido = new Map<number, { exacto: number; ganador: number; goleador: number }>();
    for (const p of puntajes) {
      if (p.partido_id === null) continue;
      const acc = puntosPorPartido.get(p.partido_id) ?? { exacto: 0, ganador: 0, goleador: 0 };
      if (p.categoria === "resultado_exacto") acc.exacto += p.puntos_obtenidos;
      else if (p.categoria === "ganador_partido") acc.ganador += p.puntos_obtenidos;
      else if (p.categoria === "goleador") acc.goleador += p.puntos_obtenidos;
      puntosPorPartido.set(p.partido_id, acc);
    }

    const partidos = predicciones
      .filter((pred) => pred.partido?.resultado_oficial)
      .map((pred) => {
        const partido = pred.partido;
        const ro = partido.resultado_oficial!;
        const pts = puntosPorPartido.get(partido.id) ?? { exacto: 0, ganador: 0, goleador: 0 };

        const goleadoresReales = ro.goleadores
          .map((g) => g.jugador?.nombre || (g.es_autogol ? "Autogol" : null))
          .filter((n): n is string => !!n);

        const sinGoleadoresRegistrados =
          ro.goles_local_real + ro.goles_visitante_real > 0 && goleadoresReales.length === 0;

        const detalle: string[] = [];
        if (pts.ganador > 0) detalle.push(`Acertó ganador/empate (+${pts.ganador})`);
        if (pts.exacto > 0) detalle.push(`Acertó el marcador exacto (+${pts.exacto})`);
        if (pts.goleador > 0) detalle.push(`Acertó goleador (+${pts.goleador})`);
        if (detalle.length === 0) detalle.push("Sin aciertos en este partido");
        if (sinGoleadoresRegistrados) {
          detalle.push("Este partido no tiene goleadores oficiales registrados: nadie pudo sumar por goleador.");
        }

        return {
          partido_id: partido.id,
          jornada: partido.jornada,
          fecha: partido.fecha_hora_partido,
          estado: partido.estado,
          equipo_local: partido.equipo_local.nombre,
          equipo_visitante: partido.equipo_visitante.nombre,
          escudo_local: partido.equipo_local.escudo_url,
          escudo_visitante: partido.equipo_visitante.escudo_url,
          marcador_real: `${ro.goles_local_real}-${ro.goles_visitante_real}`,
          marcador_predicho: `${pred.goles_local_predicho}-${pred.goles_visitante_predicho}`,
          goleador_predicho: pred.jugador_goleador?.nombre ?? null,
          goleadores_reales: goleadoresReales,
          sin_goleadores_registrados: sinGoleadoresRegistrados,
          puntos_resultado_exacto: pts.exacto,
          puntos_ganador_partido: pts.ganador,
          puntos_goleador: pts.goleador,
          puntos_total: pts.exacto + pts.ganador + pts.goleador,
          detalle,
        };
      });

    // Ajustes de homologación: se listan aparte, con su motivo.
    // Un puntaje sin partido asociado no proviene del cálculo de un partido: es un
    // ajuste de homologación con la tabla maestra verificada. Se lista aparte para que
    // el participante lo vea como tal y no como un acierto en algún partido.
    const ajustes = puntajes
      .filter((p) => p.partido_id === null)
      .map((p) => ({
        categoria: p.categoria,
        puntos: p.puntos_obtenidos,
        motivo: "Ajuste de homologacion con la tabla maestra verificada",
        fecha: p.timestamp_calculo,
      }));

    const sumar = (cat: string) =>
      puntajes.filter((p) => p.categoria === cat).reduce((a, c) => a + c.puntos_obtenidos, 0);

    const resumen = {
      puntos_resultado_exacto: sumar("resultado_exacto"),
      puntos_ganador_partido: sumar("ganador_partido"),
      puntos_goleador: sumar("goleador"),
      puntos_ajustes: ajustes.reduce((a, c) => a + c.puntos, 0),
      puntos_total: puntajes.reduce((a, c) => a + c.puntos_obtenidos, 0),
      partidos_evaluados: partidos.length,
      partidos_con_puntos: partidos.filter((p) => p.puntos_total > 0).length,
    };

    // ---------------- Exportación a Excel ----------------
    if (formato === "excel") {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = "Club 90 Minutos";
      wb.created = new Date();

      const ws = wb.addWorksheet("Historial de Puntos");

      ws.mergeCells("A1:J1");
      const titulo = ws.getCell("A1");
      titulo.value = `Historial de puntos — ${usuario.nombre_completo}`;
      titulo.font = { size: 15, bold: true, color: { argb: "FFFFFFFF" } };
      titulo.alignment = { horizontal: "center", vertical: "middle" };
      titulo.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF04060A" } };
      ws.getRow(1).height = 26;

      ws.mergeCells("A2:J2");
      const sub = ws.getCell("A2");
      sub.value =
        `Total: ${resumen.puntos_total} pts  |  Marcador exacto: ${resumen.puntos_resultado_exacto}  |  ` +
        `Ganador: ${resumen.puntos_ganador_partido}  |  Goleadores: ${resumen.puntos_goleador}  |  ` +
        `Partidos evaluados: ${resumen.partidos_evaluados}`;
      sub.alignment = { horizontal: "center" };
      sub.font = { size: 11, bold: true };

      ws.addRow([]);

      const encabezado = ws.addRow([
        "Fecha",
        "Jornada",
        "Partido",
        "Marcador real",
        "Tu marcador",
        "Tu goleador",
        "Goleadores reales",
        "Exacto",
        "Ganador",
        "Goleador",
        "Puntos",
      ]);
      encabezado.font = { bold: true, color: { argb: "FFFFFFFF" } };
      encabezado.alignment = { horizontal: "center" };
      encabezado.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1F26" } };
      });

      for (const p of partidos) {
        ws.addRow([
          new Date(p.fecha).toLocaleDateString("es-CO"),
          p.jornada,
          `${p.equipo_local} vs ${p.equipo_visitante}`,
          p.marcador_real,
          p.marcador_predicho,
          p.goleador_predicho ?? "(sin goleador)",
          p.goleadores_reales.join(", ") || (p.sin_goleadores_registrados ? "(no registrados)" : "(sin goles)"),
          p.puntos_resultado_exacto,
          p.puntos_ganador_partido,
          p.puntos_goleador,
          p.puntos_total,
        ]);
      }

      if (ajustes.length > 0) {
        ws.addRow([]);
        const t = ws.addRow(["Ajustes de homologación"]);
        t.font = { bold: true };
        for (const a of ajustes) {
          ws.addRow(["", "", a.motivo, "", "", "", "", "", "", "", a.puntos]);
        }
      }

      ws.addRow([]);
      const totalRow = ws.addRow([
        "", "", "TOTAL", "", "", "", "",
        resumen.puntos_resultado_exacto,
        resumen.puntos_ganador_partido,
        resumen.puntos_goleador,
        resumen.puntos_total,
      ]);
      totalRow.font = { bold: true };

      ws.columns.forEach((col, i) => {
        col.width = [12, 9, 34, 13, 12, 22, 34, 9, 9, 10, 9][i] ?? 12;
      });

      const buffer = await wb.xlsx.writeBuffer();
      const nombreArchivo = `historial-puntos-${usuario.nombre_completo.replace(/\s+/g, "-").toLowerCase()}.xlsx`;
      return new NextResponse(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
        },
      });
    }

    return NextResponse.json({
      usuario: { id: usuario.id, nombre_completo: usuario.nombre_completo },
      resumen,
      partidos,
      ajustes,
    });
  } catch (error: any) {
    console.error("Error en historial-puntos:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
