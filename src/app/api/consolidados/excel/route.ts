import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get("usuario_id");
    const partidoId = searchParams.get("partido_id"); // Opcional
    const jornada = searchParams.get("jornada"); // Opcional (Fecha 1, 2, etc)
    const tipo = searchParams.get("tipo"); // "inicial" o null

    if (!usuarioId) {
      return NextResponse.json({ error: "Se requiere usuario_id" }, { status: 400 });
    }

    // Verificar permisos de admin
    const admin = await prisma.usuario.findUnique({
      where: { id: Number(usuarioId) },
      include: { rol: true },
    });

    if (!admin || admin.rol.nombre !== "administrador") {
      return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });
    }

    const correosExcluidos = ["adminpollabetplay@gmail.com", "prueba.admin@pollabetplay.com", "pruebas@pollabetplay.com", "prueba@gmail.com", "PRUEBA@GMAIL.COM"];

    // SI TIPO === "INICIAL", GENERAR EXCEL DE PREDICCIONES DE TORNEO
    if (tipo === "inicial") {
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

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Predicciones Torneo");

      worksheet.columns = [
        { header: "Nombre del participante", key: "participante", width: 35 },
        { header: "Correo", key: "correo", width: 30 },
        { header: "Campeón Predicho", key: "campeon", width: 25 },
        { header: "Finalista 1", key: "finalista_1", width: 25 },
        { header: "Finalista 2", key: "finalista_2", width: 25 },
        { header: "Goleador del Torneo", key: "goleador_torneo", width: 30 },
        { header: "Clasificados (8 Equipos)", key: "clasificados", width: 50 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
      });

      prediccionesIniciales.forEach((pi) => {
        const clasificadosStr = (pi.clasificados || []).map((c: any) => c.equipo?.nombre).filter(Boolean).join(", ");
        const row = worksheet.addRow({
          participante: pi.usuario.nombre_completo,
          correo: pi.usuario.correo,
          campeon: pi.campeon?.nombre || "Sin seleccionar",
          finalista_1: pi.finalista_1?.nombre || "Sin seleccionar",
          finalista_2: pi.finalista_2?.nombre || "Sin seleccionar",
          goleador_torneo: pi.goleador_torneo?.nombre || "Sin seleccionar",
          clasificados: clasificadosStr || "Sin seleccionar",
        });

        row.eachCell((cell) => {
          cell.font = { name: "Arial", size: 11, color: { argb: "FF000000" } };
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
          cell.alignment = { vertical: "middle", horizontal: "left" };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Disposition": 'attachment; filename="Pronosticos_Torneo_Iniciales.xlsx"',
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    }

    // Construir filtro
    const whereClause: any = {
      usuario: {
        NOT: {
          correo: { in: correosExcluidos },
        },
      },
    };
    if (partidoId) {
      whereClause.partido_id = Number(partidoId);
    }
    if (jornada) {
      whereClause.partido = { jornada: Number(jornada) };
    }

    const prediccionesPartidos = await prisma.prediccionPartido.findMany({
      where: whereClause,
      include: {
        usuario: { select: { nombre_completo: true } },
        partido: {
          include: {
            equipo_local: { select: { nombre: true } },
            equipo_visitante: { select: { nombre: true } },
          },
        },
        jugador_goleador: { select: { nombre: true } },
      },
      orderBy: [
        { partido: { jornada: "asc" } },
        { partido: { fecha_hora_partido: "asc" } },
        { usuario: { nombre_completo: "asc" } },
      ],
    });

    // Inicializar libro y hoja de cálculo
    const workbook = new ExcelJS.Workbook();
    const sheetName = jornada ? `Fecha ${jornada}` : "Pronósticos Partidos";
    const worksheet = workbook.addWorksheet(sheetName);

    // Configurar columnas y anchos (basado en HTML)
    worksheet.columns = [
      { header: "Partido", key: "partido", width: 25 },
      { header: "Nombre del participante", key: "participante", width: 35 },
      { header: "Ganador del Partido", key: "ganador_partido_pred", width: 25 },
      { header: "Local", key: "goles_local", width: 12 },
      { header: "Visitante", key: "goles_visitante", width: 15 },
      { header: "Goleador", key: "goleador", width: 30 },
      { header: "Resultados Correctos", key: "res_correctos", width: 25 },
      { header: "Ganador Partido", key: "ganador_partido_res", width: 25 },
      { header: "Goleadores", key: "goleadores_res", width: 20 },
    ];

    // Estilizar la fila de encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: colNumber <= 6 ? "left" : "center" };
      
      if (colNumber <= 6) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF000000" },
        };
      } else {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0070C0" },
        };
      }
    });

    // Llenar datos
    prediccionesPartidos.forEach((pp) => {
      const partidoStr = `${pp.partido.equipo_local.nombre} VS ${pp.partido.equipo_visitante.nombre}`;
      let ganadorStr = "Empate";
      if (pp.goles_local_predicho > pp.goles_visitante_predicho) {
        ganadorStr = pp.partido.equipo_local.nombre;
      } else if (pp.goles_visitante_predicho > pp.goles_local_predicho) {
        ganadorStr = pp.partido.equipo_visitante.nombre;
      }
      
      const row = worksheet.addRow({
        partido: partidoStr,
        participante: pp.usuario.nombre_completo,
        ganador_partido_pred: ganadorStr,
        goles_local: pp.goles_local_predicho,
        goles_visitante: pp.goles_visitante_predicho,
        goleador: pp.jugador_goleador?.nombre || "N/A",
        res_correctos: "#N/A",
        ganador_partido_res: "#N/A",
        goleadores_res: 0,
      });

      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 11, color: { argb: "FF000000" } };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: colNumber <= 6 ? "left" : "center" };
      });
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = jornada ? `Pronosticos_Partidos_Fecha_${jornada}.xlsx` : `Pronosticos_Partidos_Todos.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Error al generar Excel:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
