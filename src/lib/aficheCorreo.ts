import { correoConfigurado, enviarCorreo, escaparHtml, plantillaCorreo, urlSitio, type ResultadoEnvio } from "@/lib/correo";
import { generarAficheTabla, datosAfiche } from "@/lib/aficheTabla";
import { liberarEnvio, reservarEnvio } from "@/lib/registroEnvios";
import { unirNombres } from "@/app/components/c90/formato";

/**
 * ENVÍO DEL AFICHE DE LA TABLA
 * ============================
 * Tras cada liquidación automática que liquidó al menos un partido, se envía el afiche
 * actualizado (PNG adjunto) a AFICHE_DESTINATARIOS (separados por coma).
 *
 * WhatsApp: enviar imágenes por WhatsApp a un grupo o a una persona requiere la API
 * oficial de WhatsApp Business (cuenta de Meta verificada, número dedicado y plantilla
 * aprobada para mensajes iniciados por el negocio). Mientras no exista, se usa correo.
 */

export const DESTINATARIOS_AFICHE_POR_DEFECTO = "juanhermon24@gmail.com";

export function destinatariosAfiche(): string[] {
  return (process.env.AFICHE_DESTINATARIOS || DESTINATARIOS_AFICHE_POR_DEFECTO)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function aficheAutomaticoActivo(): boolean {
  const v = process.env.AFICHE_AUTOMATICO;
  if (v === "0" || v === "false") return false;
  // Pendiente: sin proveedor de correo configurado en el servidor no se intenta enviar.
  return correoConfigurado();
}

export async function enviarAficheTabla(
  partidos: { partido_id: number; partido: string; marcador: string }[],
  opciones: { clave?: string; para?: string[] } = {}
): Promise<ResultadoEnvio & { omitido?: string }> {
  const para = opciones.para ?? destinatariosAfiche();
  if (!para.length) return { ok: false, proveedor: "ninguno", error: "Sin destinatarios" };

  const clave = opciones.clave ?? `afiche:${partidos.map((p) => p.partido_id).sort((a, b) => a - b).join("-")}`;
  if (!(await reservarEnvio(clave, "afiche", para.join(","), partidos.map((p) => `${p.partido} ${p.marcador}`).join(" | ")))) {
    return { ok: true, proveedor: "ninguno", omitido: "Este afiche ya se había enviado" };
  }

  const resumen = partidos.map((p) => `${p.partido} ${p.marcador.replace("-", " – ")}`);
  const subtitulo =
    partidos.length === 0 ? undefined : partidos.length === 1 ? `Tras ${resumen[0]}` : `Tras ${partidos.length} partidos liquidados`;
  try {
    const [png, datos] = await Promise.all([generarAficheTabla(subtitulo), datosAfiche(subtitulo)]);
    const top = datos.filas.slice(0, 3).map((f) => `${f.posicion}. ${escaparHtml(f.nombre)} · ${f.pts} pts`).join("<br>");
    const cuerpo =
      (resumen.length
        ? `<p style="margin:0 0 12px">Se liquidaron automáticamente:</p>` +
          `<p style="margin:0 0 16px;font-family:'JetBrains Mono',Consolas,monospace;font-size:14px;color:#FFFFFF">${resumen.map(escaparHtml).join("<br>")}</p>`
        : "") +
      `<p style="margin:0 0 8px">Top 3:</p><p style="margin:0 0 16px;color:#FFFFFF">${top}</p>` +
      (datos.ganadorFecha ? `<p style="margin:0 0 16px">Ganador de la fecha ${datos.ganadorFecha.fecha}: <strong style="color:#74CC10">${escaparHtml(unirNombres(datos.ganadorFecha.nombres))}</strong> (${datos.ganadorFecha.pts} pts)</p>` : "") +
      `<p style="margin:0 0 16px">Va adjunto el afiche para compartir en el grupo.</p>`;
    const fecha = new Date().toISOString().slice(0, 10);
    const r = await enviarCorreo({
      para,
      asunto: subtitulo ? `Tabla actualizada · ${subtitulo}` : "Tabla de posiciones · Club 90 Minutos",
      html: plantillaCorreo({ titulo: "Tabla de posiciones actualizada", cuerpo, cta: { texto: "Ver ranking", url: `${urlSitio()}/dashboard` } }),
      adjuntos: [{ nombre: `tabla-club90-${fecha}.png`, contenido: png, tipo: "image/png" }],
    });
    if (!r.ok) await liberarEnvio(clave);
    return r;
  } catch (e: any) {
    await liberarEnvio(clave);
    return { ok: false, proveedor: "ninguno", error: e?.message || String(e) };
  }
}
