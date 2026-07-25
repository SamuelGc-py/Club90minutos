const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateClosingTimes() {
  const partidos = await prisma.partido.findMany();

  for (const p of partidos) {
    // Si el estado no es 'aplazado', asegurar que las predicciones estén abiertas si la fecha lo permite
    const fechaHora = new Date(p.fecha_hora_partido);
    const nuevoCierre = new Date(fechaHora.getTime() - 10 * 60 * 1000); // 10 min antes

    let nuevoEstado = p.estado;
    if (p.estado !== 'aplazado') {
      nuevoEstado = 'predicciones_abiertas';
    }

    await prisma.partido.update({
      where: { id: p.id },
      data: {
        hora_cierre_predicciones: nuevoCierre,
        estado: nuevoEstado
      }
    });
    console.log(`Actualizado partido ID ${p.id}: Cierre a ${nuevoCierre.toISOString()}`);
  }
}

updateClosingTimes().catch(console.error).finally(() => prisma.$disconnect());
