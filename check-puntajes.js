const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPuntajes() {
  const puntajes = await prisma.puntaje.findMany({
    where: { usuario_id: 2 },
    include: { partido: { include: { equipo_local: true, equipo_visitante: true } } }
  });

  console.log("=== PUNTAJES EN DB DE SAMUEL (usuario_id = 2) ===");
  console.log(puntajes);

  const total = puntajes.reduce((acc, curr) => acc + curr.puntos_obtenidos, 0);
  console.log("TOTAL PUNTOS REGISTRADOS:", total);

  await prisma.$disconnect();
}

checkPuntajes().catch(console.error);
