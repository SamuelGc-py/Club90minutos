const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditAllUsers() {
  const users = await prisma.usuario.findMany({
    orderBy: { id: 'asc' },
    include: {
      predicciones_partido: true,
      prediccion_inicial: true
    }
  });

  console.log(`=== AUDITORÍA DE USUARIOS (${users.length} total) ===`);
  users.forEach(u => {
    console.log(`ID: ${u.id} | Nombre: ${u.nombre_completo} | Correo: ${u.correo} | Activo: ${u.activo} | Password: ${u.password ? 'SÍ' : 'NO (null)'} | PredsPartido: ${u.predicciones_partido.length}`);
  });

  const partidos = await prisma.partido.findMany({
    include: { equipo_local: true, equipo_visitante: true }
  });
  console.log(`\n=== PARTIDOS FECHA 1 (${partidos.length} total) ===`);
  partidos.forEach(p => {
    console.log(`Match ID: ${p.id} | ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} | Estado: ${p.estado} | Cierre: ${p.hora_cierre_predicciones.toISOString()}`);
  });
}

auditAllUsers().catch(console.error).finally(() => prisma.$disconnect());
