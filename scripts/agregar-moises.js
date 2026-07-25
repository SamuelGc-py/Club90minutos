const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMoises() {
  const user = await prisma.usuario.upsert({
    where: { correo: 'moisessaavedra496@gmail.com' },
    update: { nombre_completo: 'Moisés Lucas Saavedra Perea', activo: true },
    create: {
      correo: 'moisessaavedra496@gmail.com',
      nombre_completo: 'Moisés Lucas Saavedra Perea',
      rol_id: 1,
      activo: true,
      password: null,
    }
  });

  console.log("Usuario creado/actualizado correctamente:", JSON.stringify(user, null, 2));
}

addMoises().catch(console.error).finally(() => prisma.$disconnect());
