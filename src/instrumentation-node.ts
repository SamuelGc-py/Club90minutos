/**
 * Reloj interno del servidor (Next.js llama a register() una vez al arrancar el proceso).
 *
 * Cada 5 minutos revisa:
 *   - la liquidación automática de partidos terminados (con su propio freno de 10 min);
 *   - el recordatorio diario de pronósticos pendientes (desde las 09:00 de Bogotá, uno por persona y día).
 *
 * Antes la liquidación solo se disparaba cuando algún navegador consultaba /api/partidos-en-vivo;
 * con este reloj corre aunque nadie tenga el sitio abierto. Ambos procesos son idempotentes,
 * así que no hay problema si además los dispara un cron externo (/api/cron/espn, /api/cron/recordatorios).
 *
 * Interruptor general: TAREAS_PROGRAMADAS=0 apaga el reloj.
 */
export async function iniciarReloj() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.TAREAS_PROGRAMADAS === "0" || process.env.TAREAS_PROGRAMADAS === "false") return;

  const g = globalThis as any;
  if (g.__club90Reloj) return; // una sola vez por proceso (evita duplicados en recargas de desarrollo)

  const { dispararLiquidacionAutomatica } = await import("./lib/liquidacionAutomatica");
  const { dispararRecordatorios } = await import("./lib/recordatorios");

  const tick = () => {
    try {
      dispararLiquidacionAutomatica()?.catch(() => {});
      dispararRecordatorios()?.catch(() => {});
    } catch (e: any) {
      console.error("[reloj] error:", e?.message);
    }
  };

  g.__club90Reloj = setInterval(tick, 5 * 60 * 1000);
  setTimeout(tick, 60 * 1000); // primera revisión un minuto después de arrancar
  console.log("[reloj] tareas programadas activas (liquidación + recordatorios)");
}
