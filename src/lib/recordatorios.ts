import { prisma } from "@/lib/db";
import { correoConfigurado, enviarCorreo, escaparHtml, plantillaCorreo, urlSitio } from "@/lib/correo";
import { liberarEnvio, reservarEnvio } from "@/lib/registroEnvios";

/**
 * RECORDATORIO ANTES DEL CIERRE
 * =============================
 * Cada día con partidos, desde las 09:00 (hora de Bogotá), se envía un correo a cada
 * participante activo que tenga partidos de HOY sin pronóstico y todavía abiertos
 * (el cierre es 30 minutos antes del pitazo). Quien ya pronosticó todo no recibe nada.
 *
 * - Un solo correo por persona por día (registroEnvios: clave recordatorio:<día>:<usuario>).
 * - Si el servidor estuvo caído a las 9:00, se envía en cuanto vuelva (mientras queden
 *   partidos abiertos ese día).
 * - Interruptor: RECORDATORIOS_ACTIVOS ("0" apaga). Hora: RECORDATORIO_HORA (por defecto 9).
 */

const TZ = "America/Bogota";
const CIERRE_MS = 30 * 60 * 1000;

// Mismas cuentas excluidas de la tabla de posiciones (consolidados) + cuentas de prueba.
const CORREOS_EXCLUIDOS = new Set(
  ["adminpollabetplay@gmail.com", "prueba.admin@pollabetplay.com", "pruebas@pollabetplay.com", "prueba@gmail.com"].map((c) => c.toLowerCase())
);
const esCuentaDePrueba = (correo: string) => CORREOS_EXCLUIDOS.has(correo.toLowerCase()) || /@test\.local$/i.test(correo);

export function recordatoriosActivos(): boolean {
  const v = process.env.RECORDATORIOS_ACTIVOS;
  if (v === "0" || v === "false") return false;
  // Pendiente: sin proveedor de correo configurado en el servidor no se intenta enviar.
  return correoConfigurado();
}

export function horaRecordatorio(): number {
  const h = Number(process.env.RECORDATORIO_HORA);
  return Number.isFinite(h) && h >= 0 && h <= 23 ? h : 9;
}

/** "2026-10-03" en hora de Bogotá */
export const diaBogota = (d: Date = new Date()) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const horaBogota = (d: Date = new Date()) => Number(d.toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hour12: false })) % 24;
const horaLegible = (d: Date) => d.toLocaleTimeString("es-CO", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });

/** Rango UTC del día de Bogotá (UTC-5 fijo, sin horario de verano). */
function rangoDia(dia: string) {
  const inicio = new Date(`${dia}T00:00:00-05:00`);
  return { inicio, fin: new Date(inicio.getTime() + 24 * 60 * 60 * 1000) };
}

export interface PendienteUsuario {
  usuario_id: number;
  nombre: string;
  correo: string;
  partidos: { id: number; partido: string; hora: string; cierre: string }[];
}

/** Calcula quién tiene partidos de hoy abiertos sin pronóstico (no envía nada). */
export async function calcularPendientesDelDia(dia: string = diaBogota(), ahora: Date = new Date()): Promise<{ partidosDelDia: number; pendientes: PendienteUsuario[] }> {
  const { inicio, fin } = rangoDia(dia);
  const partidos = await prisma.partido.findMany({
    where: { fecha_hora_partido: { gte: inicio, lt: fin }, estado: { not: "aplazado" } },
    include: { equipo_local: { select: { nombre: true } }, equipo_visitante: { select: { nombre: true } } },
    orderBy: { fecha_hora_partido: "asc" },
  });
  // Solo los que siguen abiertos
  const abiertos = partidos.filter((p) => p.fecha_hora_partido.getTime() - CIERRE_MS > ahora.getTime());
  if (!abiertos.length) return { partidosDelDia: partidos.length, pendientes: [] };

  const usuarios = await prisma.usuario.findMany({
    where: { activo: true },
    select: { id: true, nombre_completo: true, correo: true },
  });
  const preds = await prisma.prediccionPartido.findMany({
    where: { partido_id: { in: abiertos.map((p) => p.id) } },
    select: { usuario_id: true, partido_id: true },
  });
  const hechos = new Set(preds.map((p) => `${p.usuario_id}:${p.partido_id}`));

  const pendientes: PendienteUsuario[] = [];
  for (const u of usuarios) {
    if (!u.correo || esCuentaDePrueba(u.correo)) continue;
    const faltan = abiertos.filter((p) => !hechos.has(`${u.id}:${p.id}`));
    if (!faltan.length) continue;
    pendientes.push({
      usuario_id: u.id,
      nombre: u.nombre_completo,
      correo: u.correo,
      partidos: faltan.map((p) => ({
        id: p.id,
        partido: `${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}`,
        hora: horaLegible(p.fecha_hora_partido),
        cierre: horaLegible(new Date(p.fecha_hora_partido.getTime() - CIERRE_MS)),
      })),
    });
  }
  return { partidosDelDia: partidos.length, pendientes };
}

