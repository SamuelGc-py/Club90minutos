import { PrismaClient } from "@prisma/client";
import * as xlsx from "xlsx";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function normalize(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log("=== COMPARACIÓN MAESTRO (4) vs BASE DE DATOS ===\n");

  // 1. Leer el Maestro Excel
  const excelPath = "C:\\Users\\Samuel Gc\\Downloads\\Maestro_Liga BetplayII (4).xlsx";
  const wb = xlsx.readFile(excelPath);
  
  console.log("Hojas disponibles:", wb.SheetNames.join(", "));
  
  const sheet = wb.Sheets["Plantillas"];
  if (!sheet) {
    console.log("ERROR: No se encontró la hoja 'Plantillas'. Hojas disponibles:", wb.SheetNames);
    // Intentar con la primera hoja
    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const dataPreview = xlsx.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
    console.log("Primera hoja, headers:", dataPreview[0]);
    console.log("Primeras 3 filas:", dataPreview.slice(1, 4));
    return;
  }
  
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  const headers = data[0];
  
  console.log("Headers del Excel:", headers.filter(Boolean).join(" | "));
  
  // 2. Traer equipos de la BD
  const equiposDB = await prisma.equipo.findMany();
  
  // 3. Mapear cada columna del Excel a un equipo de la BD
  const maestroJugadores: { nombre: string; equipoNombre: string; equipoId: number }[] = [];
  
  for (let col = 0; col < headers.length; col++) {
    const teamNameExcel = headers[col];
    if (!teamNameExcel || typeof teamNameExcel !== "string") continue;
    
    const normExcel = normalize(teamNameExcel);
    
    // Buscar el equipo en la BD por coincidencia
    const equipo = equiposDB.find((e) => {
      const normDB = normalize(e.nombre);
      return normDB === normExcel || 
             normDB.includes(normExcel.replace("f c", "").trim()) ||
             normExcel.includes(normalize(e.nombre).replace("f c", "").trim());
    });
    
    if (!equipo) {
      console.log(`  ⚠️ Columna "${teamNameExcel}" no matchea con ningún equipo de la BD`);
      continue;
    }
    
    // Leer todos los jugadores de esa columna
    for (let row = 1; row < data.length; row++) {
      const playerName = data[row]?.[col];
      if (playerName && typeof playerName === "string" && playerName.trim() !== "") {
        maestroJugadores.push({
          nombre: playerName.trim(),
          equipoNombre: equipo.nombre,
          equipoId: equipo.id,
        });
      }
    }
  }
  
  console.log(`\nTotal jugadores en Maestro Excel: ${maestroJugadores.length}`);
  
  // 4. Traer todos los jugadores de la BD con sus referencias
  const jugadoresDB = await prisma.jugador.findMany({
    include: { equipo: true },
    orderBy: [{ equipo_id: "asc" }, { nombre: "asc" }],
  });
  
  console.log(`Total jugadores en BD: ${jugadoresDB.length}\n`);
  
  // 5. Para cada jugador de la BD, verificar si existe en el Maestro
  const enMaestro: typeof jugadoresDB = [];
  const noEnMaestro: typeof jugadoresDB = [];
  
  for (const jDB of jugadoresDB) {
    // Buscar en el maestro por nombre normalizado + mismo equipo
    const match = maestroJugadores.find(
      (m) => m.equipoId === jDB.equipo_id && normalize(m.nombre) === normalize(jDB.nombre)
    );
    
    if (match) {
      enMaestro.push(jDB);
    } else {
      // Intentar match más flexible (uno contiene al otro)
      const flexMatch = maestroJugadores.find(
        (m) =>
          m.equipoId === jDB.equipo_id &&
          (normalize(m.nombre).includes(normalize(jDB.nombre)) ||
            normalize(jDB.nombre).includes(normalize(m.nombre)))
      );
      if (flexMatch) {
        enMaestro.push(jDB);
      } else {
        noEnMaestro.push(jDB);
      }
    }
  }
  
  console.log(`Jugadores que SÍ están en el Maestro: ${enMaestro.length}`);
  console.log(`Jugadores que NO están en el Maestro: ${noEnMaestro.length}\n`);
  
  // 6. Para los que NO están en el Maestro, verificar si tienen pronósticos
  console.log("=== JUGADORES QUE NO ESTÁN EN EL MAESTRO ===\n");
  
  const sinReferencias: typeof jugadoresDB = [];
  const conReferencias: { jugador: typeof jugadoresDB[0]; predPartido: number; predInicial: number; goles: number }[] = [];
  
  for (const j of noEnMaestro) {
    const predPartido = await prisma.prediccionPartido.count({
      where: { jugador_goleador_predicho_id: j.id },
    });
    const predInicial = await prisma.prediccionInicial.count({
      where: { goleador_torneo_jugador_id: j.id },
    });
    const goles = await prisma.resultadoGoleador.count({
      where: { jugador_id: j.id },
    });
    
    if (predPartido === 0 && predInicial === 0 && goles === 0) {
      sinReferencias.push(j);
    } else {
      conReferencias.push({ jugador: j, predPartido, predInicial, goles });
    }
  }
  
  console.log(`--- SIN referencias (se pueden borrar seguro): ${sinReferencias.length} ---`);
  for (const j of sinReferencias) {
    console.log(`  ID ${j.id}: "${j.nombre}" (${j.equipo.nombre})`);
  }
  
  console.log(`\n--- CON referencias (NO se deben borrar): ${conReferencias.length} ---`);
  for (const { jugador: j, predPartido, predInicial, goles } of conReferencias) {
    console.log(
      `  ID ${j.id}: "${j.nombre}" (${j.equipo.nombre}) — ${predPartido} pred.partido, ${predInicial} pred.inicial, ${goles} goles`
    );
  }
  
  // 7. Verificar jugadores del Maestro que NO están en la BD
  console.log(`\n=== JUGADORES DEL MAESTRO QUE FALTAN EN LA BD ===\n`);
  const faltanEnBD: typeof maestroJugadores = [];
  for (const m of maestroJugadores) {
    const match = jugadoresDB.find(
      (jDB) =>
        jDB.equipo_id === m.equipoId &&
        (normalize(jDB.nombre) === normalize(m.nombre) ||
          normalize(jDB.nombre).includes(normalize(m.nombre)) ||
          normalize(m.nombre).includes(normalize(jDB.nombre)))
    );
    if (!match) {
      faltanEnBD.push(m);
    }
  }
  
  console.log(`Jugadores del Maestro que faltan en BD: ${faltanEnBD.length}`);
  for (const m of faltanEnBD) {
    console.log(`  "${m.nombre}" (${m.equipoNombre}, equipo_id: ${m.equipoId})`);
  }
  
  // 8. Guardar informe como JSON para posterior uso
  const informe = {
    timestamp: new Date().toISOString(),
    totalMaestro: maestroJugadores.length,
    totalBD: jugadoresDB.length,
    coinciden: enMaestro.length,
    noEnMaestro: noEnMaestro.length,
    sinReferencias_borrarSeguro: sinReferencias.map((j) => ({ id: j.id, nombre: j.nombre, equipo: j.equipo.nombre })),
    conReferencias_noBorrar: conReferencias.map((r) => ({
      id: r.jugador.id,
      nombre: r.jugador.nombre,
      equipo: r.jugador.equipo.nombre,
      predPartido: r.predPartido,
      predInicial: r.predInicial,
      goles: r.goles,
    })),
    faltanEnBD: faltanEnBD.map((m) => ({ nombre: m.nombre, equipo: m.equipoNombre, equipoId: m.equipoId })),
  };
  
  const informePath = path.join(__dirname, "..", "backups", "informe-maestro-vs-bd.json");
  fs.mkdirSync(path.dirname(informePath), { recursive: true });
  fs.writeFileSync(informePath, JSON.stringify(informe, null, 2));
  console.log(`\n📋 Informe completo guardado en: ${informePath}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
