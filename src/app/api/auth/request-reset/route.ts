import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { correo } = await req.json();

    if (!correo || typeof correo !== "string") {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo: correo.trim() },
    });

    if (!usuario) {
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

    // Determine public URL dynamically from request headers
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : "https://polla-express.vercel.app");
    
    const resetUrl = `${baseUrl}/restablecer-password?token=${token}`;

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    // Opción 1: Enviar mediante Gmail SMTP si están configuradas las credenciales en Vercel
    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `"Polla Betplay" <${gmailUser}>`,
        to: usuario.correo,
        subject: "Recuperación de contraseña - Polla Betplay",
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px;">
            <h2>⚽ Polla Betplay</h2>
            <p>Hola <strong>${usuario.nombre_completo}</strong>,</p>
            <p>Has solicitado restablecer tu contraseña para ingresar a la Polla Betplay.</p>
            <p>Haz clic en el siguiente botón para crear tu nueva contraseña:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; margin: 20px 0; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1rem;">Restablecer Contraseña</a>
            <p style="font-size: 0.85rem; color: #666;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p style="font-size: 0.85rem; color: #666;">El enlace expirará en 1 hora.</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true, message: "Correo de recuperación enviado exitosamente a tu bandeja de entrada." });
    }

    // Opción 2: Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: "Polla Betplay <onboarding@resend.dev>",
        to: usuario.correo,
        subject: "Recuperación de contraseña - Polla Betplay",
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px;">
            <h2>⚽ Polla Betplay</h2>
            <p>Hola <strong>${usuario.nombre_completo}</strong>,</p>
            <p>Has solicitado restablecer tu contraseña.</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Restablecer Contraseña</a>
            <p>El enlace expirará en 1 hora.</p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        // Si Resend tiene restricciones de dominio en test, devolvemos success: true y el resetUrl directo
        return NextResponse.json({
          success: true,
          resetUrl,
          message: "Enlace de recuperación generado exitosamente.",
        });
      }

      return NextResponse.json({ success: true, message: "Correo enviado exitosamente." });
    }

    return NextResponse.json({ error: "No hay proveedor de correo configurado." }, { status: 500 });
  } catch (error) {
    console.error("Error en request-reset:", error);
    return NextResponse.json({ error: (error as Error).message || "Error interno del servidor" }, { status: 500 });
  }
}
