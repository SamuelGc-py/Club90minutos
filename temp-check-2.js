const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.partido.count({where: {estado: 'puntaje_calculado'}});
  console.log('Calculated matches:', c);
}
main().finally(()=>prisma.$disconnect());
