const fs = require('fs');

const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Target the div for SECCIÓN CARGAR MARCADOR OFICIAL
const target = `{/* SECCIÓN CARGAR MARCADOR OFICIAL (ADMIN) */}
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>`;

const replacement = `{/* SECCIÓN CARGAR MARCADOR OFICIAL (ADMIN) - SOLO PARA JORNADAS ACTIVAS/DESPUÉS DE FECHA 1 */}
                      {partido.jornada !== 1 && (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>`;

// We also need to add `)}` at the end of that div!
const targetEnd = `⚽ Publicar Resultado & Liquidar Puntos
                        </button>
                      </div>`;

const replacementEnd = `⚽ Publicar Resultado & Liquidar Puntos
                        </button>
                      </div>
                      )}`;

// Replace all occurrences
content = content.replaceAll(target, replacement);
content = content.replaceAll(targetEnd, replacementEnd);

fs.writeFileSync(file, content);
console.log("Successfully updated page.tsx to hide result form for Fecha 1 matches!");
