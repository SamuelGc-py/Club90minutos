import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Buscando a Ricardo Vanegas...");
  const usuario = await prisma.usuario.findFirst({
    where: {
      nombre_completo: {
        contains: "ricardo vanegas",
        mode: "insensitive"
      }
    }
  });

  if (!usuario) {
    console.log("No se encontró ningún usuario con ese nombre.");
    return;
  }
  
  console.log(`Encontrado: ${usuario.nombre_completo} (ID: ${usuario.id})`);

  console.log("\nBuscando partidos de Junior...");
  const equipoJunior = await prisma.equipo.findFirst({
    where: {
      nombre: {
        contains: "Junior",
        mode: "insensitive"
      }
    }
  });

  if (!equipoJunior) {
    console.log("No se encontró el equipo Junior.");
    return;
  }

  // Buscar los últimos partidos de Junior
  const partidosJunior = await prisma.partido.findMany({
    where: {
      OR: [
        { equipo_local_id: equipoJunior.id },
        { equipo_visitante_id: equipoJunior.id }
      ]
    },
    include: {
      equipo_local: true,
      equipo_visitante: true
    },
    orderBy: {
      fecha_hora_partido: 'desc'
    },
    take: 5 // los últimos 5 partidos por si acaso
  });

  console.log("Últimos partidos encontrados de Junior:");
  for (const partido of partidosJunior) {
    console.log(`- ID: ${partido.id} | ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre} (${partido.fecha_hora_partido.toISOString().split('T')[0]})`);
    
    // Revisar si el usuario metió marcador
    const prediccion = await prisma.prediccionPartido.findFirst({
      where: {
        usuario_id: usuario.id,
        partido_id: partido.id
      },
      include: {
        jugador_goleador: true
      }
    });

    if (prediccion) {
      const goleador = prediccion.jugador_goleador ? prediccion.jugador_goleador.nombre : "Sin goleador";
      console.log(`  ✅ PRONÓSTICO ENCONTRADO: ${prediccion.goles_local_predicho} - ${prediccion.goles_visitante_predicho} (Goleador elegido: ${goleador})`);
    } else {
      console.log(`  ❌ No metió pronóstico para este partido.`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
