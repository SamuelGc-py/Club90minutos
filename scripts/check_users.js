const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany({
    select: {
      id: true,
      nombre_completo: true,
      correo: true,
      activo: true,
      rol_id: true,
      password: true,
    },
  });
  console.log("TOTAL USUARIOS EN LA BASE DE DATOS:", users.length);
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error("ERROR DE CONEXION:", e))
  .finally(async () => {
    await prisma.$disconnect();
  });
