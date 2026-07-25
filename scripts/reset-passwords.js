const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetPasswords() {
  const emails = ['gomezromario24@gmail.com', 'rene26203@gmail.com'];

  for (const email of emails) {
    const updated = await prisma.usuario.updateMany({
      where: { correo: email },
      data: { password: null }
    });
    console.log(`Contraseña reseteada (puesta a null) para: ${email}`);
  }
}

resetPasswords().catch(console.error).finally(() => prisma.$disconnect());
