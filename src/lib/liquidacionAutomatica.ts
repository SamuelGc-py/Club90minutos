import { prisma } from "@/lib/db";
import { calcularPuntosPartido } from "@/lib/calculadorPuntos";
import { claveEquipo } from "@/lib/ligaEspn";

/**
 * LIQUIDACIÓN AUTOMÁTICA DE PARTIDOS FINALIZADOS
 * ==============================================
 *
 * Cuando ESPN marca un partido como terminado, se toma el marcador y los goleadores
 * y se liquidan los puntos de todos los participantes con calcularPuntosPartido
 * (atómico, ver src/lib/calculadorPuntos.ts).
 *
 * Reglas de seguridad (aprendidas de la pérdida de puntos de goleador de septiembre):
 *   1. NUNCA toca un partido que el admin ya cargó (estado resultado_cargado o
 *      puntaje_calculado) ni uno aplazado: el control manual siempre gana.
 *   2. Cada goleador de ESPN se busca SOLO entre los jugadores del equipo que anotó,
 *      por nombre completo exacto o, si no, por un apellido que sea único en ese
 *      equipo. Nunca por "contiene", que emparejaba al jugador equivocado.
 *   3. Si algún gol (que no sea autogol) no se puede atribuir con certeza, o si los
 *      goles de ESPN no cuadran con el marcador, el partido NO se liquida: queda
 *      reportado como "requiere revisión" para que el admin lo cargue a mano. Es
 *      preferible esperar que repartir puntos de goleador equivocados.
 *
 * Interruptor: LIQUIDACION_AUTOMATICA_ACTIVA abajo, o la variable de entorno
 * LIQUIDACION_AUTOMATICA ("0" la apaga, "1" la enciende).
 */
export const LIQUIDACION_AUTOMATICA_ACTIVA = true;

const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard";
const INTERVALO_MS = 10 * 60 * 1000; // como máximo una revisión cada 10 minutos
const MIN_TRAS_INICIO_MS = 110 * 60 * 1000; // un partido no termina antes de ~110 min
const VENTANA_DIAS = 4; // revisa partidos de los últimos 4 días

export function liquidacionAutomaticaActiva(): boolean {
  const env = process.env.LIQUIDACION_AUTOMATICA;
  if (env === "0" || env === "false") return false;
  if (env === "1" || env === "true") return true;
  return LIQUIDACION_AUTOMATICA_ACTIVA;
}

export interface ReporteLiquidacion {
  revisados: number;
  liquidados: { partido_id: number; partido: string; marcador: string; goleadores: string[] }[];
  requierenRevision: { partido_id: number; partido: string; motivo: string }[];
  sinTerminar: number;
  sinEventoEspn: number;
  /** Partidos ya jugados que no aparecen en ESPN (nombre distinto, fecha corrida…): carga manual. */
  noEncontrados: { partido_id: number; partido: string }[];
}

const normalizar = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Busca el jugador por nombre entre los del equipo que anotó. null si no hay certeza. */
export function resolverGoleador(nombreEspn: string, jugadoresEquipo: { id: number; nombre: string }[]): number | null {
  const objetivo = normalizar(nombreEspn);
  if (!objetivo) return null;

  const exactos = jugadoresEquipo.filter((j) => normalizar(j.nombre) === objetivo);
  if (exactos.length === 1) return exactos[0].id;

  // Apellido(s): ESPN "Johan Andrés Martínez" vs base "Johan Martinez"
  const tokens = objetivo.split(" ").filter((t) => t.length > 2);
  if (!tokens.length) return null;
  const apellido = tokens[tokens.length - 1];
  const nombre = tokens[0];

  // Mismo nombre y mismo último apellido
  const porNombreYApellido = jugadoresEquipo.filter((j) => {
    const t = normalizar(j.nombre).split(" ");
    return t[0] === nombre && t[t.length - 1] === apellido;
  });
  if (porNombreYApellido.length === 1) return porNombreYApellido[0].id;

  // Apellido único en el equipo: debe ser el ÚLTIMO token del nombre en la base. Buscarlo
  // en cualquier posición emparejaba un nombre de pila ("Jair" ~ "... Jair ...").
  const porApellido = jugadoresEquipo.filter((j) => {
    const t = normalizar(j.nombre).split(" ");
    return t.length > 1 && t[t.length - 1] === apellido;
  });
  if (porApellido.length === 1) return porApellido[0].id;

  return null;
}

