const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const equipos = await prisma.equipo.findMany();
  const partidos = await prisma.partido.findMany({
    include: { equipo_local: true, equipo_visitante: true }
  });
  console.log(`Equipos en DB: ${equipos.length}`);
  console.log(`Partidos en DB: ${partidos.length}`);
  if (equipos.length > 0) {
    console.log("Muestra de equipos:", equipos.slice(0, 5).map(e => e.nombre));
  }
  if (partidos.length > 0) {
    console.log("Muestra de partidos:", partidos.slice(0, 5).map(p => `${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} (${p.fase} fecha ${p.jornada})`));
  }
}

main().finally(() => prisma.$disconnect());
