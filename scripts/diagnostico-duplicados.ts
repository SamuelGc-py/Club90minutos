import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log("=== DIAGNÓSTICO AMPLIADO DE DUPLICADOS ===\n");

  const jugadores = await prisma.jugador.findMany({
    include: { equipo: true },
    orderBy: [{ nombre: "asc" }],
  });

  // --- CASO 1: Mismo nombre normalizado + MISMO equipo ---
  const mapExacto = new Map<string, typeof jugadores>();
  for (const j of jugadores) {
    const key = `${j.equipo_id}::${normalize(j.nombre)}`;
    if (!mapExacto.has(key)) mapExacto.set(key, []);
    mapExacto.get(key)!.push(j);
  }
  const dupsExactos = [...mapExacto.entries()].filter(([, list]) => list.length > 1);
  console.log(`1. Duplicados exactos (mismo nombre normalizado + mismo equipo): ${dupsExactos.length}`);
  for (const [, list] of dupsExactos) {
    console.log(`   "${list[0].nombre}" (${list[0].equipo.nombre}): IDs ${list.map((j) => j.id).join(", ")}`);
  }

  // --- CASO 2: Mismo nombre normalizado + DISTINTO equipo ---
  const mapNombre = new Map<string, typeof jugadores>();
  for (const j of jugadores) {
    const key = normalize(j.nombre);
    if (!mapNombre.has(key)) mapNombre.set(key, []);
    mapNombre.get(key)!.push(j);
  }
  const dupsNombre = [...mapNombre.entries()].filter(
    ([, list]) => list.length > 1 && new Set(list.map((j) => j.equipo_id)).size > 1
  );
  console.log(`\n2. Mismo nombre en DISTINTOS equipos (posibles traspasos): ${dupsNombre.length}`);
  for (const [name, list] of dupsNombre) {
    console.log(`   "${list[0].nombre}": ${list.map((j) => `ID ${j.id} (${j.equipo.nombre})`).join(", ")}`);
  }

  // --- CASO 3: Nombres MUY similares en mismo equipo (variantes de acentos, espacios, etc.)
  const dupsSimilares: { j1: (typeof jugadores)[0]; j2: (typeof jugadores)[0] }[] = [];
  const porEquipo = new Map<number, typeof jugadores>();
  for (const j of jugadores) {
    if (!porEquipo.has(j.equipo_id)) porEquipo.set(j.equipo_id, []);
    porEquipo.get(j.equipo_id)!.push(j);
  }

  for (const [, lista] of porEquipo) {
    for (let i = 0; i < lista.length; i++) {
      for (let k = i + 1; k < lista.length; k++) {
        const n1 = normalize(lista[i].nombre);
        const n2 = normalize(lista[k].nombre);
        // Chequeo: uno contiene al otro, o difieren en <=2 caracteres
        if (n1 !== n2 && (n1.includes(n2) || n2.includes(n1))) {
          dupsSimilares.push({ j1: lista[i], j2: lista[k] });
        }
      }
    }
  }

  console.log(`\n3. Nombres similares en MISMO equipo (uno contiene al otro): ${dupsSimilares.length}`);
  for (const { j1, j2 } of dupsSimilares) {
    console.log(`   "${j1.nombre}" (ID ${j1.id}) vs "${j2.nombre}" (ID ${j2.id}) — ${j1.equipo.nombre}`);
  }

  // --- Estadísticas extra ---
  const equipoCounts = new Map<string, number>();
  for (const j of jugadores) {
    equipoCounts.set(j.equipo.nombre, (equipoCounts.get(j.equipo.nombre) || 0) + 1);
  }
  console.log(`\n4. Distribución de jugadores por equipo:`);
  const sorted = [...equipoCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [equipo, count] of sorted) {
    console.log(`   ${equipo}: ${count} jugadores`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