export function htmlRecordatorio(p: PendienteUsuario): { asunto: string; html: string; texto: string } {
  const n = p.partidos.length;
  const primerNombre = escaparHtml(p.nombre.split(/\s+/)[0] || p.nombre);
  const filas = p.partidos
    .map(
      (x) =>
        `<tr><td style="padding:10px 0;border-top:1px solid #04060A;font-weight:600;color:#FFFFFF">${escaparHtml(x.partido)}</td>` +
        `<td style="padding:10px 0;border-top:1px solid #04060A;text-align:right;white-space:nowrap;font-family:'JetBrains Mono',Consolas,monospace;font-size:13px;color:#EFCC36">cierra ${x.cierre}</td></tr>`
    )
    .join("");
  const cuerpo =
    `<p style="margin:0 0 16px">Hola, ${primerNombre}. Hoy hay partido y ${n === 1 ? "te falta 1 pronóstico" : `te faltan ${n} pronósticos`}. ` +
    `Cada partido cierra 30 minutos antes del pitazo.</p>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;font-size:14px">${filas}</table>`;
  const asunto = n === 1 ? `Te falta 1 pronóstico para hoy` : `Te faltan ${n} pronósticos para hoy`;
  const html = plantillaCorreo({ titulo: asunto, cuerpo, cta: { texto: "Pronosticar ahora", url: `${urlSitio()}/dashboard` } });
  const texto = `${asunto}.\n\n${p.partidos.map((x) => `- ${x.partido}: cierra ${x.cierre}`).join("\n")}\n\nPronostica en ${urlSitio()}/dashboard`;
  return { asunto, html, texto };
}

export interface ReporteRecordatorios {
  dia: string;
  partidosDelDia: number;
  enviados: number;
  yaEnviados: number;
  fallidos: { correo: string; error: string }[];
  omitido?: string;
}

/** Envía los recordatorios del día (idempotente: cada persona recibe uno solo). */
export async function enviarRecordatoriosDelDia(opciones: { forzarHora?: boolean; ahora?: Date } = {}): Promise<ReporteRecordatorios> {
  const ahora = opciones.ahora ?? new Date();
  const dia = diaBogota(ahora);
  const reporte: ReporteRecordatorios = { dia, partidosDelDia: 0, enviados: 0, yaEnviados: 0, fallidos: [] };

  if (!opciones.forzarHora && horaBogota(ahora) < horaRecordatorio()) {
    reporte.omitido = `Antes de las ${horaRecordatorio()}:00`;
    return reporte;
  }

  const { partidosDelDia, pendientes } = await calcularPendientesDelDia(dia, ahora);
  reporte.partidosDelDia = partidosDelDia;
  if (!partidosDelDia) reporte.omitido = "Hoy no hay partidos";

  for (const p of pendientes) {
    const clave = `recordatorio:${dia}:${p.usuario_id}`;
    if (!(await reservarEnvio(clave, "recordatorio", p.correo, p.partidos.map((x) => x.id).join(",")))) {
      reporte.yaEnviados++;
      continue;
    }
    const { asunto, html, texto } = htmlRecordatorio(p);
    const r = await enviarCorreo({ para: p.correo, asunto, html, texto });
    if (r.ok) reporte.enviados++;
    else {
      await liberarEnvio(clave);
      reporte.fallidos.push({ correo: p.correo, error: r.error || "error desconocido" });
    }
  }
  if (reporte.enviados || reporte.fallidos.length) console.log("[recordatorios]", JSON.stringify(reporte));
  return reporte;
}

// --- Disparo con freno (lo llama el reloj del servidor cada pocos minutos) ---
let enCurso: Promise<ReporteRecordatorios> | null = null;
let ultimaRevision = 0;
export let ultimoReporteRecordatorios: (ReporteRecordatorios & { fecha: string }) | null = null;

export function dispararRecordatorios(forzar = false): Promise<ReporteRecordatorios> | null {
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  if (!recordatoriosActivos()) return null;
  if (enCurso) return enCurso;
  if (!forzar && Date.now() - ultimaRevision < 5 * 60 * 1000) return null;
  ultimaRevision = Date.now();
  enCurso = enviarRecordatoriosDelDia()
    .then((r) => {
      ultimoReporteRecordatorios = { ...r, fecha: new Date().toISOString() };
      return r;
    })
    .catch((e) => {
      console.error("[recordatorios] error:", e?.message);
      return { dia: diaBogota(), partidosDelDia: 0, enviados: 0, yaEnviados: 0, fallidos: [{ correo: "-", error: String(e?.message) }] };
    })
    .finally(() => {
      enCurso = null;
    });
  return enCurso;
}
