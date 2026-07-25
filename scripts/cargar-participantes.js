const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando carga de participantes...");

  // Ensure role "participante" exists
  const rolParticipante = await prisma.rol.upsert({
    where: { nombre: 'participante' },
    update: {},
    create: { id: 1, nombre: 'participante' }
  });

  const htmlPath = path.join(__dirname, '..', 'temp_jugadores', 'Maestro_Liga BetplayII.xlsx', 'Jugadores.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  const $ = cheerio.load(htmlContent);
  
  const participants = [];

  $('tbody tr').each((rowIndex, row) => {
      if (rowIndex === 0) return; // skip header
      const cols = $(row).find('td');
      
      const correo = $(cols[1]).text().trim();
      const nombre_completo = $(cols[2]).text().trim();
      const telefono = $(cols[3]).text().trim();

      if (correo && correo.includes('@')) {
          participants.push({ correo, nombre_completo, telefono });
      }
  });

  let count = 0;
  for (const p of participants) {
      await prisma.usuario.upsert({
          where: { correo: p.correo },
          update: {
              nombre_completo: p.nombre_completo,
              telefono: p.telefono,
              rol_id: rolParticipante.id
          },
          create: {
              correo: p.correo,
              nombre_completo: p.nombre_completo,
              telefono: p.telefono,
              rol_id: rolParticipante.id,
              activo: true
          }
      });
      count++;
  }

  console.log(`¡Completado! Se han cargado/actualizado ${count} participantes en la base de datos.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
