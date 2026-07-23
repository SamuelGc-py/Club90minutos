const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Configurando usuarios según instrucciones...");

  // 1. Eliminar cuenta de prueba 'participante@gmail.com' y sus registros
  const testUser = await prisma.usuario.findUnique({
    where: { correo: "participante@gmail.com" },
  });

  if (testUser) {
    console.log("Eliminando usuario de prueba 'participante@gmail.com'...");
    await prisma.prediccionClasificado.deleteMany({
      where: { prediccion_inicial: { usuario_id: testUser.id } },
    });
    await prisma.prediccionInicial.deleteMany({ where: { usuario_id: testUser.id } });
    await prisma.prediccionPartido.deleteMany({ where: { usuario_id: testUser.id } });
    await prisma.puntaje.deleteMany({ where: { usuario_id: testUser.id } });
    await prisma.usuario.delete({ where: { id: testUser.id } });
    console.log("✅ Usuario 'participante@gmail.com' eliminado.");
  }

  // 2. Configurar 'samucobaggg@gmail.com' como PARTICIPANTE (rol_id: 1) y borrar sus registros previas
  const samuelUser = await prisma.usuario.findUnique({
    where: { correo: "samucobaggg@gmail.com" },
  });

  if (samuelUser) {
    console.log("Limpiando predicciones previas de 'samucobaggg@gmail.com'...");
    await prisma.prediccionClasificado.deleteMany({
      where: { prediccion_inicial: { usuario_id: samuelUser.id } },
    });
    await prisma.prediccionInicial.deleteMany({ where: { usuario_id: samuelUser.id } });
    await prisma.prediccionPartido.deleteMany({ where: { usuario_id: samuelUser.id } });
    await prisma.puntaje.deleteMany({ where: { usuario_id: samuelUser.id } });

    await prisma.usuario.update({
      where: { id: samuelUser.id },
      data: {
        rol_id: 1, // Participante
        activo: true,
      },
    });
    console.log("✅ Cuenta 'samucobaggg@gmail.com' configurada como PARTICIPANTE con registros limpios.");
  } else {
    await prisma.usuario.create({
      data: {
        nombre_completo: "Samuel",
        correo: "samucobaggg@gmail.com",
        rol_id: 1, // Participante
        activo: true,
      },
    });
    console.log("✅ Cuenta 'samucobaggg@gmail.com' creada como PARTICIPANTE.");
  }

  // 3. Crear / Configurar la cuenta ADMIN 'adminpollabetplay@gmail.com' con contraseña 'Qwe.123*'
  const adminUser = await prisma.usuario.upsert({
    where: { correo: "adminpollabetplay@gmail.com" },
    update: {
      nombre_completo: "Administrador Polla",
      password: "Qwe.123*",
      rol_id: 2, // Administrador
      activo: true,
    },
    create: {
      nombre_completo: "Administrador Polla",
      correo: "adminpollabetplay@gmail.com",
      password: "Qwe.123*",
      rol_id: 2, // Administrador
      activo: true,
    },
  });

  console.log(`✅ Cuenta ADMIN creada/actualizada: ${adminUser.correo} (Rol: Administrador)`);
}

main()
  .catch((e) => {
    console.error("Error al configurar usuarios:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
