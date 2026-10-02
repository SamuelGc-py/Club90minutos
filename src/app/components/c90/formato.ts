// Formatos de fecha y tiempo compartidos por los componentes de la marca.
// Todo en hora de Bogotá, sin depender de la zona del navegador.

const TZ = "America/Bogota";

/** "16:05" */
export function horaCorta(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ });
}

/** Clave de día "2026-10-04" en hora de Bogotá, para agrupar. */
export function claveDia(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

/** "Sábado 4 de octubre" (o "Hoy" / "Mañana"). */
export function etiquetaDia(iso: string, ahora: Date = new Date()): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const clave = claveDia(iso);
  const hoy = claveDia(ahora.toISOString());
  const manana = claveDia(new Date(ahora.getTime() + 86400000).toISOString());
  const texto = d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  const capital = texto.charAt(0).toUpperCase() + texto.slice(1).replace(",", "");
  if (clave === hoy) return `Hoy · ${capital}`;
  if (clave === manana) return `Mañana · ${capital}`;
  return capital;
}

/**
 * Tiempo restante legible y estable:
 *   > 1 día  → "3 d 4 h"
 *   > 1 hora → "4 h 12 min"
 *   < 1 hora → "12:09"
 */
export function tiempoRestante(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSeg = Math.floor(ms / 1000);
  const dias = Math.floor(totalSeg / 86400);
  const horas = Math.floor((totalSeg % 86400) / 3600);
  const mins = Math.floor((totalSeg % 3600) / 60);
  const segs = totalSeg % 60;
  if (dias > 0) return `${dias} d ${horas} h`;
  if (horas > 0) return `${horas} h ${mins} min`;
  return `${mins}:${String(segs).padStart(2, "0")}`;
}

/** Cierre de pronósticos: 30 minutos antes del partido (misma regla del servidor). */
export function horaCierre(iso: string): number {
  return new Date(iso).getTime() - 30 * 60 * 1000;
}

export function primerNombre(nombre: string | undefined | null): string {
  return (nombre || "").trim().split(/\s+/)[0] || "";
}
