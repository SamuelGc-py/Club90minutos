import { prisma } from "../src/lib/db";

async function main() {
  console.log("Buscando jugador 'James Rodriguex' o similar...");
  
  const jugadoresErroneos = await prisma.jugador.findMany({
    where: {
      nombre: {
        contains: "Rodriguex",
        mode: "insensitive",
      },
    },
    include: {
      equipo: true,
      goles: true,
      predicciones_como_goleador: true,
      predicciones_goleador_torneo: true,
    },
  });

  console.log("Jugadores encontrados:", JSON.stringify(jugadoresErroneos, null, 2));

  for (const j of jugadoresErroneos) {
    if (j.goles.length === 0 && j.predicciones_como_goleador.length === 0 && j.predicciones_goleador_torneo.length === 0) {
      console.log(`Eliminando jugador erróneo sin referencias: ID ${j.id} (${j.nombre}) - Equipo: ${j.equipo.nombre}`);
      await prisma.jugador.delete({
        where: { id: j.id },
      });
      console.log("✅ Jugador eliminado exitosamente.");
    } else {
      console.warn(`⚠️ El jugador ID ${j.id} (${j.nombre}) tiene referencias en predicciones o goles. No se elimina automáticamente.`);
    }
  }
}

main()
  .catch((e) => {
    console.error("Error al borrar jugador:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
