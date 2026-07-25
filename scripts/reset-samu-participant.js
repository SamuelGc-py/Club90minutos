const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetSamuRole() {
  const updated = await prisma.usuario.updateMany({
    where: { correo: 'samucobaggg@gmail.com' },
    data: { rol_id: 1 }
  });
  console.log("samucobaggg@gmail.com restaurado como PARTICIPANTE (rol_id: 1)", updated);
}

resetSamuRole().catch(console.error).finally(() => prisma.$disconnect());
