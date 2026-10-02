// Casos de prueba de los puntos provisionales en vivo (mismas reglas que calculadorPuntos).
import { puntosProvisionales as p } from "../src/app/components/c90/provisional";
const casos: [string, Parameters<typeof p>[0], Parameters<typeof p>[1], number][] = [
  ["exacto + ganador = 8", { local: 2, visitante: 1 }, { local: 2, visitante: 1 }, 8],
  ["exacto + ganador + goleador = 10", { local: 2, visitante: 1, goleadorNombre: "Dayro Moreno" }, { local: 2, visitante: 1, goleadores: [{ nombre: "Dayro Moreno" }] }, 10],
  ["solo ganador = 3", { local: 2, visitante: 0 }, { local: 1, visitante: 0 }, 3],
  ["empate distinto = 3", { local: 1, visitante: 1 }, { local: 0, visitante: 0 }, 3],
  ["0-0 sin goleador = 10", { local: 0, visitante: 0 }, { local: 0, visitante: 0 }, 10],
  ["nada = 0", { local: 2, visitante: 0 }, { local: 0, visitante: 1 }, 0],
  ["goleador por apellido (ESPN nombre completo) = 2", { local: 0, visitante: 2, goleadorNombre: "Johan Martinez" }, { local: 1, visitante: 0, goleadores: [{ nombre: "Johan Andrés Martínez" }] }, 2],
  ["otro jugador mismo apellido distinto nombre = 0", { local: 0, visitante: 2, goleadorNombre: "Carlos Martinez" }, { local: 1, visitante: 0, goleadores: [{ nombre: "Johan Martinez" }] }, 0],
];
let fallas = 0;
for (const [n, a, b, esperado] of casos) {
  const r = p(a, b).total;
  const ok = r === esperado;
  if (!ok) fallas++;
  console.log(`${ok ? "OK " : "FALLA"} ${n} → ${r}`);
}
process.exit(fallas ? 1 : 0);
