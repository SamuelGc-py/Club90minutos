const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const samuel = await prisma.usuario.findFirst({
    where: { correo: 'samucobaggg@gmail.com' }
  });

  const preds = await prisma.prediccionPartido.findMany({
    where: { usuario_id: samuel.id },
    include: {
      partido: {
        include: {
          resultado_oficial: {
            include: { goleadores: true }
          },
          equipo_local: true,
          equipo_visitante: true
        }
      },
      jugador_goleador: true
    }
  });

  console.log("\n=== DETALLE PREDICCIONES DE SAMUEL ===");
  for (const p of preds) {
    console.log("Partido ID:", p.partido_id, `${p.partido.equipo_local.nombre} vs ${p.partido.equipo_visitante.nombre}`);
    console.log("Prediccion:", { goles_local: p.goles_local_predicho, goles_visitante: p.goles_visitante_predicho, goleador: p.jugador_goleador?.nombre, goleador_id: p.jugador_goleador_id });
    console.log("Resultado oficial:", p.partido.resultado_oficial);
    console.log("-----------------------------------");
  }

  await prisma.$disconnect();
}

test().catch(console.error);
