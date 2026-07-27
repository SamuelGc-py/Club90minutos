const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSamuelPreds() {
  const samuel = await prisma.usuario.findFirst({ where: { correo: 'samucobaggg@gmail.com' } });
  const preds = await prisma.prediccionPartido.findMany({
    where: { usuario_id: samuel.id }
  });
  console.log("RAW PREDICCIONES SAMUEL:", preds);
  await prisma.$disconnect();
}

checkSamuelPreds().catch(console.error);
