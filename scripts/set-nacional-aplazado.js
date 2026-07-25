const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const partidos = await prisma.partido.findMany({
    include: {
      equipo_local: true,
      equipo_visitante: true,
    }
  });

  const partidoNacional = partidos.find(p => 
    p.equipo_local.nombre.toLowerCase().includes('nacional') || 
    p.equipo_visitante.nombre.toLowerCase().includes('nacional')
  );

  if (partidoNacional) {
    await prisma.partido.update({
      where: { id: partidoNacional.id },
      data: { estado: 'aplazado' }
    });
    console.log(`Partido de Nacional actualizado a aplazado: ${partidoNacional.equipo_local.nombre} VS ${partidoNacional.equipo_visitante.nombre}`);
  } else {
    console.log("No se encontró el partido de Nacional");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
