const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.usuario.findMany({
    include: {
      puntajes: true
    }
  });
  const data = users.map(u => {
    const total = u.puntajes.reduce((acc, curr) => acc + curr.puntos_obtenidos, 0);
    return { name: u.nombre, total };
  }).sort((a,b) => b.total - a.total);
  
  console.log(data);
}
main().finally(()=>prisma.$disconnect());
