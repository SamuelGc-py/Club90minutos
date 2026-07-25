const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeSamuAdmin() {
  const updated = await prisma.usuario.updateMany({
    where: { correo: 'samucobaggg@gmail.com' },
    data: { rol_id: 2 }
  });
  console.log("samucobaggg@gmail.com es ahora ADMINISTRADOR (rol_id: 2)", updated);
}

makeSamuAdmin().catch(console.error).finally(() => prisma.$disconnect());
