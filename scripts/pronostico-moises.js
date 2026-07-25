const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPredictionForMoises() {
  const usuario = await prisma.usuario.findUnique({
    where: { correo: 'moisessaavedra496@gmail.com' }
  });

  if (!usuario) {
    console.error("No se encontró el usuario Moisés");
    return;
  }

  const partido = await prisma.partido.findFirst({
    where: {
      equipo_local: { nombre: { contains: 'Cali' } },
      equipo_visitante: { nombre: { contains: 'Jaguares' } }
    },
    include: {
      equipo_local: { include: { jugadores: true } },
      equipo_visitante: { include: { jugadores: true } }
    }
  });

  if (!partido) {
    console.error("No se encontró el partido Cali vs Jaguares");
    return;
  }

  const jugadores = [...partido.equipo_local.jugadores, ...partido.equipo_visitante.jugadores];
  const dinenno = jugadores.find(j => j.nombre.toLowerCase().includes('dinenno'));

  console.log("Partido ID:", partido.id);
  console.log("Dinenno encontrado:", dinenno ? `${dinenno.nombre} (ID: ${dinenno.id})` : "NO (se guardará sin goleador)");

  await prisma.prediccionPartido.upsert({
    where: {
      usuario_id_partido_id: {
        usuario_id: usuario.id,
        partido_id: partido.id,
      }
    },
    update: {
      goles_local_predicho: 2,
      goles_visitante_predicho: 0,
      jugador_goleador_predicho_id: dinenno ? dinenno.id : null,
      timestamp_envio: new Date(),
    },
    create: {
      usuario_id: usuario.id,
      partido_id: partido.id,
      goles_local_predicho: 2,
      goles_visitante_predicho: 0,
      jugador_goleador_predicho_id: dinenno ? dinenno.id : null,
      timestamp_envio: new Date(),
    }
  });

  console.log(`✅ Pronóstico guardado para Moisés: 2 - 0 (${dinenno ? dinenno.nombre : 'Sin goleador especificado'})`);
}

addPredictionForMoises().catch(console.error).finally(() => prisma.$disconnect());
