import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const ES_HASH_BCRYPT = (valor: string) => /^\$2[aby]\$/.test(valor);

export async function POST(req: Request) {
  try {
    const { correo, password, sesionToken, soloConsulta } = await req.json();

    if (!correo || typeof correo !== "string") {
      return NextResponse.json(
        { error: "Correo electrónico requerido" },
        { status: 400 }
      );
    }

    // Consulta liviana: solo indica si la cuenta ya tiene contraseña, sin iniciar sesión.
    if (soloConsulta) {
      const emailConsulta = correo.trim().toLowerCase();
      const usr = await prisma.usuario.findUnique({ where: { correo: emailConsulta } });
      return NextResponse.json({
        existe: !!usr,
        tieneClave: !!(usr && usr.password),
      });
    }

    const esResync = typeof sesionToken === "string" && sesionToken.length > 0;

    if (!esResync && (!password || typeof password !== "string" || !password.trim())) {
      return NextResponse.json(
        { error: "Contraseña requerida" },
        { status: 400 }
      );
    }

    const emailLimpio = correo.trim().toLowerCase();
    const passLimpio = password ? password.trim() : "";
    const credencialesInvalidas = NextResponse.json({
      existe: true, // fingir que existe para que caiga en el error del frontend
      activo: true,
      error: "Usuario o contraseña incorrecto. Por favor verifica tus datos.",
    }, { status: 401 });

    // Buscar usuario en PostgreSQL
    const usuario = await prisma.usuario.findUnique({
      where: { correo: emailLimpio },
      include: {
        prediccion_inicial: {
          include: {
            clasificados: true,
          },
        },
        predicciones_partido: true,
      },
    });

    if (!usuario) {
      return credencialesInvalidas;
    }

    if (!usuario.activo) {
      return NextResponse.json({
        existe: true,
        activo: false,
        nombre: usuario.nombre_completo,
        mensaje: `Hola ${usuario.nombre_completo}, tu cuenta aún está pendiente de activación por el administrador en pgAdmin.`,
      });
    }

    let sesionTokenRespuesta = usuario.sesion_token;

    if (esResync) {
      // Re-sincronización de sesión ya iniciada: exige el token emitido en el login
      // original en vez de confiar ciegamente en el correo (eso era el bypass real).
      if (!usuario.sesion_token || usuario.sesion_token !== sesionToken) {
        return credencialesInvalidas;
      }
    } else if (!usuario.password) {
      // Primer ingreso: la cuenta (creada por el admin en pgAdmin sin clave) queda
      // asociada a la primera clave con la que alguien inicie sesión. Decisión explícita
      // del dueño del proyecto: grupo pequeño y de confianza, no se exige flujo de reseteo.
      const hashNuevo = await bcrypt.hash(passLimpio, 10);
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { password: hashNuevo },
      });
    } else if (ES_HASH_BCRYPT(usuario.password)) {
      const coincide = await bcrypt.compare(passLimpio, usuario.password);
      if (!coincide) return credencialesInvalidas;
    } else {
      // Compatibilidad con claves antiguas guardadas en texto plano: si coincide,
      // se re-hashea de una vez para migrar la cuenta de forma transparente.
      if (usuario.password !== passLimpio) return credencialesInvalidas;
      const hashMigrado = await bcrypt.hash(passLimpio, 10);
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { password: hashMigrado },
      });
    }

    if (!esResync) {
      // Emitir un token de sesión nuevo en cada login real con contraseña.
      sesionTokenRespuesta = uuidv4();
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { sesion_token: sesionTokenRespuesta },
      });
    }

    // Usuario activo habilitado
    return NextResponse.json({
      existe: true,
      activo: true,
      sesionToken: sesionTokenRespuesta,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        correo: usuario.correo,
        rol_id: usuario.rol_id,
      },
      prediccionesGuardadas: {
        inicial: usuario.prediccion_inicial,
        partidos: usuario.predicciones_partido,
      },
    });
  } catch (error: any) {
    console.error("Error validando usuario:", error);
    return NextResponse.json(
      { error: "Error al consultar la base de datos: " + error.message },
      { status: 500 }
    );
  }
}
