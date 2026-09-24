import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const missingPlayers = [
    { nombre: "Miguel Correa", equipo_id: 3 },
    { nombre: "Derik Osede", equipo_id: 8 },
    { nombre: "Edwin Cabezas", equipo_id: 18 },
    { nombre: "Mariano Vázquez", equipo_id: 18 },
    { nombre: "Kevin Balanta Carabalí", equipo_id: 18 },
    { nombre: "Jackson Martínez", equipo_id: 7 },
    { nombre: "Jhoyler Andrades", equipo_id: 16 },
    { nombre: "Andrés Mosquera Marmolejo", equipo_id: 16 },
    { nombre: "Emanuel Arboleda", equipo_id: 13 },
    { nombre: "Jefferson Asprilla", equipo_id: 13 },
    { nombre: "Brandon Churi", equipo_id: 1 },
    { nombre: "Carlos Cortes", equipo_id: 1 },
    { nombre: "Hector Arango", equipo_id: 15 },
    { nombre: "Luis Vásquez Díaz", equipo_id: 15 }
  ];

  console.log("=== AGREGANDO JUGADORES FALTANTES DEL MAESTRO ===\n");
  let agregados = 0;

  for (const player of missingPlayers) {
    const exists = await prisma.jugador.findFirst({
      where: {
        nombre: { equals: player.nombre, mode: "insensitive" },
        equipo_id: player.equipo_id
      }
    });

    if (!exists) {
      await prisma.jugador.create({
        data: player
      });
      console.log(`✅ Agregado: ${player.nombre} (Equipo ID: ${player.equipo_id})`);
      agregados++;
    } else {
      console.log(`⚠️ Ya existe: ${player.nombre} (Equipo ID: ${player.equipo_id})`);
    }
  }

  console.log(`\nProceso finalizado. Total agregados: ${agregados}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
