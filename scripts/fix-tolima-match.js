require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Corrigo horario del partido Tolima vs Medellín (ID 45)...");
  
  // 8:00 p.m. COL = 2026-08-05T01:00:00.000Z
  // 7:30 p.m. COL = 2026-08-05T00:30:00.000Z
  const p45 = await prisma.partido.update({
    where: { id: 45 },
    data: {
      fecha_hora_partido: new Date("2026-08-05T01:00:00.000Z"),
      hora_cierre_predicciones: new Date("2026-08-05T00:30:00.000Z")
    }
  });

  console.log("✅ Partido 45 actualizado:", p45);
}

main().catch(console.error).finally(() => prisma.$disconnect());
