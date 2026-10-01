import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

/**
 * AUTENTICACIÓN DE LAS RUTAS API
 * ==============================
 *
 * Antes de este módulo, casi todas las rutas confiaban en el `usuario_id` que el
 * navegador mandaba en el body. Bastaba con enviar el id del administrador para
 * cargar resultados, borrar jugadores o reliquidar, y con enviar el id de otra
 * persona para cambiarle los pronósticos.
 *
 * Ahora la identidad sale de una cookie httpOnly que solo emite el servidor al
 * iniciar sesión con contraseña correcta:
 *
 *     c90_sesion = "<usuario_id>.<sesion_token>"
 *
 * El token es el mismo `usuario.sesion_token` que ya existía (se rota en cada login
 * real), así que no hay cambios de esquema. El navegador envía la cookie solo en
 * peticiones del mismo sitio (SameSite=Lax), y JavaScript no puede leerla (httpOnly).
 */

export const COOKIE_SESION = "c90_sesion";

export interface Sesion {
  usuarioId: number;
  nombre: string;
  correo: string;
  rolId: number;
  esAdmin: boolean;
}

function iguales(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function leerCookie(req: Request, nombre: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const parte of header.split(";")) {
    const i = parte.indexOf("=");
    if (i === -1) continue;
    if (parte.slice(0, i).trim() === nombre) {
      try {
        return decodeURIComponent(parte.slice(i + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Devuelve la sesión válida de la petición, o null si no hay o no es válida. */
export async function obtenerSesion(req: Request): Promise<Sesion | null> {
  const valor = leerCookie(req, COOKIE_SESION);
  if (!valor) return null;

  const punto = valor.indexOf(".");
  if (punto <= 0) return null;
  const usuarioId = Number(valor.slice(0, punto));
  const token = valor.slice(punto + 1);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 || token.length < 16) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { rol: true },
  });
  if (!usuario || !usuario.activo || !usuario.sesion_token) return null;
  if (!iguales(usuario.sesion_token, token)) return null;

  return {
    usuarioId: usuario.id,
    nombre: usuario.nombre_completo,
    correo: usuario.correo,
    rolId: usuario.rol_id,
    esAdmin: usuario.rol?.nombre === "administrador",
  };
}

type Resultado = { sesion: Sesion; error?: undefined } | { sesion?: undefined; error: NextResponse };

/** Exige un participante autenticado. */
export async function requerirSesion(req: Request): Promise<Resultado> {
  const sesion = await obtenerSesion(req);
  if (!sesion) {
    return {
      error: NextResponse.json(
        { error: "Tu sesión expiró o no es válida. Vuelve a iniciar sesión.", sesionInvalida: true },
        { status: 401 }
      ),
    };
  }
  return { sesion };
}

/** Exige un administrador autenticado. */
export async function requerirAdmin(req: Request): Promise<Resultado> {
  const r = await requerirSesion(req);
  if (r.error) return r;
  if (!r.sesion.esAdmin) {
    return { error: NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 }) };
  }
  return r;
}

/** Verifica un secreto compartido (cron / procesos automáticos). */
export function secretoValido(req: Request, nombresVariables: string[]): boolean {
  const url = new URL(req.url);
  const recibido =
    req.headers.get("x-cron-secret") ||
    req.headers.get("x-sync-secret") ||
    (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "") ||
    url.searchParams.get("secret") ||
    "";
  if (!recibido) return false;
  for (const nombre of nombresVariables) {
    const esperado = process.env[nombre];
    if (esperado && iguales(esperado, recibido)) return true;
  }
  return false;
}

/** Adjunta la cookie de sesión a una respuesta (login / re-sincronización). */
export function adjuntarCookieSesion(res: NextResponse, req: Request, usuarioId: number, token: string) {
  const proto = req.headers.get("x-forwarded-proto") || new URL(req.url).protocol.replace(":", "");
  res.cookies.set({
    name: COOKIE_SESION,
    value: `${usuarioId}.${token}`,
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    // Sin maxAge: cookie de sesión del navegador, igual que el sessionStorage del cliente.
  });
  return res;
}

export function borrarCookieSesion(res: NextResponse) {
  res.cookies.set({ name: COOKIE_SESION, value: "", httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
