const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany({
    where: {
      OR: [
        { correo: { contains: 'nandorafa' } },
        { nombre_completo: { contains: 'Hernando' } },
        { nombre_completo: { contains: 'Davila' } }
      ]
    },
    include: {
      predicciones_partido: true,
      prediccion_inicial: true
    }
  });

  console.log("Usuarios encontrados:", JSON.stringify(users, null, 2));

  const partidos = await prisma.partido.findMany({
    where: { jornada: 1 }
  });

  console.log("Total partidos Fecha 1 en DB:", partidos.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
