const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const EQUIPOS_MAP = {
  "Alianza Valledupar F.C.": "Alianza FC",
  "América de Cali": "América de Cali",
  "Atlético Bucaramanga": "Atlético Bucaramanga",
  "Atlético Nacional": "Atlético Nacional",
  "Boyacá Chicó F.C.": "Boyacá Chicó",
  "Cúcuta Deportivo": "Cúcuta Deportivo",
  "Deportes Tolima": "Deportes Tolima",
  "Deportivo Cali": "Deportivo Cali",
  "Deportivo Pasto": "Deportivo Pasto",
  "Deportivo Pereira": "Deportivo Pereira",
  "Fortaleza": "Fortaleza CEIF",
  "Independiente Medellín": "Independiente Medellín",
  "Independiente Santa Fe": "Independiente Santa Fe",
  "Internacional de Bogotá": "Internacional de Bogotá",
  "Jaguares F.C.": "Jaguares de Córdoba",
  "Junior F.C.": "Junior de Barranquilla",
  "Llaneros F.C.": "Llaneros FC",
  "Millonarios F.C.": "Millonarios FC",
  "Once Caldas DAF": "Once Caldas",
  "Águilas Doradas": "Águilas Doradas"
};

async function main() {
  console.log("Iniciando carga de jugadores...");

  const htmlPath = path.join(__dirname, '..', 'temp_plantillas', 'Maestro_Liga BetplayII.xlsx', 'Plantillas.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  const $ = cheerio.load(htmlContent);
  
  // Get teams from header (first row in tbody)
  const headers = [];
  const columnToTeam = {};
  
  const firstRow = $('tbody tr').first();
  firstRow.find('td').each((i, el) => {
    const text = $(el).text().trim();
    if (text) {
        if (EQUIPOS_MAP[text]) {
            columnToTeam[i] = EQUIPOS_MAP[text];
        }
    }
  });
  
  // Fetch teams from DB to get their IDs
  const dbEquipos = await prisma.equipo.findMany();
  const equipoNombreToId = {};
  dbEquipos.forEach(eq => {
      equipoNombreToId[eq.nombre] = eq.id;
  });

  // Extract players
  const teamPlayers = {};
  for (const colIndex in columnToTeam) {
      teamPlayers[columnToTeam[colIndex]] = [];
  }

  $('tbody tr').each((rowIndex, row) => {
      if (rowIndex === 0) return; // skip header
      $(row).find('td').each((colIndex, td) => {
          const playerName = $(td).text().trim();
          if (playerName && columnToTeam[colIndex]) {
              teamPlayers[columnToTeam[colIndex]].push(playerName);
          }
      });
  });

  // Save to DB
  let count = 0;
  for (const [teamName, players] of Object.entries(teamPlayers)) {
      const equipoId = equipoNombreToId[teamName];
      if (!equipoId) {
          console.error(`Equipo no encontrado en la DB: ${teamName}`);
          continue;
      }
      
      console.log(`Cargando ${players.length} jugadores para ${teamName}...`);
      
      // Delete existing players for this team to avoid duplicates if re-run (optional, but safe)
      await prisma.jugador.deleteMany({
          where: { equipo_id: equipoId }
      });

      for (const playerName of players) {
          await prisma.jugador.create({
              data: {
                  nombre: playerName,
                  equipo_id: equipoId
              }
          });
          count++;
      }
  }

  console.log(`¡Completado! Se han cargado ${count} jugadores en la base de datos.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
