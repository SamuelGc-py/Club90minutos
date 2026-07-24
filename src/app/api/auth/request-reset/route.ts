import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { correo } = await req.json();

    if (!correo || typeof correo !== "string") {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo: correo.trim() },
    });

    if (!usuario) {
      // Return 200 even if not found to prevent email enumeration
      return NextResponse.json({ success: true, message: "Si el correo existe, se ha enviado un enlace." });
    }

    // Generate token
    const token = uuidv4();
    const expiracion = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        correo: usuario.correo,
        token,
        expiracion,
      },
    });

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/restablecer-password?token=${token}`;
    
    const { data, error } = await resend.emails.send({
      from: "Polla Betplay <onboarding@resend.dev>", // Resend default test domain
      to: usuario.correo,
      subject: "Recuperación de contraseña - Polla Betplay",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
          <h2>Polla Betplay</h2>
          <p>Hola ${usuario.nombre_completo},</p>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #0070c0; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
          <p>Si no solicitaste este cambio, ignora este correo.</p>
          <p>El enlace expirará en 1 hora.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message || "Error al enviar el correo con Resend" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Correo enviado" });
  } catch (error) {
    console.error("Error en request-reset:", error);
    return NextResponse.json({ error: (error as Error).message || "Error interno del servidor" }, { status: 500 });
  }
}
