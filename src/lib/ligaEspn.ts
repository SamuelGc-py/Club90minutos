/**
 * Datos de la Liga BetPlay desde la API pública de ESPN (sin clave):
 *   - Tabla de posiciones:  /apis/v2/sports/soccer/col.1/standings
 *   - Partidos por equipo:  /apis/site/v2/sports/soccer/col.1/teams/{id}/schedule?season=&seasontype=
 *
 * La tabla no trae la racha de "últimos 5", así que se calcula con el calendario de
 * cada equipo del MISMO torneo (season + seasonType que informa la propia tabla).
 * Se cachea en memoria para no consultar a ESPN en cada visita (son ~21 peticiones).
 */

const BASE = "https://site.api.espn.com/apis";
const CACHE_MS = 20 * 60 * 1000;

export type ResultadoForma = "G" | "E" | "P";

export interface FormaPartido {
  resultado: ResultadoForma;
  rival: string;
  marcador: string; // goles propios - goles rival
  local: boolean;
  fecha: string;
}

export interface EquipoTabla {
  posicion: number;
  espn_id: string;
  nombre: string;
  abreviatura: string;
  logo: string | null;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  forma: FormaPartido[]; // más reciente al final
}

export interface TablaLiga {
  torneo: string;
  actualizado: string;
  equipos: EquipoTabla[];
}

let cache: { datos: TablaLiga; ts: number } | null = null;
let enCurso: Promise<TablaLiga> | null = null;

async function getJson(url: string, ms = 10000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`ESPN ${res.status} en ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

const num = (stats: any[], nombre: string) => {
  const s = stats.find((x) => x.name === nombre);
  return s ? Number(s.value ?? s.displayValue ?? 0) : 0;
};

const marcador = (c: any) => {
  const v = c?.score;
  return Number(typeof v === "object" && v !== null ? v.value ?? v.displayValue : v) || 0;
};

async function formaDeEquipo(teamId: string, season: number, seasonType: number): Promise<FormaPartido[]> {
  try {
    const d = await getJson(
      `${BASE}/site/v2/sports/soccer/col.1/teams/${teamId}/schedule?season=${season}&seasontype=${seasonType}`
    );
    const jugados = (d.events ?? [])
      .filter((e: any) => e.competitions?.[0]?.status?.type?.completed)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return jugados.slice(-5).map((e: any): FormaPartido => {
      const cs = e.competitions[0].competitors;
      const yo = cs.find((c: any) => c.team?.id === teamId) ?? cs[0];
      const rival = cs.find((c: any) => c !== yo) ?? cs[1];
      const gf = marcador(yo);
      const gc = marcador(rival);
      return {
        resultado: gf > gc ? "G" : gf < gc ? "P" : "E",
        rival: rival?.team?.displayName ?? "",
        marcador: `${gf}-${gc}`,
        local: yo?.homeAway === "home",
        fecha: e.date,
      };
    });
  } catch {
    return []; // si falla un equipo, la tabla se muestra igual sin su racha
  }
}

async function construir(): Promise<TablaLiga> {
  const d = await getJson(`${BASE}/v2/sports/soccer/col.1/standings`);
  const grupo = d.children?.[0];
  const st = grupo?.standings;
  if (!st?.entries?.length) throw new Error("ESPN no devolvió la tabla de posiciones");

  const season = Number(st.season) || new Date().getFullYear();
  const seasonType = Number(st.seasonType) || 5;

  const base = st.entries.map((en: any) => {
    const s = en.stats ?? [];
    return {
      posicion: num(s, "rank"),
      espn_id: String(en.team.id),
      nombre: en.team.displayName,
      abreviatura: en.team.abbreviation,
      logo: en.team.logos?.[0]?.href ?? null,
      pj: num(s, "gamesPlayed"),
      g: num(s, "wins"),
      e: num(s, "ties"),
      p: num(s, "losses"),
      gf: num(s, "pointsFor"),
      gc: num(s, "pointsAgainst"),
      dg: num(s, "pointDifferential"),
      pts: num(s, "points"),
    };
  });

  const formas = await Promise.all(base.map((b: any) => formaDeEquipo(b.espn_id, season, seasonType)));
  const equipos: EquipoTabla[] = base
    .map((b: any, i: number) => ({ ...b, forma: formas[i] }))
    .sort((a: EquipoTabla, b: EquipoTabla) => (a.posicion || 99) - (b.posicion || 99));

  return {
    torneo: `${st.seasonDisplayName ?? d.season?.displayName ?? "Liga BetPlay"} · ${grupo?.name ?? ""}`.trim(),
    actualizado: new Date().toISOString(),
    equipos,
  };
}

/** Tabla con caché de 20 minutos. Si ESPN falla, devuelve la última copia buena. */
export async function obtenerTablaLiga(): Promise<TablaLiga> {
  if (cache && Date.now() - cache.ts < CACHE_MS) return cache.datos;
  if (enCurso) return enCurso;
  enCurso = construir()
    .then((datos) => {
      cache = { datos, ts: Date.now() };
      return datos;
    })
    .catch((e) => {
      if (cache) return cache.datos;
      throw e;
    })
    .finally(() => {
      enCurso = null;
    });
  return enCurso;
}

/** Normaliza nombres de equipo para cruzar ESPN con la base ("Junior F.C." ~ "Atlético Junior"). */
export function normalizarEquipo(nombre: string): string {
  return (nombre || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\b(f\.?\s?c\.?|daf|ceif|s\.?a\.?|club|de cordoba|de bogota)\b/g, " ")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Diferencias conocidas entre los nombres de ESPN y los de la base (ya normalizados).
const ALIAS: Record<string, string> = {
  "atletico junior": "junior",
  alianza: "alianza valledupar",
  "aguilas doradas rionegro": "aguilas doradas",
};

/** Clave canónica de un equipo: igual para ESPN y para la base. */
export function claveEquipo(nombre: string): string {
  const n = normalizarEquipo(nombre);
  return ALIAS[n] ?? n;
}

/**
 * true si dos nombres se refieren al mismo club. Igualdad EXACTA de la clave: comparar
 * por "contiene" daba falsos positivos ("deportivo cali" ~ "america de cali").
 */
export function mismoEquipo(a: string, b: string): boolean {
  const x = claveEquipo(a);
  return !!x && x === claveEquipo(b);
}
