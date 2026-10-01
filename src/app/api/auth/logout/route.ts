import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenerSesion, borrarCookieSesion } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Cierra la sesión en el servidor: invalida el token (así una cookie copiada deja
 * de servir) y borra la cookie del navegador.
 */
export async function POST(req: Request) {
  try {
    const sesion = await obtenerSesion(req);
    if (sesion) {
      await prisma.usuario.update({ where: { id: sesion.usuarioId }, data: { sesion_token: null } });
    }
  } catch (e) {
    console.error("Error en logout:", e);
  }
  return borrarCookieSesion(NextResponse.json({ exito: true }));
}
