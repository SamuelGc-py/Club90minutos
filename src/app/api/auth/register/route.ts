import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nombre_completo = typeof body?.nombre_completo === "string" ? body.nombre_completo.trim() : "";
    // El login busca el correo en minúsculas: si aquí no se normaliza, una cuenta
    // registrada con mayúsculas nunca podría iniciar sesión.
    const correo = typeof body?.correo === "string" ? body.correo.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password.trim() : "";

    if (!nombre_completo || !correo || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este correo" },
        { status: 400 }
      );
    }

    // Buscar el rol 'participante'
    const rolParticipante = await prisma.rol.findUnique({
      where: { nombre: "participante" },
    });

    if (!rolParticipante) {
      return NextResponse.json(
        { error: "Rol por defecto no encontrado" },
        { status: 500 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre_completo,
        correo,
        password: hashedPassword,
        rol_id: rolParticipante.id,
        activo: true,
      },
      select: {
        id: true,
        nombre_completo: true,
        correo: true,
      },
    });

    return NextResponse.json(
      { message: "Usuario creado exitosamente", usuario: nuevoUsuario },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
