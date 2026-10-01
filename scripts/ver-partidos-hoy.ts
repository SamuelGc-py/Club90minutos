import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const hoy = new Date();
  
  const partidos = await prisma.partido.findMany({
    include: { equipo_local: true, equipo_visitante: true },
    where: { 
       estado: { in: ['programado', 'predicciones_abiertas'] }
    },
    orderBy: { fecha_hora_partido: 'asc' },
    take: 30
  });
  
  console.log('Próximos 30 partidos:');
  partidos.forEach(p => {
      console.log(`J${p.jornada} - ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} - ${p.fecha_hora_partido} - ${p.estado}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
