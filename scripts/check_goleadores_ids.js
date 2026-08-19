const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const predsConGoleador = await prisma.prediccionPartido.findMany({
    where: { jugador_goleador_predicho_id: { not: null } },
    select: { id: true, usuario_id: true, partido_id: true, jugador_goleador_predicho_id: true }
  });
  console.log("PREDICCIONES CON GOLEADOR:", predsConGoleador.length);

  const resGoleadores = await prisma.resultadoGoleador.findMany({
    include: { jugador: true }
  });
  console.log("RESULTADOS GOLEADOR REGISTRADOS EN DB:", resGoleadores.length);
  resGoleadores.forEach(r => {
    console.log(`ResultadoGoleador ID: ${r.id} | PartidoID: ${r.partido_id} | JugadorID: ${r.jugador_id} | JugadorNombre: ${r.jugador?.nombre || 'NULL'}`);
  });

  const idsJugadoresPred = Array.from(new Set(predsConGoleador.map(p => p.jugador_goleador_predicho_id)));
  const jugadoresExistentes = await prisma.jugador.findMany({
    where: { id: { in: idsJugadoresPred } }
  });
  console.log(`IDs unicos en predicciones: ${idsJugadoresPred.length} | Encontrados en tabla Jugador: ${jugadoresExistentes.length}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
