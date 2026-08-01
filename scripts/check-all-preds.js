const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPreds() {
  const count = await prisma.prediccionPartido.count();
  console.log("TOTAL PREDICCIONES DE PARTIDO EN DB:", count);
  const preds33 = await prisma.prediccionPartido.findMany({ where: { partido_id: 33 }, include: { usuario: true } });
  console.log("Predicciones Partido 33 (Pasto vs Águilas):", preds33.length);
  preds33.forEach(p => console.log(`  - ${p.usuario.nombre_completo}: ${p.goles_local_predicho} - ${p.goles_visitante_predicho}`));
}

checkPreds().catch(console.error).finally(() => prisma.$disconnect());
