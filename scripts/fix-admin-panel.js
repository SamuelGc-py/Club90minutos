const fs = require('fs');

const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// 1. Find VISTA EXCLUSIVA "Gestión por Partido" block
const gestionStart = lines.findIndex(l => l.includes('{/* LISTA DE PARTIDOS PARA DESCARGAR O VER PARTICIPANTES */}'));
let gestionEnd = -1;

for (let i = gestionStart; i < lines.length; i++) {
  if (lines[i].includes('/* ================= VISTA NORMAL DE PARTICIPANTE ================= */')) {
    gestionEnd = i - 3; // The line with `          )}` before `        </div>`
    break;
  }
}

console.log('Gestión por partido VISTA EXCLUSIVA:', gestionStart, 'to', gestionEnd);

// 2. Extract awesome code from the bottom
const awesomeStart = lines.findIndex(l => l.includes('{/* SECCIÓN CONTROL Y CONSOLIDADOS FUTBOLEROS POR FECHAS (ADMIN) */}'));
// awesomeEnd is the line with `              })()}` right before the end of the file.
let awesomeEnd = -1;
for (let i = lines.length - 1; i > awesomeStart; i--) {
  if (lines[i].includes('})()}')) {
    awesomeEnd = i;
    break;
  }
}
console.log('Awesome code:', awesomeStart, 'to', awesomeEnd);

const awesomeCode = lines.slice(awesomeStart, awesomeEnd + 1);

// Add the wrapper WITH FRAGMENT <></>
awesomeCode.unshift('          {usuario.rol_id === 2 && partidos.length > 0 && consolidados && (');
awesomeCode.unshift('            <>');
// swap the order
let temp = awesomeCode[0];
awesomeCode[0] = awesomeCode[1];
awesomeCode[1] = temp;

awesomeCode.push('            </>');
awesomeCode.push('          )}');

// Replace
lines.splice(gestionStart, gestionEnd - gestionStart + 1, ...awesomeCode);

fs.writeFileSync(file, lines.join('\n'));
console.log('Success!');
