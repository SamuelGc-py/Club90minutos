import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { correo, password, autoSync, soloConsulta } = await req.json();

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

    if (!autoSync && (!password || typeof password !== "string" || !password.trim())) {
      return NextResponse.json(
        { error: "Contraseña requerida" },
        { status: 400 }
      );
    }

    const emailLimpio = correo.trim().toLowerCase();
    const passLimpio = password ? password.trim() : "";

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
      return NextResponse.json({
        existe: true, // fingir que existe para que caiga en el error del frontend
        activo: true,
        error: "Usuario o contraseña incorrecto. Por favor verifica tus datos.",
      }, { status: 401 });
    }

    if (!usuario.activo) {
      return NextResponse.json({
        existe: true,
        activo: false,
        nombre: usuario.nombre_completo,
        mensaje: `Hola ${usuario.nombre_completo}, tu cuenta aún está pendiente de activación por el administrador en pgAdmin.`,
      });
    }

    // Validar contraseña si no es autoSync
    if (!autoSync && usuario.password && usuario.password !== passLimpio) {
      return NextResponse.json({
        existe: true,
        activo: true,
        error: "Usuario o contraseña incorrecto. Por favor verifica tus datos.",
      }, { status: 401 });
    }

    // Si el usuario no tenía contraseña establecida, asignarla en su primer ingreso
    if (!usuario.password) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { password: passLimpio },
      });
    }

    // Usuario activo habilitado
    return NextResponse.json({
      existe: true,
      activo: true,
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
