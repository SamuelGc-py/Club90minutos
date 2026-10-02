// Cálculos de PRESENTACIÓN del ranking (movimiento y filtro por fecha).
// No cambian puntos: solo reagrupan los puntajes que ya entrega /api/consolidados,
// con los mismos criterios de desempate del servidor (consolidados/route.ts).

export interface FilaRanking {
  usuario_id: number;
  nombre_completo: string;
  pts_campeon: number;
  pts_finalistas: number;
  pts_clasificados: number;
  pts_goleador_torneo: number;
  pts_resultado_exacto: number;
  pts_ganador_partido: number;
  pts_goleador_partido: number;
  pts_total: number;
}

export interface FilaConMovimiento extends FilaRanking {
  posicion: number;
  /** Puestos ganados (+) o perdidos (−) frente a la fecha anterior. null = sin dato. */
  movimiento: number | null;
  distanciaLider: number;
}

interface PuntajeLite {
  usuario_id: number;
  categoria: string;
  partido_id: number | null;
  puntos_obtenidos: number;
}

interface PartidoLite {
  id: number;
  jornada: number;
  jornada_original?: number | null;
}

const vacia = (u: { usuario_id: number; nombre_completo: string }): FilaRanking => ({
  usuario_id: u.usuario_id,
  nombre_completo: u.nombre_completo,
  pts_campeon: 0,
  pts_finalistas: 0,
  pts_clasificados: 0,
  pts_goleador_torneo: 0,
  pts_resultado_exacto: 0,
  pts_ganador_partido: 0,
  pts_goleador_partido: 0,
  pts_total: 0,
});

function sumar(fila: FilaRanking, p: PuntajeLite) {
  if (p.categoria === "campeon") fila.pts_campeon += p.puntos_obtenidos;
  else if (p.categoria === "finalistas") fila.pts_finalistas += p.puntos_obtenidos;
  else if (p.categoria === "clasificados_cuadrangulares") fila.pts_clasificados += p.puntos_obtenidos;
  else if (p.categoria === "resultado_exacto") fila.pts_resultado_exacto += p.puntos_obtenidos;
  else if (p.categoria === "ganador_partido") fila.pts_ganador_partido += p.puntos_obtenidos;
  else if (p.categoria === "goleador") fila.pts_goleador_partido += p.puntos_obtenidos;
  fila.pts_total += p.puntos_obtenidos;
}

/** Mismo orden que el servidor: total, exactos, goleadores, ganadores, nombre. */
export function ordenar<T extends FilaRanking>(filas: T[]): T[] {
  return [...filas].sort((a, b) => {
    if (b.pts_total !== a.pts_total) return b.pts_total - a.pts_total;
    if (b.pts_resultado_exacto !== a.pts_resultado_exacto) return b.pts_resultado_exacto - a.pts_resultado_exacto;
    if (b.pts_goleador_partido !== a.pts_goleador_partido) return b.pts_goleador_partido - a.pts_goleador_partido;
    if (b.pts_ganador_partido !== a.pts_ganador_partido) return b.pts_ganador_partido - a.pts_ganador_partido;
    return a.nombre_completo.localeCompare(b.nombre_completo);
  });
}

function jornadaDe(partidos: PartidoLite[]) {
  const m = new Map<number, number>();
  for (const p of partidos) m.set(p.id, p.jornada_original || p.jornada);
  return m;
}

/** Fechas (jornadas) que ya tienen puntos liquidados, en orden. */
export function fechasConPuntos(puntajes: PuntajeLite[], partidos: PartidoLite[]): number[] {
  const j = jornadaDe(partidos);
  const set = new Set<number>();
  for (const p of puntajes) {
    if (p.partido_id == null) continue;
    const n = j.get(p.partido_id);
    if (n != null) set.add(n);
  }
  return Array.from(set).sort((a, b) => a - b);
}

function construir(
  base: { usuario_id: number; nombre_completo: string }[],
  puntajes: PuntajeLite[],
  incluir: (p: PuntajeLite) => boolean
): FilaRanking[] {
  const mapa = new Map<number, FilaRanking>();
  for (const u of base) mapa.set(u.usuario_id, vacia(u));
  for (const p of puntajes) {
    const f = mapa.get(p.usuario_id);
    if (f && incluir(p)) sumar(f, p);
  }
  return Array.from(mapa.values());
}

