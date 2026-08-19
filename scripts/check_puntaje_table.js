const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const puntajes = await prisma.puntaje.findMany({
    select: { partido_id: true }
  });

  const partidoIds = Array.from(new Set(puntajes.map(p => p.partido_id).filter(Boolean)));
  console.log("PARTIDOS QUE TIENEN REGISTROS EN LA TABLA PUNTAJE:", partidoIds.length);

  const partidos = await prisma.partido.findMany({
    where: { id: { in: partidoIds } },
    select: { id: true, jornada: true, estado: true, equipo_local: { select: { nombre: true } }, equipo_visitante: { select: { nombre: true } } }
  });

  console.table(partidos.map(p => ({ id: p.id, jornada: p.jornada, estado: p.estado, partido: `${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}` })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
