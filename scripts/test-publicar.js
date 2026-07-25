const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPublicarResultado() {
  const partido = await prisma.partido.findFirst({
    where: {
      equipo_local: { nombre: { contains: 'Cali' } },
      equipo_visitante: { nombre: { contains: 'Jaguares' } }
    }
  });

  if (!partido) return;

  const { calcularPuntosPartido } = require('../src/lib/calculadorPuntos.ts');
  const samu = await prisma.usuario.findUnique({ where: { correo: 'samucobaggg@gmail.com' } });

  await calcularPuntosPartido(partido.id, 2, 0, 115, samu.id);
  console.log("Resultado oficial publicado para Cali vs Jaguares (2 - 0)");
}

testPublicarResultado().catch(console.error).finally(() => prisma.$disconnect());
