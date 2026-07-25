const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addManuel() {
  const user = await prisma.usuario.upsert({
    where: { correo: 'stherton@gmail.com' },
    update: { nombre_completo: 'Manuel Cabarcas', activo: true },
    create: {
      correo: 'stherton@gmail.com',
      nombre_completo: 'Manuel Cabarcas',
      rol_id: 1,
      activo: true,
      password: null,
    }
  });

  console.log("Usuario creado/actualizado correctamente:", JSON.stringify(user, null, 2));
}

addManuel().catch(console.error).finally(() => prisma.$disconnect());
