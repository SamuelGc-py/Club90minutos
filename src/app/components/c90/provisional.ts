// Puntos provisionales "si termina así" durante un partido en vivo.
// Mismas reglas que src/lib/calculadorPuntos.ts:
//   ganador o empate +3 · marcador exacto +5 (se suman: exacto = 8) ·
//   goleador +2 (o +2 por 0-0 pronosticado sin goleador si el partido va 0-0).
// Es solo una referencia: los puntos reales se liquidan al final con el resultado oficial.

export interface Provisional {
  total: number;
  ganador: number;
  exacto: number;
  goleador: number;
}

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Mismo jugador: nombre igual, o igual nombre + último apellido, o mismo último apellido. */
export function mismoJugador(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const tx = x.split(" ");
  const ty = y.split(" ");
  const apX = tx[tx.length - 1];
  const apY = ty[ty.length - 1];
  return apX.length > 2 && apX === apY && (tx[0] === ty[0] || tx.length === 1 || ty.length === 1);
}

export function puntosProvisionales(
  pred: { local: number; visitante: number; goleadorNombre?: string | null },
  vivo: { local: number; visitante: number; goleadores?: { nombre: string }[] }
): Provisional {
  const g = (a: number, b: number) => (a > b ? "L" : b > a ? "V" : "E");
  const ganador = g(pred.local, pred.visitante) === g(vivo.local, vivo.visitante) ? 3 : 0;
  const exacto = pred.local === vivo.local && pred.visitante === vivo.visitante ? 5 : 0;
  let goleador = 0;
  if (pred.goleadorNombre) {
    if ((vivo.goleadores ?? []).some((x) => mismoJugador(x.nombre, pred.goleadorNombre!))) goleador = 2;
  } else if (pred.local === 0 && pred.visitante === 0 && vivo.local === 0 && vivo.visitante === 0) {
    goleador = 2;
  }
  return { total: ganador + exacto + goleador, ganador, exacto, goleador };
}

export function textoProvisional(p: Provisional): string {
  const partes = [p.exacto && "exacto", p.ganador && "ganador", p.goleador && "goleador"].filter(Boolean);
  return p.total > 0 ? `Si termina así sumas ${p.total} (${partes.join(" + ")})` : "Si termina así no sumas";
}
