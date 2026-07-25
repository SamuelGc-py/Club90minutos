const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPereira() {
  const partidos = await prisma.partido.findMany({
    include: {
      equipo_local: true,
      equipo_visitante: true,
    }
  });

  const pereira = partidos.find(p => 
    p.equipo_local.nombre.toLowerCase().includes('pereira') || 
    p.equipo_visitante.nombre.toLowerCase().includes('pereira')
  );

  console.log("Partido Pereira en DB:", JSON.stringify(pereira, null, 2));
  console.log("Fecha/hora actual servidor:", new Date().toISOString());
}

checkPereira().catch(console.error).finally(() => prisma.$disconnect());
