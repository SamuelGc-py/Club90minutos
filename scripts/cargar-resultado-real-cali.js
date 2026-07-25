const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cargarResultadoOficialCali() {
  const cali = await prisma.partido.findFirst({
    where: { equipo_local: { nombre: { contains: 'Cali' } } }
  });

  if (!cali) return;

  const admin = await prisma.usuario.findFirst({
    where: { rol: { nombre: 'administrador' } }
  });

  const { calcularPuntosPartido } = require('../src/lib/calculadorPuntos.ts');

  // Cargar resultado oficial: Cali 2 - 0 Jaguares (Goleador: Steven Rodríguez id 118)
  const res = await calcularPuntosPartido(cali.id, 2, 0, 118, admin.id);

  console.log("✅ RESULTADO REAL CARGADO:", res);

  // Consultar la nueva tabla de posiciones con los puntos calculados
  const consolidadosRes = await fetch('http://localhost:3000/api/consolidados?usuario_id=' + admin.id).catch(() => null);
  
  const puntajesGenerados = await prisma.puntaje.findMany({
    where: { partido_id: cali.id },
    include: { usuario: true }
  });

  console.log("\n📊 DESGLOSE DE PUNTOS OTORGADOS PARA CALI 2 - 0 JAGUARES (Goleador: Steven Rodríguez):\n");
  puntajesGenerados.forEach(p => {
    console.log(`- ${p.usuario.nombre_completo}: +${p.puntos_obtenidos} Pts (${p.categoria})`);
  });
}

cargarResultadoOficialCali().catch(console.error).finally(() => prisma.$disconnect());
