const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const aplazados = await prisma.partido.findMany({
    where: { estado: 'aplazado' },
    include: { equipo_local: true, equipo_visitante: true },
    orderBy: { jornada: 'asc' }
  });
  
  console.log("=== PARTIDOS APLAZADOS EN DB ===");
  aplazados.forEach(p => {
    console.log(`Jornada ${p.jornada} | ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} | ${p.fecha_hora_partido.toISOString()}`);
  });

  const atrasados = await prisma.partido.findMany({
    where: { 
        estado: { notIn: ['resultado_cargado', 'puntaje_calculado', 'aplazado'] },
        fecha_hora_partido: { lt: new Date() }
    },
    include: { equipo_local: true, equipo_visitante: true },
    orderBy: { jornada: 'asc' }
  });

  console.log("\n=== PARTIDOS ATRASADOS (Fecha pasada pero no aplazados) ===");
  atrasados.forEach(p => {
    console.log(`Jornada ${p.jornada} | ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} | Estado: ${p.estado} | ${p.fecha_hora_partido.toISOString()}`);
  });
}
main().finally(() => prisma.$disconnect());
