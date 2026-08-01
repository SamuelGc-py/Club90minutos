const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Cargando pronósticos para Samuel Gutierrez y Nelson Berdugo en Pasto vs Águilas Doradas...");

  // 1. Partido Pasto vs Águilas (ID 33)
  const partido = await prisma.partido.findUnique({
    where: { id: 33 },
    include: {
      equipo_local: { include: { jugadores: true } },
      equipo_visitante: { include: { jugadores: true } }
    }
  });

  if (!partido) {
    throw new Error("No se encontró el partido Pasto vs Águilas Doradas (ID 33)");
  }

  // 2. Jugador #9 de Pasto (Santiago Córdoba - ID 143)
  const goleador = partido.equipo_local.jugadores.find(
    j => j.nombre.toLowerCase().includes('cordoba') || j.id === 143
  );

  const goleadorId = goleador ? goleador.id : 143;
  console.log(`Goleador seleccionado (#9 Pasto): ${goleador ? goleador.nombre : 'Santiago Córdoba'} (ID: ${goleadorId})`);

  // 3. Samuel Gutierrez
  const samuel = await prisma.usuario.findFirst({
    where: {
      OR: [
        { correo: { contains: 'samucobaggg', mode: 'insensitive' } },
        { nombre_completo: { contains: 'Samuel', mode: 'insensitive' } }
      ]
    }
  });

  if (!samuel) throw new Error("Usuario Samuel no encontrado");

  // 4. Nelson Berdugo
  const nelson = await prisma.usuario.findFirst({
    where: {
      OR: [
        { correo: { contains: 'nelson.berdugo', mode: 'insensitive' } },
        { nombre_completo: { contains: 'Nelson', mode: 'insensitive' } }
      ]
    }
  });

  if (!nelson) throw new Error("Usuario Nelson no encontrado");

  // Upsert pronóstico para Samuel (1-1, gol Santiago Córdoba)
  await prisma.prediccionPartido.upsert({
    where: {
      usuario_id_partido_id: {
        usuario_id: samuel.id,
        partido_id: partido.id
      }
    },
    update: {
      goles_local_predicho: 1,
      goles_visitante_predicho: 1,
      jugador_goleador_predicho_id: goleadorId,
      timestamp_envio: new Date(),
      estado: "enviada"
    },
    create: {
      usuario_id: samuel.id,
      partido_id: partido.id,
      goles_local_predicho: 1,
      goles_visitante_predicho: 1,
      jugador_goleador_predicho_id: goleadorId,
      timestamp_envio: new Date(),
      estado: "enviada"
    }
  });

  console.log(`✅ Pronóstico cargado para Samuel (${samuel.nombre_completo}): Pasto 1 - 1 Águilas (Gol: ${goleador ? goleador.nombre : 'Santiago Córdoba'})`);

  // Upsert pronóstico para Nelson (1-1, gol Santiago Córdoba)
  await prisma.prediccionPartido.upsert({
    where: {
      usuario_id_partido_id: {
        usuario_id: nelson.id,
        partido_id: partido.id
      }
    },
    update: {
      goles_local_predicho: 1,
      goles_visitante_predicho: 1,
      jugador_goleador_predicho_id: goleadorId,
      timestamp_envio: new Date(),
      estado: "enviada"
    },
    create: {
      usuario_id: nelson.id,
      partido_id: partido.id,
      goles_local_predicho: 1,
      goles_visitante_predicho: 1,
      jugador_goleador_predicho_id: goleadorId,
      timestamp_envio: new Date(),
      estado: "enviada"
    }
  });

  console.log(`✅ Pronóstico cargado para Nelson (${nelson.nombre_completo}): Pasto 1 - 1 Águilas (Gol: ${goleador ? goleador.nombre : 'Santiago Córdoba'})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
