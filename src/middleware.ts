import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir la página de mantenimiento y archivos estáticos
  if (
    pathname.startsWith("/mantenimiento") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/marca") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  // Redirigir todas las solicitudes a /mantenimiento
  return NextResponse.redirect(new URL("/mantenimiento", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
