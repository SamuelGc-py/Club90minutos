const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMatch27Puntajes() {
  const pts27 = await prisma.puntaje.findMany({
    where: { partido_id: 27 },
    include: { usuario: true }
  });
  console.log("=== PUNTAJES PARA EL PARTIDO 27 (América vs Internacional) ===");
  console.log(pts27.map(p => ({ usuario: p.usuario.nombre_completo, correo: p.usuario.correo, categoria: p.categoria, puntos: p.puntos_obtenidos })));

  await prisma.$disconnect();
}

checkMatch27Puntajes().catch(console.error);
