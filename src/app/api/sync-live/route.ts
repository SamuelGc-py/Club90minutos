import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard",
      { cache: "no-store" }
    );
    const data = await res.json();
    const events = data.events || [];

    let actualizados = 0;

    for (const event of events) {
      const competition = event.competitions?.[0];
      if (!competition) continue;

      const homeTeam = competition.competitors.find((c: any) => c.homeAway === "home");
      const awayTeam = competition.competitors.find((c: any) => c.homeAway === "away");
      const status = event.status;

      if (!homeTeam || !awayTeam) continue;

      const homeName = homeTeam.team.name;
      const awayName = awayTeam.team.name;

      // Buscar partido correspondiente en BD por coincidencia de equipos
      const partidosDb = await prisma.partido.findMany({
        include: { equipo_local: true, equipo_visitante: true },
      });

      const partido = partidosDb.find((p) => {
        const localMatch = p.equipo_local.nombre.toLowerCase().includes(homeName.toLowerCase()) ||
                           homeName.toLowerCase().includes(p.equipo_local.nombre.toLowerCase());
        const visitanteMatch = p.equipo_visitante.nombre.toLowerCase().includes(awayName.toLowerCase()) ||
                               awayName.toLowerCase().includes(p.equipo_visitante.nombre.toLowerCase());
        return localMatch && visitanteMatch;
      });

      if (!partido) continue;

      const golesLocalReal = parseInt(homeTeam.score || "0", 10);
      const golesVisitanteReal = parseInt(awayTeam.score || "0", 10);

      let equipoGanadorId = null;
      if (golesLocalReal > golesVisitanteReal) equipoGanadorId = partido.equipo_local_id;
      if (golesVisitanteReal > golesLocalReal) equipoGanadorId = partido.equipo_visitante_id;

      const esFinalizado = status.type.name === "STATUS_FULL_TIME";
      const nuevoEstado = esFinalizado ? "resultado_cargado" : "resultado_pendiente";

      // Admin genérico para registro
      const admin = await prisma.usuario.findFirst({
        where: { rol: { nombre: "administrador" } },
      });

      await prisma.resultadoOficial.upsert({
        where: { partido_id: partido.id },
        update: {
          goles_local_real: golesLocalReal,
          goles_visitante_real: golesVisitanteReal,
          equipo_ganador_id: equipoGanadorId,
          timestamp_ingreso: new Date(),
        },
        create: {
          partido_id: partido.id,
          goles_local_real: golesLocalReal,
          goles_visitante_real: golesVisitanteReal,
          equipo_ganador_id: equipoGanadorId,
          ingresado_por_usuario_id: admin ? admin.id : 1,
        },
      });

      await prisma.partido.update({
        where: { id: partido.id },
        data: { estado: nuevoEstado },
      });

      actualizados++;
    }

    return NextResponse.json({
      exito: true,
      mensaje: `Partidos en vivo sincronizados (${actualizados}).`,
    });
  } catch (error: any) {
    console.error("Error al sincronizar resultados en vivo:", error);
    return NextResponse.json(
      { error: "Error al sincronizar: " + error.message },
      { status: 500 }
    );
  }
}
