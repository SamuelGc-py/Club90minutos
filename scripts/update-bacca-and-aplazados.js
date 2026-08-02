const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Actualizar Bacca a Deportivo Cali (id: 3)
  const baccaUpdate = await prisma.jugador.updateMany({
    where: { nombre: { contains: 'Bacca', mode: 'insensitive' } },
    data: { equipo_id: 3 }
  });
  console.log('Bacca actualizado a Deportivo Cali:', baccaUpdate);

  // 2. Marcar Cúcuta vs Internacional de Bogotá (ID 40) como aplazado
  const partidoCucuta = await prisma.partido.update({
    where: { id: 40 },
    data: { estado: 'aplazado' }
  });
  console.log('Partido Cúcuta ID 40 actualizado a aplazado:', partidoCucuta);
}

main().finally(() => prisma.$disconnect());
