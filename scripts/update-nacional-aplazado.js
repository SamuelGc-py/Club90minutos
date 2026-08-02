const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Boyacá Chicó vs Nacional (ID 23) with rescheduled date (9 de Septiembre 8:00 PM UTC-5 = 2026-09-10T01:00:00Z)
  const p23 = await prisma.partido.update({
    where: { id: 23 },
    data: {
      fecha_hora_partido: new Date('2026-09-10T01:00:00.000Z'),
      hora_cierre_predicciones: new Date('2026-09-10T00:30:00.000Z'),
      estado: 'aplazado'
    }
  });
  console.log('Match 23 updated:', p23);
}

main().finally(() => prisma.$disconnect());
