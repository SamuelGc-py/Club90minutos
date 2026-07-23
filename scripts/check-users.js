const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const usuarios = await prisma.usuario.findMany({
    include: { rol: true }
  });
  console.log("=== USUARIOS EN DB ===");
  console.log(JSON.stringify(usuarios, null, 2));
}

main().finally(() => prisma.$disconnect());
