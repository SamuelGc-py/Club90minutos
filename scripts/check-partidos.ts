import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const partidos = await prisma.partido.findMany({
    where: {
      fecha_hora_partido: {
        gte: new Date('2026-08-25T00:00:00Z'),
        lt: new Date('2026-08-26T00:00:00Z')
      }
    },
    include: {
      equipo_local: true,
      equipo_visitante: true
    }
  });
  console.log(JSON.stringify(partidos, null, 2));
}

main().finally(() => prisma.$disconnect());
