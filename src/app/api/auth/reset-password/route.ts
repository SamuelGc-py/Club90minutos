import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || typeof password !== "string" || password.trim().length < 4) {
      return NextResponse.json({ error: "Datos inválidos. La contraseña debe tener al menos 4 caracteres." }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.usado) {
      return NextResponse.json({ error: "El enlace es inválido o ya fue usado." }, { status: 400 });
    }

    if (resetToken.expiracion < new Date()) {
      return NextResponse.json({ error: "El enlace ha expirado." }, { status: 400 });
    }

    // Update password
    await prisma.usuario.update({
      where: { correo: resetToken.correo },
      data: { password: password.trim() },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usado: true },
    });

    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
