const fs = require('fs');

const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Initial state to 0
content = content.replace(
  'const [fechaAdmin, setFechaAdmin] = useState<number>(2);',
  'const [fechaAdmin, setFechaAdmin] = useState<number>(0);'
);

// 2. partidosAdminFiltrados filter
content = content.replaceAll(
  `const partidosAdminFiltrados = partidos.filter(\n                  (p) => fechaAdmin === 0 || p.jornada === fechaAdmin\n                );`,
  `const partidosAdminFiltrados = fechaAdmin === 0 ? [] : partidos.filter(\n                  (p) => p.jornada === fechaAdmin\n                );`
);

// Fallback for single line whitespace variants
content = content.replaceAll(
  'partidos.filter((p) => fechaAdmin === 0 || p.jornada === fechaAdmin)',
  'fechaAdmin === 0 ? [] : partidos.filter((p) => p.jornada === fechaAdmin)'
);

// 3. Title update
content = content.replaceAll(
  '🏆 Consolidados de Pronósticos - Fecha {fechaAdmin}',
  '🏆 Consolidados de Pronósticos{fechaAdmin === 0 ? "" : ` - Fecha ${fechaAdmin}`}'
);

// 4. Excel button text & disabled state
content = content.replaceAll(
  '<Download size={18} /> 📥 Descargar Excel Fecha {fechaAdmin}',
  '<Download size={18} /> {fechaAdmin === 0 ? "📥 Selecciona Fecha para Excel" : `📥 Descargar Excel Fecha ${fechaAdmin}`}'
);

// 5. Empty state check
const targetEmpty = `{partidosAdminFiltrados.length === 0 ? (
                      <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--graderia)" }}>
                        No hay partidos registrados para la Fecha {fechaAdmin}.
                      </div>
                    ) : (`;

const newEmpty = `{fechaAdmin === 0 ? (
                      <div className="card" style={{ padding: 32, textAlign: "center", background: "rgba(11, 30, 54, 0.6)", border: "1px dashed #38bdf8", borderRadius: 16 }}>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#38bdf8", marginBottom: 8 }}>
                          👇 Selecciona una Fecha Arriba
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                          Haz clic en <strong>FECHA 1</strong> o <strong>FECHA 2</strong> para desplegar los partidos y pronósticos.
                        </div>
                      </div>
                    ) : partidosAdminFiltrados.length === 0 ? (
                      <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--graderia)" }}>
                        No hay partidos registrados para la Fecha {fechaAdmin}.
                      </div>
                    ) : (`;

content = content.replaceAll(targetEmpty, newEmpty);

fs.writeFileSync(file, content);
console.log("Successfully updated page.tsx so no Fecha is selected by default!");
