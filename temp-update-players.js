
const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando lectura del archivo Excel...');
  const wb = xlsx.readFile('C:\\\\Users\\\\Samuel Gc\\\\Downloads\\\\Maestro_Liga BetplayII (2).xlsx');
  const sheet = wb.Sheets['Plantillas'];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  const headers = data[0];
  const equiposDB = await prisma.equipo.findMany();
  const jugadoresDB = await prisma.jugador.findMany();
  
  const nuevosJugadores = [];
  
  // Procesar las primeras 20 columnas (que son los 20 equipos)
  for (let col = 0; col < 20; col++) {
    const teamNameExcel = headers[col];
    if (!teamNameExcel) continue;
    
    // Normalizar nombre para buscar coincidencia (quitar F.C., etc si es necesario, o coincidencia directa)
    const equipoMatches = equiposDB.filter(e => 
      e.nombre.toLowerCase().includes(teamNameExcel.replace(' F.C.', '').toLowerCase()) ||
      teamNameExcel.toLowerCase().includes(e.nombre.toLowerCase())
    );
    
    if (equipoMatches.length === 0) {
      console.log('No se encontro el equipo en DB para la columna:', teamNameExcel);
      continue;
    }
    
    const equipoId = equipoMatches[0].id;
    
    // Leer los jugadores de esta columna
    for (let row = 1; row < data.length; row++) {
      const playerName = data[row][col];
      if (playerName && typeof playerName === 'string' && playerName.trim() !== '') {
        const nombreLimpio = playerName.trim();
        
        // Verificar si ya existe
        const existe = jugadoresDB.some(j => 
          j.equipo_id === equipoId && 
          j.nombre.toLowerCase() === nombreLimpio.toLowerCase()
        );
        
        if (!existe) {
          nuevosJugadores.push({
            nombre: nombreLimpio,
            equipo_id: equipoId,
            posicion: 'ND'
          });
        }
      }
    }
  }
  
  console.log('Se encontraron ' + nuevosJugadores.length + ' jugadores NUEVOS para insertar.');
  if (nuevosJugadores.length > 0) {
    const res = await prisma.jugador.createMany({
      data: nuevosJugadores,
      skipDuplicates: true
    });
    console.log('Insertados ' + res.count + ' jugadores con exito!');
  }
}

main().catch(console.error).finally(() => prisma.());
