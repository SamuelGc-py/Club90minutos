import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("=== MOVER JUGADORES SIN MAESTRO A 'Plantilla Descartados' ===\n");

  // 1. Buscar el equipo "Plantilla Descartados"
  let descartados = await prisma.equipo.findFirst({
    where: { nombre: { contains: "Descartados" } },
  });

  if (!descartados) {
    console.log("Equipo 'Plantilla Descartados' no existe. Creándolo...");
    descartados = await prisma.equipo.create({
      data: { nombre: "Plantilla Descartados" },
    });
  }
  console.log(`Equipo Descartados: ID ${descartados.id}\n`);

  // 2. Los 10 jugadores que no están en el Maestro pero tienen pronósticos
  const idsAMover = [
    1005,  // Jean Galindo - Deportivo Cali
    1177,  // Kahiser Lenis - Jaguares
    1332,  // Bayron Caicedo - Internacional de Bogotá
    1297,  // Jaen Pineda - Águilas Doradas
    952,   // Johan Montes - Cúcuta
    943,   // Jonathan Agudelo - Cúcuta
    949,   // Juan Camilo Moreno - Cúcuta
    1377,  // Nelson Quiñones - Cúcuta
    954,   // William Parra - Cúcuta
  ];

  // 3. Verificar estado actual
  const jugadores = await prisma.jugador.findMany({
    where: { id: { in: idsAMover } },
    include: { equipo: true },
  });

  console.log("Jugadores a mover:");
  for (const j of jugadores) {
    const preds = await prisma.prediccionPartido.count({ where: { jugador_goleador_predicho_id: j.id } });
    const goles = await prisma.resultadoGoleador.count({ where: { jugador_id: j.id } });
    console.log(`  ID ${j.id}: "${j.nombre}" (${j.equipo.nombre}) → Descartados  [${preds} pred, ${goles} goles — conservados]`);
  }

  // 4. Moverlos
  // Hay que tener cuidado con el constraint UNIQUE(nombre, equipo_id)
  // Si dos jugadores tienen el mismo nombre y van al mismo equipo "Descartados", chocaría
  // Verificamos primero
  const nombres = jugadores.map(j => j.nombre.toLowerCase().trim());
  const nombresUnicos = new Set(nombres);
  if (nombresUnicos.size !== nombres.length) {
    console.log("\n⚠️ Hay nombres duplicados entre los jugadores a mover. Agregando sufijo...");
  }

  for (const j of jugadores) {
    // Verificar si ya existe en Descartados con ese nombre
    const yaExiste = await prisma.jugador.findFirst({
      where: {
        equipo_id: descartados.id,
        nombre: { equals: j.nombre, mode: "insensitive" },
      },
    });

    if (yaExiste) {
      // Agregar ID al nombre para evitar colisión
      await prisma.jugador.update({
        where: { id: j.id },
        data: { equipo_id: descartados.id, nombre: `${j.nombre} (ex-${j.equipo.nombre})` },
      });
    } else {
      await prisma.jugador.update({
        where: { id: j.id },
        data: { equipo_id: descartados.id },
      });
    }
  }

  console.log(`\n✅ ${jugadores.length} jugadores movidos a 'Plantilla Descartados'.`);
  console.log("   Sus pronósticos y goles siguen intactos (mismo ID, solo cambió el equipo).");

  // 5. Verificación
  const enDescartados = await prisma.jugador.findMany({
    where: { equipo_id: descartados.id },
    include: { equipo: true },
  });
  console.log(`\nJugadores en 'Plantilla Descartados': ${enDescartados.length}`);
  for (const j of enDescartados) {
    console.log(`  ID ${j.id}: "${j.nombre}"`);
  }

  const totalActivos = await prisma.jugador.count({
    where: { equipo_id: { not: descartados.id } },
  });
  console.log(`\nJugadores en plantillas activas: ${totalActivos}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
