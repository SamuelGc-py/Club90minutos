import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const millonarios = await prisma.equipo.findFirst({ where: { nombre: "Millonarios F.C." }});
  
  if (millonarios) {
    const partido98 = await prisma.partido.update({
      where: { id: 98 },
      data: { equipo_local_id: millonarios.id }
    });
    console.log("Partido 98 actualizado: Millonarios vs Internacional de Bogotá");
  }
}

main().finally(() => prisma.$disconnect());
