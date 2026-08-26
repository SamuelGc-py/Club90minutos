import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const jugadores = await prisma.jugador.findMany({
    include: { equipo: true }
  });

  console.log(`Total jugadores: ${jugadores.length}`);

  // Check for exact duplicates (same name, same team)
  const duplicates: any[] = [];
  const map = new Map<string, any[]>();

  for (const j of jugadores) {
    const key = `${j.equipo_id}-${j.nombre.toLowerCase().trim()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(j);
  }

  for (const [key, list] of map.entries()) {
    if (list.length > 1) {
      duplicates.push(list);
    }
  }

  console.log(`Found ${duplicates.length} exact duplicates (same team, exact same name).`);
  if (duplicates.length > 0) {
    console.log(JSON.stringify(duplicates, null, 2));
  }

  // Check where Carlos Bacca and Eduar Bello are
  const specific = jugadores.filter(j => 
    j.nombre.toLowerCase().includes("bacca") || 
    j.nombre.toLowerCase().includes("bello")
  );
  console.log("\nCarlos Bacca y Eduar Bello:");
  console.log(JSON.stringify(specific, null, 2));

}

main().finally(() => prisma.$disconnect());
