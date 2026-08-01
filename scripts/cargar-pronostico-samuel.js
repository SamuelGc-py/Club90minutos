const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usr = await prisma.usuario.findFirst({
    where: { nombre_completo: { contains: 'Samuel', mode: 'insensitive' } }
  });

  const partido = await prisma.partido.findFirst({
    where: { equipo_local: { nombre: { contains: 'Alianza', mode: 'insensitive' } } }
  });

  if (!usr || !partido) {
    console.error("Usuario o Partido no encontrado.");
    return;
  }

  const res = await prisma.prediccionPartido.upsert({
    where: {
      usuario_id_partido_id: {
        usuario_id: usr.id,
        partido_id: partido.id
      }
    },
    create: {
      usuario_id: usr.id,
      partido_id: partido.id,
      goles_local_predicho: 1,
      goles_visitante_predicho: 3,
      jugador_goleador_predicho_id: 89, // Luis Sandoval
      timestamp_envio: new Date(),
      estado: "enviada"
    },
    update: {
      goles_local_predicho: 1,
      goles_visitante_predicho: 3,
      jugador_goleador_predicho_id: 89, // Luis Sandoval
      timestamp_envio: new Date(),
      estado: "enviada"
    }
  });

  console.log("Pronóstico de Samuel Gutierrez (Alianza 1 - 3 Tolima, Gol: Luis Sandoval) guardado con éxito:", res);
}

main().catch(console.error).finally(() => prisma.$disconnect());
