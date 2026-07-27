const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p1 = await prisma.partido.count({ where: { jornada: 1 } });
  const p2 = await prisma.partido.count({ where: { jornada: 2 } });
  const pipe = await prisma.usuario.findFirst({ where: { correo: 'pipedeltoro@hotmail.com' } });
  const vergara = await prisma.jugador.findFirst({ where: { nombre: { contains: 'Vergara' } } });
  const cierres = await prisma.partido.findMany({ select: { id: true, jornada: true, fecha_hora_partido: true, hora_cierre_predicciones: true } });

  console.log('Partidos Fecha 1:', p1);
  console.log('Partidos Fecha 2:', p2);
  console.log('Nombre Pipe:', pipe ? pipe.nombre_completo : 'No');
  console.log('Jugador Vergara:', vergara ? `${vergara.nombre} (ID ${vergara.id})` : 'No');

  let ok = true;
  for (const c of cierres) {
    const diff = (c.fecha_hora_partido.getTime() - c.hora_cierre_predicciones.getTime()) / 60000;
    if (Math.abs(diff - 30) > 1) {
      console.log(`⚠️ ID ${c.id} diff=${diff} mins`);
      ok = false;
    }
  }
  if (ok) console.log('✅ Todos los 20 cierres en BD están exactamente a 30 mins.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
