import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { mantenimientoActivo, rutaPermitidaEnMantenimiento } from "@/lib/mantenimiento";

// Solo restringe acceso cuando corre en Vercel (process.env.VERCEL lo inyecta
// la plataforma automáticamente). Hostinger, donde entran los participantes
// reales, no tiene esa variable y queda sin tocar.
export function middleware(request: NextRequest) {
  // Modo mantenimiento: tiene prioridad sobre todo lo demás (ver src/lib/mantenimiento.ts).
  if (mantenimientoActivo()) {
    const { pathname } = request.nextUrl;
    if (!rutaPermitidaEnMantenimiento(pathname)) {
      if (pathname.startsWith("/api/")) {
        // 503 + Retry-After: los clientes y buscadores entienden que es temporal.
        return NextResponse.json(
          { error: "Sitio en mantenimiento. Intenta de nuevo en unos minutos.", mantenimiento: true },
          { status: 503, headers: { "Retry-After": "600", "Cache-Control": "no-store" } }
        );
      }
      // 307 (temporal): nunca se debe cachear como redirección permanente.
      const url = request.nextUrl.clone();
      url.pathname = "/mantenimiento";
      url.search = "";
      return NextResponse.redirect(url, 307);
    }
  } else {
    // Si el mantenimiento NO está activo pero el usuario navega explícitamente a /mantenimiento
    // (por ejemplo, si refrescó la página después de que lo desactivamos), lo sacamos de ahí.
    const { pathname } = request.nextUrl;
    if (pathname === "/mantenimiento") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url, 307);
    }
  }

  if (!process.env.VERCEL) {
    return NextResponse.next();
  }

  const user = process.env.VERCEL_BASIC_AUTH_USER;
  const pass = process.env.VERCEL_BASIC_AUTH_PASS;

  if (!user || !pass) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const separatorIndex = decoded.indexOf(":");
      const suppliedUser = decoded.slice(0, separatorIndex);
      const suppliedPass = decoded.slice(separatorIndex + 1);
      if (suppliedUser === user && suppliedPass === pass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Acceso restringido", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Club 90 Minutos"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
