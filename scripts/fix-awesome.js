const fs = require('fs');

let awesome = fs.readFileSync('awesome_admin_code.txt', 'utf8').split('\n');
// Remove the last 2 lines: `            </div>` and `          )}` which belong to the parent container
// Actually let's look at the end of awesome_admin_code.txt:
//               })()}
//             </div>
//           )}
// So we pop the last 2 lines!
if (awesome[awesome.length - 1].trim() === '') awesome.pop(); // remove empty line
if (awesome[awesome.length - 1].includes(')}')) awesome.pop();
if (awesome[awesome.length - 1].includes('</div>')) awesome.pop();

// Now add the wrapper
awesome.unshift('{usuario.rol_id === 2 && partidos.length > 0 && consolidados && (');
awesome.unshift('          {/* SECCIÓN CONTROL Y CONSOLIDADOS FUTBOLEROS POR FECHAS (ADMIN) */}');
awesome.push('          )}');

fs.writeFileSync('awesome_admin_code.txt', awesome.join('\n'));
console.log('Fixed awesome code!');
