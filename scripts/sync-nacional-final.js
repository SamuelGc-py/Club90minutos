const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const res = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard",
    { cache: "no-store" }
  );
  const data = await res.json();
  const event = data.events?.find(e => e.id === "401877990");
  console.log('Event status:', event?.status);

  if (event) {
    const comp = event.competitions?.[0];
    const homeTeam = comp?.competitors?.find(c => c.homeAway === "home");
    const awayTeam = comp?.competitors?.find(c => c.homeAway === "away");
    console.log(`Marcador ESPN: ${homeTeam?.team?.name} (${homeTeam?.score}) vs ${awayTeam?.team?.name} (${awayTeam?.score})`);

    const gL = parseInt(homeTeam?.score || "0", 10);
    const gV = parseInt(awayTeam?.score || "0", 10);

    const p37 = await prisma.partido.update({
      where: { id: 37 },
      data: { estado: 'resultado_cargado' }
    });

    let equipoGanadorId = null;
    if (gL > gV) equipoGanadorId = p37.equipo_local_id;
    if (gV > gL) equipoGanadorId = p37.equipo_visitante_id;

    await prisma.resultadoOficial.upsert({
      where: { partido_id: 37 },
      update: {
        goles_local_real: gL,
        goles_visitante_real: gV,
        equipo_ganador_id: equipoGanadorId,
        timestamp_ingreso: new Date()
      },
      create: {
        partido_id: 37,
        goles_local_real: gL,
        goles_visitante_real: gV,
        equipo_ganador_id: equipoGanadorId,
        ingresado_por_usuario_id: 2
      }
    });

    console.log(`✅ Partido 37 (Jaguares vs Nacional) actualizado como terminado con resultado oficial ${gL} - ${gV}`);
  }
}

main().finally(() => prisma.$disconnect());
