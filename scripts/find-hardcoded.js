const fs = require('fs');
const content = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('jornada === 2') || line.includes('[1, 2]') || line.includes('Fecha 2') || line.includes('setFechaParticipante(2)') || line.includes('setFechaAdmin(2)')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