async function scoreboard(fecha: string): Promise<any[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`${ESPN}?dates=${fecha}`, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).events ?? [];
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

const ESTADOS_FINALES = new Set(["STATUS_FULL_TIME", "STATUS_FINAL", "STATUS_FINAL_AET", "STATUS_FINAL_PEN"]);
const ESTADOS_ANOMALOS = new Set([
  "STATUS_POSTPONED",
  "STATUS_CANCELED",
  "STATUS_ABANDONED",
  "STATUS_SUSPENDED",
  "STATUS_FORFEIT",
  "STATUS_DELAYED",
  "STATUS_RAIN_DELAY",
]);

const yyyymmdd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

export async function liquidarPartidosFinalizados(): Promise<ReporteLiquidacion> {
  const reporte: ReporteLiquidacion = { revisados: 0, liquidados: [], requierenRevision: [], sinTerminar: 0, sinEventoEspn: 0, noEncontrados: [] };
  const ahora = Date.now();

  const candidatos = await prisma.partido.findMany({
    where: {
      estado: { in: ["programado", "predicciones_abiertas", "predicciones_cerradas", "resultado_pendiente"] },
      resultado_oficial: { is: null },
      fecha_hora_partido: {
        gte: new Date(ahora - VENTANA_DIAS * 24 * 60 * 60 * 1000),
        lte: new Date(ahora - MIN_TRAS_INICIO_MS),
      },
    },
    include: { equipo_local: true, equipo_visitante: true },
  });
  reporte.revisados = candidatos.length;
  if (!candidatos.length) return reporte;

  // Una consulta a ESPN por fecha (UTC del partido y la anterior, por la diferencia horaria)
  const fechas = new Set<string>();
  for (const p of candidatos) {
    const f = new Date(p.fecha_hora_partido);
    fechas.add(yyyymmdd(f));
    fechas.add(yyyymmdd(new Date(f.getTime() - 24 * 60 * 60 * 1000)));
  }
  const eventos = (await Promise.all([...fechas].map(scoreboard))).flat();

  for (const p of candidatos) {
    const nombrePartido = `${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}`;
    const kL = claveEquipo(p.equipo_local.nombre);
    const kV = claveEquipo(p.equipo_visitante.nombre);

    const ev = eventos.find((e: any) => {
      const cs = e.competitions?.[0]?.competitors ?? [];
      const h = cs.find((c: any) => c.homeAway === "home");
      const a = cs.find((c: any) => c.homeAway === "away");
      if (!h || !a) return false;
      if (claveEquipo(h.team?.displayName) !== kL || claveEquipo(a.team?.displayName) !== kV) return false;
      // mismo cruce puede repetirse en otra fase: exigir fecha cercana (±2 días)
      return Math.abs(new Date(e.date).getTime() - new Date(p.fecha_hora_partido).getTime()) < 2 * 24 * 60 * 60 * 1000;
    });

    if (!ev) {
      reporte.sinEventoEspn++;
      // Solo se avisa si ya debió terminar hace rato (no por un partido recién empezado)
      if (Date.now() - new Date(p.fecha_hora_partido).getTime() > 3 * 60 * 60 * 1000) {
        reporte.noEncontrados.push({ partido_id: p.id, partido: nombrePartido });
      }
      continue;
    }

    const comp = ev.competitions[0];
    const tipo = comp.status?.type ?? ev.status?.type ?? {};
    // Se decide por el NOMBRE del estado, no por `completed`: ESPN marca como
    // "completed" también partidos abandonados o suspendidos, que no deben liquidarse.
    if (ESTADOS_ANOMALOS.has(tipo.name)) {
      reporte.requierenRevision.push({ partido_id: p.id, partido: nombrePartido, motivo: `ESPN lo reporta como ${tipo.name}` });
      continue;
    }
    if (!ESTADOS_FINALES.has(tipo.name)) {
      reporte.sinTerminar++;
      continue;
    }

    const h = comp.competitors.find((c: any) => c.homeAway === "home");
    const a = comp.competitors.find((c: any) => c.homeAway === "away");
    const gl = parseInt(h.score ?? "0", 10) || 0;
    const gv = parseInt(a.score ?? "0", 10) || 0;

    // Goleadores, atribuidos solo dentro del equipo que anotó
    const [jugL, jugV] = await Promise.all([
      prisma.jugador.findMany({ where: { equipo_id: p.equipo_local_id }, select: { id: true, nombre: true } }),
      prisma.jugador.findMany({ where: { equipo_id: p.equipo_visitante_id }, select: { id: true, nombre: true } }),
    ]);

    const goles = (comp.details ?? []).filter((d: any) => d.scoringPlay && !d.shootout);
    const ids = new Set<number>();
    const nombres: string[] = [];
    const sinResolver: string[] = [];
    let autogoles = 0;

    for (const g of goles) {
      if (g.ownGoal) {
        autogoles++;
        continue; // nadie puede pronosticar un autogol
      }
      const nombreEspn = g.athletesInvolved?.[0]?.displayName || g.athletesInvolved?.[0]?.fullName || "";
      const anotoLocal = String(g.team?.id) === String(h.team?.id);
      const id = resolverGoleador(nombreEspn, anotoLocal ? jugL : jugV);
      if (id) {
        ids.add(id);
        nombres.push(nombreEspn);
      } else {
        sinResolver.push(nombreEspn || "(sin nombre)");
      }
    }

    if (goles.length !== gl + gv) {
      reporte.requierenRevision.push({
        partido_id: p.id,
        partido: nombrePartido,
        motivo: `ESPN reporta ${gl}-${gv} pero lista ${goles.length} gol(es) en el detalle`,
      });
      continue;
    }
    if (sinResolver.length) {
      reporte.requierenRevision.push({
        partido_id: p.id,
        partido: nombrePartido,
        motivo: `No se pudo identificar con certeza al goleador: ${sinResolver.join(", ")}. Créalo o corrígelo y carga el resultado manualmente.`,
      });
      continue;
    }

    try {
      // soloSiPendiente: el motor re-comprueba dentro de su transacción que el admin no
      // haya cargado el resultado mientras se consultaba ESPN; si lo hizo, no lo pisa.
      await calcularPuntosPartido(p.id, gl, gv, [...ids], null, { soloSiPendiente: true });
      reporte.liquidados.push({
        partido_id: p.id,
        partido: nombrePartido,
        marcador: `${gl}-${gv}`,
        goleadores: autogoles ? [...nombres, `${autogoles} autogol(es)`] : nombres,
      });
    } catch (e: any) {
      if (String(e?.message).includes("YA_CARGADO")) continue; // lo cargó el admin: se respeta
      reporte.requierenRevision.push({ partido_id: p.id, partido: nombrePartido, motivo: `Error al liquidar: ${e?.message}` });
    }
  }

  if (reporte.liquidados.length || reporte.requierenRevision.length) {
    console.log("[liquidacion-automatica]", JSON.stringify(reporte));
  }
  return reporte;
}

