import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get("usuario_id");

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

    const prediccionesPartidos = await prisma.prediccionPartido.findMany({
      include: {
        usuario: { select: { nombre_completo: true } },
        partido: {
          include: {
            equipo_local: { select: { nombre: true } },
            equipo_visitante: { select: { nombre: true } },
          },
        },
        equipo_ganador: { select: { nombre: true } },
        goleador_partido: { select: { nombre: true } },
      },
      orderBy: [
        { partido: { jornada: "asc" } },
        { partido: { fecha_hora_partido: "asc" } },
        { usuario: { nombre_completo: "asc" } },
      ],
    });

    // Inicializar libro y hoja de cálculo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Pronósticos Partidos");

    // Configurar columnas y anchos (basado en HTML)
    worksheet.columns = [
      { header: "Partido", key: "partido", width: 25 }, // Aprox 76px -> width en exceljs es diferente (caracteres aprox), pondremos valores razonables
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
    headerRow.height = 25; // Darle algo de altura
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
        // Fondo negro para A-F
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF000000" },
        };
      } else {
        // Fondo azul para G-I
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
      const ganadorStr = pp.empate ? "Empate" : (pp.equipo_ganador?.nombre || "N/A");
      
      const row = worksheet.addRow({
        partido: partidoStr,
        participante: pp.usuario.nombre_completo,
        ganador_partido_pred: ganadorStr,
        goles_local: pp.goles_local,
        goles_visitante: pp.goles_visitante,
        goleador: pp.goleador_partido?.nombre || "N/A",
        res_correctos: "#N/A", // Espacio para fórmula o calificación posterior
        ganador_partido_res: "#N/A",
        goleadores_res: 0,
      });

      // Estilizar las celdas de datos
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

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": 'attachment; filename="Pronosticos_Partidos.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Error al generar Excel:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
