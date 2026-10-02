import nodemailer from "nodemailer";
import { Resend } from "resend";
import { promises as fs } from "fs";
import path from "path";

/**
 * ENVÍO DE CORREOS
 * ================
 * Mismos proveedores que la recuperación de contraseña:
 *   1. SMTP (GMAIL_USER + GMAIL_PASS; SMTP_HOST/SMTP_PORT para Hostinger Email).
 *   2. Resend (RESEND_API_KEY). Remitente en CORREO_REMITENTE. OJO: con el remitente
 *      de pruebas onboarding@resend.dev, Resend solo entrega al correo dueño de la
 *      cuenta; para escribirle a todos los participantes hay que verificar un dominio.
 *
 * Modo prueba (CORREO_MODO_PRUEBA=1): no se envía nada; cada correo se guarda como
 * .html (y sus adjuntos) en .correos-prueba/ para revisarlo en localhost.
 */

export interface Adjunto {
  nombre: string;
  contenido: Buffer;
  tipo: string;
}

export interface Correo {
  para: string | string[];
  asunto: string;
  html: string;
  texto?: string;
  adjuntos?: Adjunto[];
}

export interface ResultadoEnvio {
  ok: boolean;
  proveedor: "smtp" | "resend" | "prueba" | "ninguno";
  error?: string;
  archivo?: string;
}

export function modoPrueba(): boolean {
  const v = process.env.CORREO_MODO_PRUEBA;
  return v === "1" || v === "true";
}

const remitenteNombre = "Club 90 Minutos";

/** true si el servidor tiene con qué enviar (SMTP o Resend), o si está en modo prueba. */
export function proveedorDisponible(): boolean {
  return modoPrueba() || !!(process.env.GMAIL_USER && process.env.GMAIL_PASS) || !!process.env.RESEND_API_KEY;
}

/**
 * Envíos AUTOMÁTICOS MASIVOS (recordatorios): requieren activación explícita con
 * CORREOS_AUTOMATICOS=1 y un proveedor configurado. Así, tener RESEND_API_KEY para la
 * recuperación de contraseña no dispara envíos masivos que fallarían. En modo prueba
 * (localhost) siempre están activos porque no se envía nada.
 */
export function correoConfigurado(): boolean {
  if (modoPrueba()) return true;
  const activados = process.env.CORREOS_AUTOMATICOS === "1" || process.env.CORREOS_AUTOMATICOS === "true";
  const proveedor = !!(process.env.GMAIL_USER && process.env.GMAIL_PASS) || !!process.env.RESEND_API_KEY;
  return activados && proveedor;
}

async function guardarPrueba(c: Correo): Promise<ResultadoEnvio> {
  const dir = path.join(process.cwd(), ".correos-prueba");
  await fs.mkdir(dir, { recursive: true });
  const sello = new Date().toISOString().replace(/[:.]/g, "-");
  const destino = (Array.isArray(c.para) ? c.para[0] : c.para).replace(/[^a-z0-9@._-]/gi, "_");
  const base = `${sello}__${destino}`;
  const cabecera = `<!-- Para: ${Array.isArray(c.para) ? c.para.join(", ") : c.para} | Asunto: ${c.asunto} -->\n`;
  const archivo = path.join(dir, `${base}.html`);
  await fs.writeFile(archivo, cabecera + c.html, "utf8");
  for (const a of c.adjuntos ?? []) await fs.writeFile(path.join(dir, `${base}__${a.nombre}`), a.contenido);
  return { ok: true, proveedor: "prueba", archivo };
}

export async function enviarCorreo(c: Correo): Promise<ResultadoEnvio> {
  if (modoPrueba()) return guardarPrueba(c);

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;
  try {
    if (gmailUser && gmailPass) {
      const esGmail = gmailUser.toLowerCase().includes("@gmail.com");
      const host = process.env.SMTP_HOST || (!esGmail ? "smtp.hostinger.com" : undefined);
      const port = Number(process.env.SMTP_PORT) || 465;
      const transporte = nodemailer.createTransport(
        host
          ? { host, port, secure: port === 465, auth: { user: gmailUser, pass: gmailPass } }
          : { service: "gmail", auth: { user: gmailUser, pass: gmailPass } }
      );
      await transporte.sendMail({
        from: `"${remitenteNombre}" <${gmailUser}>`,
        to: c.para,
        subject: c.asunto,
        html: c.html,
        text: c.texto,
        attachments: c.adjuntos?.map((a) => ({ filename: a.nombre, content: a.contenido, contentType: a.tipo })),
      });
      return { ok: true, proveedor: "smtp" };
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const { error } = await resend.emails.send({
        from: process.env.CORREO_REMITENTE || `${remitenteNombre} <onboarding@resend.dev>`,
        to: c.para,
        subject: c.asunto,
        html: c.html,
        text: c.texto,
        attachments: c.adjuntos?.map((a) => ({ filename: a.nombre, content: a.contenido })),
      });
      if (error) return { ok: false, proveedor: "resend", error: error.message };
      return { ok: true, proveedor: "resend" };
    }
    return { ok: false, proveedor: "ninguno", error: "No hay proveedor de correo configurado (GMAIL_USER/GMAIL_PASS o RESEND_API_KEY)." };
  } catch (e: any) {
    return { ok: false, proveedor: gmailUser ? "smtp" : "resend", error: e?.message || String(e) };
  }
}

/** URL pública del sitio para los enlaces de los correos. */
export function urlSitio(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://club90minutos.com").replace(/\/$/, "");
}

/** Plantilla base con la marca (correo: estilos en línea, tablas, sin fuentes web obligatorias). */
export function plantillaCorreo({ titulo, cuerpo, cta }: { titulo: string; cuerpo: string; cta?: { texto: string; url: string } }): string {
  const boton = cta
    ? `<tr><td style="padding:8px 0 24px"><a href="${cta.url}" style="display:inline-block;padding:14px 28px;background:#74CC10;color:#04060A;border-radius:999px;font-weight:700;font-size:15px;text-decoration:none">${cta.texto}</a></td></tr>`
    : "";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title></head>
<body style="margin:0;padding:0;background:#04060A;font-family:Inter,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#FFFFFF">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#04060A"><tr><td align="center" style="padding:24px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 0 20px;font-family:Orbitron,'Segoe UI',Arial,sans-serif;font-weight:800;font-size:20px;letter-spacing:1px;color:#FFFFFF">CLUB<span style="color:#74CC10">90</span></td></tr>
<tr><td style="background:#1A1F26;border-radius:10px;padding:24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="font-size:22px;font-weight:700;line-height:1.3;padding:0 0 12px;color:#FFFFFF">${titulo}</td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#E5E7EB">${cuerpo}</td></tr>
${boton}
</table></td></tr>
<tr><td style="padding:16px 4px 0;font-size:12px;line-height:1.5;color:#6B7280">Club 90 Minutos · Polla Liga BetPlay. Recibes este correo porque estás registrado en ${urlSitio().replace(/^https?:\/\//, "")}.</td></tr>
</table></td></tr></table></body></html>`;
}

export const escaparHtml = (s: string) =>
  String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
