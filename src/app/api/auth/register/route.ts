import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { nombre_completo, correo, password } = await req.json();

    if (!nombre_completo || !correo || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
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
