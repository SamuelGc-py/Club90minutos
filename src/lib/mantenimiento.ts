/**
 * MODO MANTENIMIENTO
 * ==================
 *
 * Cuando está activo, el middleware envía a TODOS los visitantes a /mantenimiento y
 * responde 503 a las APIs de participantes, de modo que nadie guarda pronósticos ni
 * lee datos mientras se trabaja en la base.
 *
 * CÓMO ACTIVARLO / DESACTIVARLO
 *   - Cambiar `MANTENIMIENTO_ACTIVO` abajo, commit y push (Hostinger redespliega).
 *   - Para volver atrás rápido: `git revert` del commit que lo activó.
 *   - Opcional: la variable de entorno MANTENIMIENTO ("1" / "0") tiene prioridad sobre
 *     la constante, pero en Hostinger solo se lee al reiniciar la app, así que la
 *     constante es el interruptor confiable.
 */
export const MANTENIMIENTO_ACTIVO = true;

export function mantenimientoActivo(): boolean {
  const env = process.env.MANTENIMIENTO;
  if (env === "1" || env === "true") return true;
  if (env === "0" || env === "false") return false;
  return MANTENIMIENTO_ACTIVO;
}

/** Rutas que siguen funcionando mientras el sitio está en mantenimiento. */
export function rutaPermitidaEnMantenimiento(pathname: string): boolean {
  return (
    pathname === "/mantenimiento" ||
    pathname.startsWith("/mantenimiento/") ||
    // Activos estáticos que usa la propia página de mantenimiento
    pathname.startsWith("/marca/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    // Las rutas de administración tienen su propia autenticación (usuario admin +
    // secreto), y hacen falta para trabajar durante el mantenimiento.
    pathname.startsWith("/api/admin/")
  );
}
