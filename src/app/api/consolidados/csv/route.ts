import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get("usuario_id");
    const tipo = searchParams.get("tipo") || "marcadores";

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

    // BOM UTF-8 para compatibilidad perfecta con Excel
    const BOM = "\uFEFF";
    let csvContent = "";
    let filename = "";

    if (tipo === "torneo") {
      filename = "consolidado_predicciones_torneo.csv";
      csvContent += "Participante;Correo;Campeon;Finalista 1;Finalista 2;Goleador Torneo;Clasificados Cuadrangulares\n";

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

      for (const pi of prediccionesIniciales) {
        const nombre = `"${(pi.usuario.nombre_completo || "").replace(/"/g, '""')}"`;
        const correo = `"${(pi.usuario.correo || "").replace(/"/g, '""')}"`;
        const campeon = `"${(pi.campeon?.nombre || "Sin definir").replace(/"/g, '""')}"`;
        const finalista1 = `"${(pi.finalista_1?.nombre || "Sin definir").replace(/"/g, '""')}"`;
        const finalista2 = `"${(pi.finalista_2?.nombre || "Sin definir").replace(/"/g, '""')}"`;
        const goleador = `"${(pi.goleador_torneo?.nombre || "Sin definir").replace(/"/g, '""')}"`;
        const clasificadosStr = `"${pi.clasificados.map((c) => c.equipo.nombre).join(", ").replace(/"/g, '""')}"`;

        csvContent += `${nombre};${correo};${campeon};${finalista1};${finalista2};${goleador};${clasificadosStr}\n`;
      }
    } else {
      filename = "consolidado_pronosticos_partidos.csv";
      csvContent += "Participante;Correo;Fase;Jornada;Equipo Local;Goles Local;Goles Visitante;Equipo Visitante;Goleador Partido\n";

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

      for (const p of prediccionesPartidos) {
        const nombre = `"${(p.usuario.nombre_completo || "").replace(/"/g, '""')}"`;
        const correo = `"${(p.usuario.correo || "").replace(/"/g, '""')}"`;
        const fase = `"${p.partido.fase}"`;
        const jornada = p.partido.jornada;
        const local = `"${(p.partido.equipo_local.nombre || "").replace(/"/g, '""')}"`;
        const gLocal = p.goles_local_predicho;
        const gVisitante = p.goles_visitante_predicho;
        const visitante = `"${(p.partido.equipo_visitante.nombre || "").replace(/"/g, '""')}"`;
        const goleador = `"${(p.jugador_goleador?.nombre || "N/A").replace(/"/g, '""')}"`;

        csvContent += `${nombre};${correo};${fase};${jornada};${local};${gLocal};${gVisitante};${visitante};${goleador}\n`;
      }
    }

    return new Response(BOM + csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error al exportar CSV:", error);
    return NextResponse.json({ error: "Error al generar CSV: " + error.message }, { status: 500 });
  }
}
