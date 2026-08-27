const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cutoffDate = new Date('2026-08-25T00:00:00.000Z');

  const puntosViejos = await prisma.puntaje.findMany({
    where: {
      OR: [
        { partido_id: null },
        { partido: { fecha_hora_partido: { lt: cutoffDate } } }
      ]
    }
  });

  const puntosNuevos = await prisma.puntaje.findMany({
    where: {
      partido: { fecha_hora_partido: { gte: cutoffDate } }
    }
  });

  const resumen = {};
  
  const usuarios = await prisma.usuario.findMany();
  for (const u of usuarios) {
    if (u.id !== 1) { 
      resumen[u.id] = { nombre: u.nombre_completo, viejo: 0, nuevo: 0, total: 0 };
    }
  }

  puntosViejos.forEach(p => {
    if(resumen[p.usuario_id]) {
        resumen[p.usuario_id].viejo += p.puntos_obtenidos;
        resumen[p.usuario_id].total += p.puntos_obtenidos;
    }
  });

  puntosNuevos.forEach(p => {
    if(resumen[p.usuario_id]) {
        resumen[p.usuario_id].nuevo += p.puntos_obtenidos;
        resumen[p.usuario_id].total += p.puntos_obtenidos;
    }
  });

  const top = Object.values(resumen)
    .sort((a, b) => b.total - a.total)
    .slice(0, 15); 

  console.log("=== RESUMEN DE PUNTOS ===");
  console.log("Nombre".padEnd(25) + "| Ayer".padEnd(8) + "| +Nuevos".padEnd(10) + "| Total");
  for (const t of top) {
    const nombre = (t.nombre || 'Desconocido').padEnd(25);
    console.log(`${nombre}| ${t.viejo.toString().padEnd(6)}| +${t.nuevo.toString().padEnd(7)}| ${t.total}`);
  }
}
main().finally(() => prisma.$disconnect());
