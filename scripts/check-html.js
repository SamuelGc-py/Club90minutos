const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const tempDir = path.join(__dirname, '..', 'temp_jugadores', 'Maestro_Liga BetplayII.xlsx');
const files = fs.readdirSync(tempDir);

['Pron', 'Posiciones'].forEach(pattern => {
  const matching = files.filter(f => f.includes(pattern));
  for(const targetFile of matching) {
    const htmlPath = path.join(tempDir, targetFile);
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const $ = cheerio.load(htmlContent);

    console.log(`\n\n=== Archivo: ${targetFile} ===`);
    let printed = 0;
    $('tr').each((i, row) => {
      const cols = $(row).find('td').map((j, col) => $(col).text().trim()).get();
      if (cols.length > 1 && cols[1] !== "") {
        console.log(`Fila ${i}:`, cols.join(" | "));
        printed++;
      }
    });
    console.log(`Total impresas en ${targetFile}: ${printed}`);
  }
});
