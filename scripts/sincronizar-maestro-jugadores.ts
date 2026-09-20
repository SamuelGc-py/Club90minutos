import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();

function normalize(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log("=== SINCRONIZACIÓN MAESTRO DE JUGADORES (POSTGRESQL) ===");

  const filePath = path.join("C:", "Users", "Samuel Gc", "Downloads", "Maestro_Liga BetplayII (3).xlsx");
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets["Plantillas"];
  const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const header = data[0];
  const dbEquipos = await prisma.equipo.findMany();
  const dbEquiposMap = new Map();
  dbEquipos.forEach((e) => dbEquiposMap.set(normalize(e.nombre), e));

  // 1. Reasignar predicciones y eliminar duplicados
  console.log("--- 1. Reasignación de predicciones y eliminación de duplicados ---");
  const p1370 = await prisma.prediccionPartido.updateMany({
    where: { jugador_goleador_predicho_id: 1370 },
    data: { jugador_goleador_predicho_id: 956 },
  });
  console.log(`Reasignadas ${p1370.count} predicciones de Leider Berdugo (1370 -> 956).`);

  const g1370 = await prisma.resultadoGoleador.updateMany({
    where: { jugador_id: 1370 },
    data: { jugador_id: 956 },
  });
  console.log(`Reasignados ${g1370.count} goles de Leider Berdugo (1370 -> 956).`);

  try { await prisma.jugador.delete({ where: { id: 1370 } }); } catch (_) {}
  try { await prisma.jugador.delete({ where: { id: 1384 } }); } catch (_) {}
  try { await prisma.jugador.delete({ where: { id: 1385 } }); } catch (_) {}

  // 2. Renombrar / Disambiguar nombres
  console.log("--- 2. Renombrar jugadores para coincidencia exacta ---");
  try {
    await prisma.jugador.update({
      where: { id: 1372 },
      data: { nombre: "Kevin Londoño Flórez" },
    });
  } catch (_) {}

  try {
    await prisma.jugador.update({
      where: { id: 1252 },
      data: { nombre: "Sebastián Viveros del Castillo" },
    });
  } catch (_) {}

  try {
    await prisma.jugador.update({
      where: { id: 1074 },
      data: { equipo_id: 16 },
    });
  } catch (_) {}

  // 3. Insertar jugadores faltantes
  console.log("--- 3. Insertar jugadores faltantes ---");
  const missingPlayers = [
    { equipo_id: 1, nombre: "Brandon Churi" },
    { equipo_id: 1, nombre: "Carlos Cortes" },
    { equipo_id: 3, nombre: "Miguel Correa" },
    { equipo_id: 6, nombre: "Juan Manuel Zapata" },
    { equipo_id: 7, nombre: "Jackson Martínez" },
    { equipo_id: 8, nombre: "Derik Osede" },
    { equipo_id: 9, nombre: "Juan Cuadrado" },
    { equipo_id: 11, nombre: "Bryan Rovira" },
    { equipo_id: 13, nombre: "Emanuel Arboleda" },
    { equipo_id: 13, nombre: "Jefferson Asprilla" },
    { equipo_id: 14, nombre: "Dany Rosero" },
    { equipo_id: 15, nombre: "Hector Arango" },
    { equipo_id: 15, nombre: "Luis Vásquez Díaz" },
    { equipo_id: 16, nombre: "Jhoyler Andrades" },
    { equipo_id: 16, nombre: "Andrés Mosquera Marmolejo" },
    { equipo_id: 18, nombre: "Edwin Cabezas" },
    { equipo_id: 18, nombre: "Mariano Vázquez" },
    { equipo_id: 18, nombre: "Kevin Balanta Carabalí" },
  ];

  for (const item of missingPlayers) {
    const norm = normalize(item.nombre);
    const exist = await prisma.jugador.findFirst({
      where: { equipo_id: item.equipo_id, nombre: { equals: item.nombre, mode: "insensitive" } },
    });
    if (!exist) {
      await prisma.jugador.create({
        data: { nombre: item.nombre, equipo_id: item.equipo_id },
      });
      console.log(`Inserted: ${item.nombre} en equipo ID ${item.equipo_id}`);
    }
  }

  const totalJugadores = await prisma.jugador.count();
  console.log(`\n✅ Sincronización finalizada. Total jugadores en BD: ${totalJugadores}`);
  process.exit(0);
}

main();
