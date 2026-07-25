const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const nuevosUsuarios = [
  { correo: 'nandorafa@hotmail.com', nombre_completo: 'Hernando Rafael Davila Mejia', rol_id: 1, activo: true },
  { correo: 'gomezromario24@gmail.com', nombre_completo: 'Romario Gomez', rol_id: 1, activo: true },
  { correo: 'luismibetara15@hotmail.com', nombre_completo: 'Luis Miguel Betancourt', rol_id: 1, activo: true }
];

async function main() {
  for (const user of nuevosUsuarios) {
    await prisma.usuario.upsert({
      where: { correo: user.correo },
      update: { nombre_completo: user.nombre_completo, activo: true },
      create: user
    });
    console.log(`Usuario añadido o actualizado: ${user.correo}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
