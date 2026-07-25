const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCali() {
  const cali = await prisma.partido.findFirst({
    where: { equipo_local: { nombre: { contains: 'Cali' } } },
    include: {
      equipo_local: true,
      equipo_visitante: true,
      resultado_oficial: true,
      predicciones: {
        include: { usuario: true }
      }
    }
  });

  console.log("PARTIDO DEPORTIVO CALI:", JSON.stringify(cali, null, 2));

  const totalPartidos = await prisma.partido.count();
  console.log("TOTAL PARTIDOS EN DB:", totalPartidos);
}

checkCali().catch(console.error).finally(() => prisma.$disconnect());
