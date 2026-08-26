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
    return { id: u.id, name: `${u.nombres} ${u.apellidos}`, total };
  }).sort((a,b) => b.total - a.total);
  
  console.table(data);
}
main().finally(()=>prisma.$disconnect());
