const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSamuName() {
  const updated = await prisma.usuario.updateMany({
    where: { correo: 'samucobaggg@gmail.com' },
    data: { nombre_completo: 'Samuel Gutierrez' }
  });
  console.log("samucobaggg@gmail.com actualizado a 'Samuel Gutierrez'", updated);
}

updateSamuName().catch(console.error).finally(() => prisma.$disconnect());