// --- Disparo con freno: como máximo una ejecución cada 10 minutos, nunca en paralelo ---
let ultimaEjecucion = 0;
let enCurso: Promise<ReporteLiquidacion> | null = null;
export let ultimoReporte: (ReporteLiquidacion & { fecha: string }) | null = null;

/**
 * @param forzar        ignora el freno de 10 minutos (cron externo, botón del admin).
 * @param ignorarInterruptor  solo para el botón del admin: ejecuta aunque la automática
 *                      esté apagada. Los procesos automáticos (cron, sync-live) NUNCA lo usan,
 *                      así que apagar el interruptor los detiene a todos.
 */
export function dispararLiquidacionAutomatica(forzar = false, ignorarInterruptor = false): Promise<ReporteLiquidacion> | null {
  // Nunca durante `next build` (Next ejecuta las rutas para pre-renderizarlas).
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  if (!liquidacionAutomaticaActiva() && !ignorarInterruptor) return null;
  if (enCurso) return enCurso;
  if (!forzar && Date.now() - ultimaEjecucion < INTERVALO_MS) return null;
  ultimaEjecucion = Date.now();
  enCurso = liquidarPartidosFinalizados()
    .then((r) => {
      ultimoReporte = { ...r, fecha: new Date().toISOString() };
      return r;
    })
    .catch((e) => {
      console.error("[liquidacion-automatica] error:", e?.message);
      return { revisados: 0, liquidados: [], requierenRevision: [], sinTerminar: 0, sinEventoEspn: 0, noEncontrados: [] };
    })
    .finally(() => {
      enCurso = null;
    });
  return enCurso;
}
