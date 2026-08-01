const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log("Limpiando partidos que no han jugado (34, 35, 36)...");

  // Partidos 34, 35, 36 que fueron tocados indebidamente
  const matchIds = [34, 35, 36];

  for (const id of matchIds) {
    const resOficial = await prisma.resultadoOficial.findUnique({ where: { partido_id: id } });
    if (resOficial) {
      await prisma.resultadoGoleador.deleteMany({ where: { resultado_oficial_id: resOficial.id } });
      await prisma.resultadoOficial.delete({ where: { partido_id: id } });
    }
    await prisma.partido.update({
      where: { id },
      data: { estado: "programado" }
    });
    console.log(`✅ Partido ${id} restaurado a 'programado' y se eliminó resultado_oficial 0-0 artificial.`);
  }

  // Verificar Pasto vs Aguilas (ID 33) también si el usuario quiere que quede programado
  const p33 = await prisma.partido.findUnique({ where: { id: 33 }, include: { resultado_oficial: true } });
  if (p33 && p33.resultado_oficial) {
    await prisma.resultadoGoleador.deleteMany({ where: { resultado_oficial_id: p33.resultado_oficial.id } });
    await prisma.resultadoOficial.delete({ where: { partido_id: 33 } });
    await prisma.partido.update({ where: { id: 33 }, data: { estado: "programado" } });
    console.log(`✅ Partido 33 (Pasto vs Águilas) restaurado a 'programado' y se limpió resultado_oficial en vivo.`);
  }
}

clean().catch(console.error).finally(() => prisma.$disconnect());
