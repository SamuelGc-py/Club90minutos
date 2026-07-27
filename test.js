const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.partido.findMany().then(p => {
  console.log(p.map(x => ({id: x.id, jornada: x.jornada, fecha: x.fecha_hora_partido, estado: x.estado})));
}).catch(console.error).finally(()=>prisma.$disconnect());
