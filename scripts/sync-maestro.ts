import { PrismaClient } from "@prisma/client";
import * as xlsx from "xlsx";

const prisma = new PrismaClient();

function normalizeName(name: string): string {
  if (!name) return "";
  return name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}

async function main() {
  console.log("Iniciando sincronización con el archivo Maestro...");
  
  const excelPath = "C:\\Users\\Samuel Gc\\Downloads\\Maestro_Liga BetplayII (2).xlsx";
  const wb = xlsx.readFile(excelPath);
  const sheet = wb.Sheets["Plantillas"];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  const headers = data[0];
  const equiposDB = await prisma.equipo.findMany();
  
  // Mapa de maestro: nombreNormalizado -> equipoIdReal
  const maestroJugadores: { [key: string]: number } = {};
  
  for (let col = 0; col < 20; col++) {
    const teamNameExcel = headers[col];
    if (!teamNameExcel) continue;
    
    const equipoMatches = equiposDB.filter(e => 
      e.nombre.toLowerCase().includes(teamNameExcel.replace(" F.C.", "").toLowerCase()) ||
      teamNameExcel.toLowerCase().includes(e.nombre.toLowerCase())
    );
    
    if (equipoMatches.length === 0) continue;
    const equipoId = equipoMatches[0].id;
    
    for (let row = 1; row < data.length; row++) {
      const playerName = data[row][col];
      if (playerName && typeof playerName === "string" && playerName.trim() !== "") {
        const normName = normalizeName(playerName);
        maestroJugadores[normName] = equipoId;
      }
    }
  }

  const jugadoresDB = await prisma.jugador.findMany();
  let actualizados = 0;
  let eliminados = 0;

  for (const jDB of jugadoresDB) {
    const normName = normalizeName(jDB.nombre);
    
    // Si el jugador del maestro existe, comparamos el equipo
    if (maestroJugadores[normName]) {
      const equipoMaestroId = maestroJugadores[normName];
      
      if (jDB.equipo_id !== equipoMaestroId) {
        console.log(`Discrepancia encontrada: ${jDB.nombre} (ID: ${jDB.id}). Está en equipo ${jDB.equipo_id}, Maestro dice ${equipoMaestroId}`);
        
        // Verificamos si ya existe OTRO registro de este jugador en el equipo correcto
        const jugadorCorrecto = jugadoresDB.find(
          j => normalizeName(j.nombre) === normName && j.equipo_id === equipoMaestroId && j.id !== jDB.id
        );

        if (jugadorCorrecto) {
          console.log(` -> El jugador ya existe en el equipo correcto (ID: ${jugadorCorrecto.id}). Moviendo referencias y eliminando el incorrecto...`);
          
          // Mover referencias
          await prisma.prediccionPartido.updateMany({
            where: { jugador_goleador_predicho_id: jDB.id },
            data: { jugador_goleador_predicho_id: jugadorCorrecto.id }
          });
          
          await prisma.prediccionInicial.updateMany({
            where: { goleador_torneo_jugador_id: jDB.id },
            data: { goleador_torneo_jugador_id: jugadorCorrecto.id }
          });
          
          await prisma.resultadoGoleador.updateMany({
            where: { jugador_id: jDB.id },
            data: { jugador_id: jugadorCorrecto.id }
          });

          // Eliminar el incorrecto
          await prisma.jugador.delete({ where: { id: jDB.id } });
          eliminados++;
          console.log(` -> Eliminado el registro incorrecto (ID: ${jDB.id})`);
        } else {
          console.log(` -> El jugador NO existe en el equipo correcto. Actualizando su equipo a ${equipoMaestroId}...`);
          // Solo actualizamos su equipo_id
          await prisma.jugador.update({
            where: { id: jDB.id },
            data: { equipo_id: equipoMaestroId }
          });
          actualizados++;
          console.log(` -> Equipo actualizado exitosamente.`);
        }
      }
    }
  }

  console.log(`\nSincronización terminada.`);
  console.log(`Jugadores actualizados (cambio de equipo): ${actualizados}`);
  console.log(`Jugadores duplicados eliminados (con datos migrados): ${eliminados}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
