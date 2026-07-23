const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const correoPrueba = "prueba@polla.com";
  const nombrePrueba = "Usuario Prueba Express";

  console.log(`Intentando registrar/activar a ${correoPrueba}...`);

  const usuario = await prisma.usuario.upsert({
    where: { correo: correoPrueba },
    update: {
      activo: true,
      estado_pago: "validado",
    },
    create: {
      nombre_completo: nombrePrueba,
      correo: correoPrueba,
      activo: true,
      estado_pago: "validado",
      rol: {
        connect: { id: 1 }, // Rol de participante
      },
    },
  });

  console.log("✅ Usuario registrado y activado con éxito en PostgreSQL:");
  console.log({
    id: usuario.id,
    nombre: usuario.nombre_completo,
    correo: usuario.correo,
    activo: usuario.activo,
    estado_pago: usuario.estado_pago,
  });
}

main()
  .catch((e) => {
    console.error("❌ Error al insertar usuario en la base de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
