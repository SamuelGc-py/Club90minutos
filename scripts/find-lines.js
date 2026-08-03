const fs = require('fs');
const lines = fs.readFileSync('src/app/page.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('jornada') || l.includes('Fecha ') || l.includes('fechaFiltro') || l.includes('partidosFiltrados')) {
    console.log(`${i + 1}: ${l.trim().substring(0, 120)}`);
  }
});
