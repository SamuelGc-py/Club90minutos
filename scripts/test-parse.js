const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'temp_jugadores', 'Maestro_Liga BetplayII.xlsx', 'Partidos.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

$('table.waffle tbody tr').slice(2, 5).each((i, row) => {
  console.log(`--- ROW ${i+2} ---`);
  $(row).find('td').each((j, cell) => {
    console.log(`Cell ${j}: "${$(cell).text().trim()}"`);
  });
});
