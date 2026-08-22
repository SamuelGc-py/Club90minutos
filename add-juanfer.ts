import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const dim = await prisma.equipo.findFirst({ where: { nombre: { contains: 'Medell' } } });
  if (dim) {
    await prisma.jugador.create({ data: { nombre: 'Juan Fernando Quintero', equipo_id: dim.id } });
    console.log('Agregado a', dim.nombre);
  }
}
main().finally(() => prisma.$disconnect());
