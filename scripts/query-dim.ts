import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const millonarios = await prisma.equipo.findFirst({ where: { nombre: "Millonarios F.C." }});
  if (!millonarios) return;

  const partidos = await prisma.partido.findMany({
    where: {
      OR: [
        { equipo_local_id: millonarios.id },
        { equipo_visitante_id: millonarios.id }
      ]
    },
    include: {
      equipo_local: true,
      equipo_visitante: true,
    },
    orderBy: { jornada: 'asc' }
  });

  console.log("=== PARTIDOS DE MILLONARIOS ===");
  partidos.forEach(p => {
    console.log(`Jornada: ${p.jornada} | ID: ${p.id} | ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}`);
  });
  
  const dim = await prisma.equipo.findFirst({ where: { nombre: "Independiente Medellín" }});
  if (!dim) return;

  const partidosDim = await prisma.partido.findMany({
    where: {
      OR: [
        { equipo_local_id: dim.id },
        { equipo_visitante_id: dim.id }
      ]
    },
    include: {
      equipo_local: true,
      equipo_visitante: true,
    },
    orderBy: { jornada: 'asc' }
  });

  console.log("\n=== PARTIDOS DE DIM ===");
  partidosDim.forEach(p => {
    console.log(`Jornada: ${p.jornada} | ID: ${p.id} | ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}`);
  });
}

main().finally(() => prisma.$disconnect());