/** Tabla general a partir de los puntajes (mismo reparto por categoría que /api/consolidados). */
export function tablaDesdePuntajes(usuarios: { usuario_id: number; nombre_completo: string }[], puntajes: PuntajeLite[]): FilaRanking[] {
  return construir(usuarios, puntajes, () => true);
}

/**
 * Ranking general con movimiento frente al ranking que había antes de la última fecha con puntos.
 * Usa la tabla del servidor como fuente de los totales (no se recalculan).
 */
export function rankingGeneral(tabla: FilaRanking[], puntajes: PuntajeLite[], partidos: PartidoLite[]): FilaConMovimiento[] {
  const ordenada = ordenar(tabla);
  const lider = ordenada[0]?.pts_total ?? 0;
  const fechas = fechasConPuntos(puntajes, partidos);
  const ultima = fechas[fechas.length - 1];
  let previa: Map<number, number> | null = null;

  if (ultima != null && fechas.length > 1) {
    const j = jornadaDe(partidos);
    const antes = ordenar(construir(tabla, puntajes, (p) => p.partido_id == null || j.get(p.partido_id) !== ultima));
    previa = new Map(antes.map((f, i) => [f.usuario_id, i + 1]));
  }

  return ordenada.map((f, i) => ({
    ...f,
    posicion: i + 1,
    movimiento: previa ? (previa.get(f.usuario_id) ?? i + 1) - (i + 1) : null,
    distanciaLider: lider - f.pts_total,
  }));
}

/** Ranking solo con los puntos de una fecha. */
export function rankingDeFecha(tabla: FilaRanking[], puntajes: PuntajeLite[], partidos: PartidoLite[], fecha: number): FilaConMovimiento[] {
  const j = jornadaDe(partidos);
  const filas = ordenar(construir(tabla, puntajes, (p) => p.partido_id != null && j.get(p.partido_id) === fecha));
  const lider = filas[0]?.pts_total ?? 0;
  return filas.map((f, i) => ({ ...f, posicion: i + 1, movimiento: null, distanciaLider: lider - f.pts_total }));
}

const LIQUIDADO = new Set(["resultado_cargado", "puntaje_calculado"]);

export interface GanadorFecha {
  fecha: number;
  nombres: string[];
  usuarioIds: number[];
  pts: number;
  /** true si todos los partidos de la fecha (sin contar aplazados) ya están liquidados. */
  cerrada: boolean;
}

/** Quién sumó más en una fecha (con empates). null si nadie sumó. */
export function ganadorDeFecha(
  tabla: FilaRanking[],
  puntajes: PuntajeLite[],
  partidos: (PartidoLite & { estado?: string })[],
  fecha: number
): GanadorFecha | null {
  const filas = rankingDeFecha(tabla, puntajes, partidos, fecha);
  const max = filas[0]?.pts_total ?? 0;
  if (max <= 0) return null;
  const top = filas.filter((f) => f.pts_total === max);
  const deLaFecha = partidos.filter((p) => (p.jornada_original || p.jornada) === fecha && p.estado !== "aplazado");
  return {
    fecha,
    nombres: top.map((f) => f.nombre_completo),
    usuarioIds: top.map((f) => f.usuario_id),
    pts: max,
    cerrada: deLaFecha.length > 0 && deLaFecha.every((p) => LIQUIDADO.has(p.estado || "")),
  };
}

/** Ganador de la fecha cerrada más reciente (todos sus partidos liquidados). */
export function ganadorUltimaFechaCerrada(
  tabla: FilaRanking[],
  puntajes: PuntajeLite[],
  partidos: (PartidoLite & { estado?: string })[]
): GanadorFecha | null {
  const fechas = fechasConPuntos(puntajes, partidos).reverse();
  for (const f of fechas) {
    const g = ganadorDeFecha(tabla, puntajes, partidos, f);
    if (g?.cerrada) return g;
  }
  return null;
}
