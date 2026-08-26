import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.partido.findUnique({
    where: { id: 92 },
    include: { equipo_local: true, equipo_visitante: true }
  });
  console.log("Partido 92:", JSON.stringify(p, null, 2));

  // Find matches that have 'cucuta' or 'cúcuta' today
  const allMatches = await prisma.partido.findMany({
    include: { equipo_local: true, equipo_visitante: true },
    where: {
      fecha_hora_partido: {
        gte: new Date('2026-08-25T00:00:00Z'),
        lt: new Date('2026-08-26T23:59:59Z')
      }
    }
  });
  console.log("All matches within 25-26:", JSON.stringify(allMatches, null, 2));
}
main().finally(() => prisma.$disconnect());
