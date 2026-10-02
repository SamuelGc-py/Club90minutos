import { NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/auth";
import { correoConfigurado, modoPrueba } from "@/lib/correo";
import { ultimosEnvios } from "@/lib/registroEnvios";
import {
  calcularPendientesDelDia,
  diaBogota,
  enviarRecordatoriosDelDia,
  horaRecordatorio,
  htmlRecordatorio,
  recordatoriosActivos,
  ultimoReporteRecordatorios,
} from "@/lib/recordatorios";
import { aficheAutomaticoActivo, destinatariosAfiche, enviarAficheTabla } from "@/lib/aficheCorreo";
import { generarAficheTabla } from "@/lib/aficheTabla";

export const dynamic = "force-dynamic";

function proveedorConfigurado(): string {
  if (modoPrueba()) return "prueba (se guardan en .correos-prueba, no se envían)";
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) return `smtp (${process.env.GMAIL_USER})`;
  if (process.env.RESEND_API_KEY) return `resend (${process.env.CORREO_REMITENTE || "onboarding@resend.dev"})`;
  return "ninguno";
}

/**
 * Panel de correos automáticos (solo admin).
 * GET ?accion=estado                       → configuración, pendientes de hoy, últimos envíos
 * GET ?accion=vista-recordatorio[&usuario_id=N] → HTML del recordatorio (vista previa, no envía)
 * GET ?accion=afiche                       → PNG del afiche de la tabla (vista previa, no envía)
 * POST { accion: "enviar-recordatorios" } → envía ya los de hoy (respeta "uno por persona y día")
 * POST { accion: "enviar-afiche" }        → envía el afiche actual a los destinatarios
 */
export async function GET(request: Request) {
  const auth = await requerirAdmin(request);
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const accion = url.searchParams.get("accion") || "estado";
  // ?dia=YYYY-MM-DD para revisar otro día (vista previa); por defecto, hoy en Bogotá.
  const diaParam = url.searchParams.get("dia");
  const dia = diaParam && /^\d{4}-\d{2}-\d{2}$/.test(diaParam) ? diaParam : diaBogota();
  const ahoraVista = diaParam ? new Date(`${dia}T09:00:00-05:00`) : new Date();

  try {
    if (accion === "afiche") {
      const png = await generarAficheTabla();
      return new NextResponse(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
    }

    if (accion === "vista-recordatorio") {
      const { pendientes } = await calcularPendientesDelDia(dia, ahoraVista);
      const id = Number(url.searchParams.get("usuario_id"));
      const p =
        pendientes.find((x) => x.usuario_id === id) ??
        pendientes[0] ?? {
          usuario_id: 0,
          nombre: "Participante de ejemplo",
          correo: "ejemplo@correo.com",
          partidos: [
            { id: 0, partido: "Atlético Nacional vs Junior F.C.", hora: "6:10 p. m.", cierre: "5:40 p. m." },
            { id: 0, partido: "Millonarios F.C. vs América de Cali", hora: "8:20 p. m.", cierre: "7:50 p. m." },
          ],
        };
      return new NextResponse(htmlRecordatorio(p).html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    const { partidosDelDia, pendientes } = await calcularPendientesDelDia(dia, ahoraVista);
    return NextResponse.json({
      proveedor: proveedorConfigurado(),
      automaticosHabilitados: correoConfigurado(),
      recordatorios: {
        activos: recordatoriosActivos(),
        hora: `${horaRecordatorio()}:00`,
        hoy: dia,
        partidosDelDia,
        pendientes: pendientes.map((p) => ({ usuario_id: p.usuario_id, nombre: p.nombre, correo: p.correo, faltan: p.partidos.length })),
        ultimoReporte: ultimoReporteRecordatorios,
      },
      afiche: { automatico: aficheAutomaticoActivo(), destinatarios: destinatariosAfiche() },
      ultimosEnvios: await ultimosEnvios(20),
    });
  } catch (e: any) {
    console.error("[correos-automaticos]", e?.message);
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requerirAdmin(request);
  if (auth.error) return auth.error;
  const { accion } = await request.json().catch(() => ({ accion: "" }));
  try {
    if (accion === "enviar-recordatorios") {
      return NextResponse.json({ exito: true, reporte: await enviarRecordatoriosDelDia({ forzarHora: true }) });
    }
    if (accion === "enviar-afiche") {
      const r = await enviarAficheTabla([], { clave: `afiche-manual:${Date.now()}` });
      return NextResponse.json({ exito: r.ok, resultado: r }, { status: r.ok ? 200 : 500 });
    }
    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}
