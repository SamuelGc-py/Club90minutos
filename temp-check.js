const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const partidos = await prisma.partido.findMany({ 
    where: { estado: { notIn: ['programado', 'aplazado', 'predicciones_abiertas', 'predicciones_cerradas'] } }, 
    include: { equipo_local: true, equipo_visitante: true } 
  }); 
  console.log(partidos.map(p => ({id: p.id, local: p.equipo_local.nombre, vis: p.equipo_visitante.nombre, estado: p.estado}))); 
} 
main().finally(() => prisma.$disconnect());
