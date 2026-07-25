const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usuario = await prisma.usuario.findUnique({
    where: { correo: 'andradeferrer@hotmai.com' }
  });

  if (usuario) {
    await prisma.usuario.update({
      where: { correo: 'andradeferrer@hotmai.com' },
      data: { correo: 'andradeferrer@hotmail.com' }
    });
    console.log("Correo actualizado exitosamente a: andradeferrer@hotmail.com");
  } else {
    // Si no lo encuentra, tal vez ya se actualizó o no existía.
    const yaActualizado = await prisma.usuario.findUnique({
      where: { correo: 'andradeferrer@hotmail.com' }
    });
    if (yaActualizado) {
      console.log("El correo ya estaba actualizado a andradeferrer@hotmail.com");
    } else {
      console.log("No se encontró el usuario con el correo viejo ni el nuevo.");
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
