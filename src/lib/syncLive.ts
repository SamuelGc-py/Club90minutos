import { prisma } from "@/lib/db";

export async function sincronizarMarcadoresEnVivo() {
  const res = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard",
    { cache: "no-store" }
  );
  const data = await res.json();
  const events = data.events || [];

  let actualizados = 0;
  const partidosDb = await prisma.partido.findMany({
    include: { equipo_local: true, equipo_visitante: true },
  });

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/f\.c\.|fc|d.a.f.|c.d./gi, "")
      .trim();

  for (const event of events) {
    const competition = event.competitions?.[0];
    if (!competition) continue;

    const homeTeam = competition.competitors?.find((c: any) => c.homeAway === "home");
    const awayTeam = competition.competitors?.find((c: any) => c.homeAway === "away");
    const status = event.status;

    if (!homeTeam || !awayTeam) continue;

    const homeNameNorm = normalize(homeTeam.team.name);
    const awayNameNorm = normalize(awayTeam.team.name);

    const partido = partidosDb.find((p) => {
      const dbLocalNorm = normalize(p.equipo_local.nombre);
      const dbVisitanteNorm = normalize(p.equipo_visitante.nombre);

      const localMatch = dbLocalNorm.includes(homeNameNorm) || homeNameNorm.includes(dbLocalNorm);
      const visitanteMatch = dbVisitanteNorm.includes(awayNameNorm) || awayNameNorm.includes(dbVisitanteNorm);
      return localMatch && visitanteMatch;
    });

    if (!partido) continue;

    const golesLocalReal = parseInt(homeTeam.score || "0", 10);
    const golesVisitanteReal = parseInt(awayTeam.score || "0", 10);

    let equipoGanadorId: number | null = null;
    if (golesLocalReal > golesVisitanteReal) equipoGanadorId = partido.equipo_local_id;
    if (golesVisitanteReal > golesLocalReal) equipoGanadorId = partido.equipo_visitante_id;

    const statusCode = status?.type?.name;

    // Ignorar partidos programados que aún no inician
    if (statusCode === "STATUS_SCHEDULED" || statusCode === "STATUS_POSTPONED") continue;

    const esFinalizado = statusCode === "STATUS_FULL_TIME";
    const nuevoEstado = esFinalizado ? "resultado_cargado" : "resultado_pendiente";

    const admin = await prisma.usuario.findFirst({
      where: { rol: { nombre: "administrador" } },
    });

    // ÚNICAMENTE actualiza el Marcador Oficial sin alterar ni liquidar puntos
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

  return actualizados;
}
