const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const nelson = await prisma.usuario.findFirst({
    where: { correo: { contains: 'nelson.berdugo', mode: 'insensitive' } }
  });

  if (!nelson) throw new Error("Usuario Nelson no encontrado");

  console.log(`Guardando pronósticos para ${nelson.nombre_completo} (ID ${nelson.id})...`);

  // 1. Alianza vs Tolima (ID 34): Tolima gana 2-1 (Alianza 1 - Tolima 2, Gol Luis Sandoval ID 89)
  await prisma.prediccionPartido.upsert({
    where: { usuario_id_partido_id: { usuario_id: nelson.id, partido_id: 34 } },
    update: { goles_local_predicho: 1, goles_visitante_predicho: 2, jugador_goleador_predicho_id: 89, timestamp_envio: new Date(), estado: "enviada" },
    create: { usuario_id: nelson.id, partido_id: 34, goles_local_predicho: 1, goles_visitante_predicho: 2, jugador_goleador_predicho_id: 89, timestamp_envio: new Date(), estado: "enviada" }
  });
  console.log("✅ Pronóstico cargado: Alianza 1 - 2 Tolima (Gol: Luis Sandoval 'Chino')");

  // 2. Medellín vs Cali (ID 35): Medellín gana 2-1 (Medellín 2 - Cali 1, Gol Jeison Medina ID 187)
  await prisma.prediccionPartido.upsert({
    where: { usuario_id_partido_id: { usuario_id: nelson.id, partido_id: 35 } },
    update: { goles_local_predicho: 2, goles_visitante_predicho: 1, jugador_goleador_predicho_id: 187, timestamp_envio: new Date(), estado: "enviada" },
    create: { usuario_id: nelson.id, partido_id: 35, goles_local_predicho: 2, goles_visitante_predicho: 1, jugador_goleador_predicho_id: 187, timestamp_envio: new Date(), estado: "enviada" }
  });
  console.log("✅ Pronóstico cargado: Medellín 2 - 1 Cali (Gol: Jeison Medina)");

  // 3. Junior vs Millos (ID 36): Junior gana 2-1 (Junior 2 - Millos 1, Gol Guillermo Paiva ID 241)
  await prisma.prediccionPartido.upsert({
    where: { usuario_id_partido_id: { usuario_id: nelson.id, partido_id: 36 } },
    update: { goles_local_predicho: 2, goles_visitante_predicho: 1, jugador_goleador_predicho_id: 241, timestamp_envio: new Date(), estado: "enviada" },
    create: { usuario_id: nelson.id, partido_id: 36, goles_local_predicho: 2, goles_visitante_predicho: 1, jugador_goleador_predicho_id: 241, timestamp_envio: new Date(), estado: "enviada" }
  });
  console.log("✅ Pronóstico cargado: Junior 2 - 1 Millonarios (Gol: Guillermo Paiva)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
