import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const finalUserId = 4; // ID de Ricardo Vanegas
  const equipoJunior = await prisma.equipo.findFirst({
    where: { nombre: { contains: "Junior", mode: "insensitive" } }
  });

  if (!equipoJunior) return;

  // Buscar todos los partidos de Junior alrededor de Septiembre 2026
  const partidosJunior = await prisma.partido.findMany({
    where: {
      OR: [
        { equipo_local_id: equipoJunior.id },
        { equipo_visitante_id: equipoJunior.id }
      ],
      fecha_hora_partido: {
        gte: new Date("2026-09-20"),
        lte: new Date("2026-09-30")
      }
    },
    include: {
      equipo_local: true,
      equipo_visitante: true
    },
    orderBy: {
      fecha_hora_partido: 'asc'
    }
  });

  console.log("Partidos de Junior encontrados cerca de HOY (Finales de Septiembre 2026):");
  if (partidosJunior.length === 0) {
    console.log("No hay partidos de Junior programados entre el 20 y el 30 de septiembre.");
  }

  for (const partido of partidosJunior) {
    console.log(`- ID: ${partido.id} | ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre} (${partido.fecha_hora_partido.toISOString()})`);
    
    // Revisar si el usuario metió marcador
    const prediccion = await prisma.prediccionPartido.findFirst({
      where: {
        usuario_id: finalUserId,
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
