const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const partidos = await prisma.partido.findMany({ where: { jornada: 7 }, include: { equipo_local: true, equipo_visitante: true } });
  
  const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/f\.c\.|fc|d.a.f.|c.d./gi, "").trim();

  for (const partido of partidos) {
    try {
      const dbLocalNorm = normalize(partido.equipo_local.nombre);
      const dbVisitanteNorm = normalize(partido.equipo_visitante.nombre);

      const fp = new Date(partido.fecha_hora_partido);
      const formatDateStr = (d) => d.toISOString().split('T')[0].replace(/-/g, '');
      const d1 = formatDateStr(new Date(fp.getTime() - 3 * 86400000));
      const d2 = formatDateStr(new Date(fp.getTime() + 3 * 86400000));

      console.log(`\nPartido ${partido.id}: ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}`);
      console.log(`URL: https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard?dates=${d1}-${d2}`);
      
      const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard?dates=${d1}-${d2}`);
      if (!res.ok) {
        console.log(`Error ESPN: ${res.status}`);
        continue;
      }
      const data = await res.json();
      console.log(`Eventos encontrados: ${data.events ? data.events.length : 0}`);
      
    } catch (e) {
      console.error(`Excepción en partido ${partido.id}:`, e);
    }
  }
}

run().finally(() => prisma.$disconnect());
