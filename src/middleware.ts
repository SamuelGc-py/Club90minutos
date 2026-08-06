import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Solo restringe acceso cuando corre en Vercel (process.env.VERCEL lo inyecta
// la plataforma automaticamente). Hostinger, donde entran los participantes
// reales, no tiene esa variable y queda sin tocar.
export function middleware(request: NextRequest) {
  if (!process.env.VERCEL) {
    return NextResponse.next();
  }

  const user = process.env.VERCEL_BASIC_AUTH_USER;
  const pass = process.env.VERCEL_BASIC_AUTH_PASS;

  if (!user || !pass) {
    // Sin credenciales configuradas en Vercel, no hay nada que comparar:
    // se deja pasar para no dejar el deploy inaccesible por accidente.
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
