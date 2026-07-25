const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Corrigiendo correo de Erick Andrade...");
  try {
    await prisma.usuario.update({
      where: { correo: 'andradeferrer@hotmai.com' },
      data: { correo: 'andradeferrer@hotmail.com' }
    });
    console.log("¡Correo corregido exitosamente a andradeferrer@hotmail.com!");
  } catch (error) {
    if (error.code === 'P2025') {
      console.log("El correo andradeferrer@hotmai.com no se encontró. Quizás ya fue corregido.");
    } else {
      console.error("Error al actualizar:", error);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
