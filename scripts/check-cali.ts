import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const cali = await prisma.equipo.findFirst({ where: { nombre: 'Deportivo Cali' }});
  if (cali) {
    const jugadores = await prisma.jugador.findMany({ where: { equipo_id: cali.id } });
    console.log("Deportivo Cali jugadores:");
    console.log(JSON.stringify(jugadores, null, 2));
  }
}
main().finally(() => prisma.$disconnect());
