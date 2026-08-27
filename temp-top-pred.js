const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.prediccionPartido.findMany({ 
    where: { usuario_id: { in: [18, 32] }, partido_id: { in: [87, 92] } }, // 18 = Rene, 32 = Pedro
    include: { partido: { include: { equipo_local: true, equipo_visitante: true } } }
  }); 
  console.log(JSON.stringify(p, null, 2)); 
} 
main().finally(() => prisma.$disconnect());
