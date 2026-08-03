const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const partido = await prisma.partido.findFirst({
    where: {
      jornada: 3,
      equipo_local: { nombre: { contains: 'Pereira', mode: 'insensitive' } },
      equipo_visitante: { nombre: { contains: 'Santa Fe', mode: 'insensitive' } },
    },
    include: {
      equipo_local: true,
      equipo_visitante: true,
    }
  });

  if (partido) {
    const nuevaFecha = new Date('2026-09-29T20:00:00-05:00');
    const nuevaCierre = new Date(nuevaFecha.getTime() - 60 * 60 * 1000);

    await prisma.partido.update({
      where: { id: partido.id },
      data: {
        estado: 'aplazado',
        fecha_hora_partido: nuevaFecha,
        hora_cierre_predicciones: nuevaCierre,
      }
    });
    console.log(`✅ Partido de Santa Fe (ID ${partido.id}) actualizado exitosamente a APLAZADO para el 29 de septiembre de 2026.`);
  } else {
    console.error("❌ No se encontró el partido Deportivo Pereira vs Independiente Santa Fe en la Fecha 3.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
