// Cálculos de estadísticas individuales (solo lectura, a partir de datos existentes).
//   - /api/historial-puntos: partidos finalizados con lo pronosticado y los puntos obtenidos.
//   - /api/consolidados.prediccionesPartidos: todos los pronósticos (para el perfil y el promedio del grupo).

export interface PartidoHistorial {
  partido_id: number;
  jornada: number;
  fecha: string;
  equipo_local: string;
  equipo_visitante: string;
  escudo_local?: string | null;
  escudo_visitante?: string | null;
  marcador_real: string;
  pronosticado: boolean;
  marcador_predicho: string | null;
  puntos_resultado_exacto: number;
  puntos_ganador_partido: number;
  puntos_goleador: number;
  puntos_total: number;
}

export interface Resumen {
  pronosticados: number;
  conPuntos: number;
  efectividad: number; // % de partidos pronosticados con algún punto
  aciertosGanador: number;
  exactos: number;
  goleadores: number;
  puntos: number;
  promedio: number;
}

export function resumen(partidos: PartidoHistorial[]): Resumen {
  const p = partidos.filter((x) => x.pronosticado);
  const conPuntos = p.filter((x) => x.puntos_total > 0).length;
  const puntos = p.reduce((a, x) => a + x.puntos_total, 0);
  return {
    pronosticados: p.length,
    conPuntos,
    efectividad: p.length ? Math.round((conPuntos / p.length) * 100) : 0,
    aciertosGanador: p.filter((x) => x.puntos_ganador_partido > 0).length,
    exactos: p.filter((x) => x.puntos_resultado_exacto > 0).length,
    goleadores: p.filter((x) => x.puntos_goleador > 0).length,
    puntos,
    promedio: p.length ? Math.round((puntos / p.length) * 10) / 10 : 0,
  };
}

export interface Rachas {
  actual: number;
  mejor: number;
  /** Últimos partidos pronosticados, del más viejo al más reciente: puntos de cada uno. */
  ultimos: { partido: string; puntos: number }[];
}

/** Racha = partidos pronosticados seguidos sumando puntos (en orden cronológico). */
export function rachas(partidos: PartidoHistorial[], cuantos = 10): Rachas {
  const p = partidos
    .filter((x) => x.pronosticado)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  let mejor = 0;
  let corriendo = 0;
  for (const x of p) {
    corriendo = x.puntos_total > 0 ? corriendo + 1 : 0;
    mejor = Math.max(mejor, corriendo);
  }
  return {
    actual: corriendo,
    mejor,
    ultimos: p.slice(-cuantos).map((x) => ({ partido: `${x.equipo_local} vs ${x.equipo_visitante}`, puntos: x.puntos_total })),
  };
}

export interface EfectividadEquipo {
  equipo: string;
  escudo?: string | null;
  partidos: number;
  aciertos: number; // acertó ganador o empate
  porcentaje: number;
  puntos: number;
}

/** Por equipo: en los partidos de ese equipo que pronosticaste, cuántas veces acertaste el resultado. */
export function efectividadPorEquipo(partidos: PartidoHistorial[]): EfectividadEquipo[] {
  const m = new Map<string, EfectividadEquipo>();
  for (const x of partidos) {
    if (!x.pronosticado) continue;
    for (const [equipo, escudo] of [
      [x.equipo_local, x.escudo_local],
      [x.equipo_visitante, x.escudo_visitante],
    ] as const) {
      const e = m.get(equipo) ?? { equipo, escudo, partidos: 0, aciertos: 0, porcentaje: 0, puntos: 0 };
      e.partidos++;
      if (x.puntos_ganador_partido > 0) e.aciertos++;
      e.puntos += x.puntos_total;
      m.set(equipo, e);
    }
  }
  return [...m.values()]
    .map((e) => ({ ...e, porcentaje: Math.round((e.aciertos / e.partidos) * 100) }))
    .sort((a, b) => b.porcentaje - a.porcentaje || b.partidos - a.partidos || a.equipo.localeCompare(b.equipo));
}

export interface Perfil {
  muestra: number;
  golesPorPartido: number;
  pctEmpates: number;
  pctLocal: number;
  pctVisitante: number;
}

export function perfil(preds: { goles_local_predicho: number; goles_visitante_predicho: number }[]): Perfil {
  const n = preds.length;
  if (!n) return { muestra: 0, golesPorPartido: 0, pctEmpates: 0, pctLocal: 0, pctVisitante: 0 };
  const goles = preds.reduce((a, p) => a + p.goles_local_predicho + p.goles_visitante_predicho, 0);
  const emp = preds.filter((p) => p.goles_local_predicho === p.goles_visitante_predicho).length;
  const loc = preds.filter((p) => p.goles_local_predicho > p.goles_visitante_predicho).length;
  return {
    muestra: n,
    golesPorPartido: Math.round((goles / n) * 10) / 10,
    pctEmpates: Math.round((emp / n) * 100),
    pctLocal: Math.round((loc / n) * 100),
    pctVisitante: Math.round(((n - emp - loc) / n) * 100),
  };
}

export interface TipoPronosticador {
  nombre: string;
  descripcion: string;
}

/** Clasificación según el estilo de pronóstico, comparado con el promedio del grupo. */
export function tipoPronosticador(yo: Perfil, grupo: Perfil, efectividad: number): TipoPronosticador {
  if (yo.muestra < 5) return { nombre: "En calentamiento", descripcion: "Todavía hay pocos pronósticos para definir tu estilo. Vuelve después de unas fechas." };
  if (yo.pctEmpates >= Math.max(35, grupo.pctEmpates + 10))
    return { nombre: "El Empatador", descripcion: `Pronosticas empate en el ${yo.pctEmpates} % de los partidos; el grupo, en el ${grupo.pctEmpates} %.` };
  if (yo.golesPorPartido >= Math.max(3, grupo.golesPorPartido + 0.6))
    return { nombre: "El Goleador", descripcion: `Esperas ${yo.golesPorPartido} goles por partido; el grupo espera ${grupo.golesPorPartido}. Te gustan los partidos abiertos.` };
  if (yo.golesPorPartido <= Math.min(2, grupo.golesPorPartido - 0.5))
    return { nombre: "El Cerrojo", descripcion: `Pronosticas partidos cerrados: ${yo.golesPorPartido} goles por partido, frente a ${grupo.golesPorPartido} del grupo.` };
  if (yo.pctVisitante >= Math.max(40, grupo.pctVisitante + 10))
    return { nombre: "El Arriesgado", descripcion: `Le das la victoria al visitante en el ${yo.pctVisitante} % de los partidos; el grupo, en el ${grupo.pctVisitante} %.` };
  if (yo.pctLocal >= Math.max(60, grupo.pctLocal + 10))
    return { nombre: "El Localista", descripcion: `Confías en el que juega en casa: ${yo.pctLocal} % de tus pronósticos son victoria local (grupo: ${grupo.pctLocal} %).` };
  if (efectividad >= 60) return { nombre: "El Analista", descripcion: `Estilo equilibrado y efectivo: sumas puntos en el ${efectividad} % de tus pronósticos.` };
  return { nombre: "El Equilibrado", descripcion: "Tus pronósticos se parecen al promedio del grupo: ni muy arriesgados ni muy conservadores." };
}
