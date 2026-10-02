"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, RefreshCw, Image as ImageIcon, Send } from "lucide-react";

interface Estado {
  proveedor: string;
  automaticosHabilitados: boolean;
  recordatorios: {
    activos: boolean;
    hora: string;
    hoy: string;
    partidosDelDia: number;
    pendientes: { usuario_id: number; nombre: string; correo: string; faltan: number }[];
    ultimoReporte: any;
  };
  afiche: { automatico: boolean; destinatarios: string[] };
  ultimosEnvios: { clave: string; tipo: string; destinatario: string | null; detalle: string | null; creado_en: string }[];
}

/**
 * Correos automáticos (admin): recordatorio diario de pronósticos y afiche de la tabla.
 * Vista previa sin enviar y envío manual. Ver src/lib/recordatorios.ts y src/lib/aficheCorreo.ts.
 */
export default function PanelCorreosAutomaticos() {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [verAfiche, setVerAfiche] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await fetch("/api/admin/correos-automaticos?accion=estado", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Error");
      setEstado(d);
    } catch (e: any) {
      setMensaje({ tipo: "error", texto: e.message });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const enviar = async (accion: "enviar-recordatorios" | "enviar-afiche") => {
    setEnviando(accion);
    setMensaje(null);
    try {
      const r = await fetch("/api/admin/correos-automaticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || d.resultado?.error || "No se pudo enviar");
      if (accion === "enviar-afiche") setMensaje({ tipo: "ok", texto: `Afiche enviado (${d.resultado.proveedor}).` });
      else {
        const rep = d.reporte;
        setMensaje({
          tipo: rep.fallidos?.length ? "error" : "ok",
          texto: `Recordatorios: ${rep.enviados} enviados, ${rep.yaEnviados} ya enviados hoy${rep.fallidos?.length ? `, ${rep.fallidos.length} fallidos (${rep.fallidos[0].error})` : ""}${rep.omitido ? ` · ${rep.omitido}` : ""}.`,
        });
      }
      cargar();
    } catch (e: any) {
      setMensaje({ tipo: "error", texto: e.message });
    } finally {
      setEnviando(null);
    }
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--s-3)", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.125rem", display: "flex", alignItems: "center", gap: 8 }}>
            <Mail size={18} /> Correos automáticos
          </h3>
          <p className="caption" style={{ margin: "4px 0 0" }}>
            Proveedor: <span className="num">{estado?.proveedor ?? "…"}</span>
          </p>
          {estado && !estado.automaticosHabilitados && (
            <p className="caption" style={{ margin: "4px 0 0", color: "var(--state-warn)", maxWidth: "68ch" }}>
              Recordatorio a todos: pendiente. Para activarlo hay que configurar en el servidor un proveedor
              (GMAIL_USER y GMAIL_PASS, o Resend con dominio verificado) y CORREOS_AUTOMATICOS=1. La vista previa sí funciona.
            </p>
          )}
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={cargar} disabled={cargando}>
          <RefreshCw size={14} className={cargando ? "spin" : ""} /> Actualizar
        </button>
      </div>

      {mensaje && (
        <div className={`badge ${mensaje.tipo === "ok" ? "badge-ok" : "badge-error"}`} style={{ whiteSpace: "normal", padding: "8px 12px", fontSize: "0.8125rem" }}>
          {mensaje.texto}
        </div>
      )}

      {estado && (
        <>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
            <h4 style={{ margin: 0 }}>Recordatorio diario · {estado.recordatorios.hora}</h4>
            <p className="caption" style={{ margin: 0 }}>
              {estado.recordatorios.activos ? "Activo" : "Apagado"} · Hoy ({estado.recordatorios.hoy}): {estado.recordatorios.partidosDelDia} partido(s).{" "}
              {estado.recordatorios.pendientes.length
                ? `${estado.recordatorios.pendientes.length} persona(s) con pronósticos pendientes en partidos aún abiertos.`
                : "Nadie tiene pendientes en partidos abiertos de hoy."}
            </p>
            {estado.recordatorios.pendientes.length > 0 && (
              <div style={{ maxHeight: 160, overflowY: "auto", fontSize: "0.8125rem", color: "var(--text-2)" }}>
                {estado.recordatorios.pendientes.map((p) => (
                  <div key={p.usuario_id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "4px 0", borderBottom: "1px solid var(--line)" }}>
                    <span>{p.nombre}</span>
                    <span className="num">{p.faltan} pendiente(s)</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
              <a className="btn btn-text btn-sm" href="/api/admin/correos-automaticos?accion=vista-recordatorio" target="_blank" rel="noreferrer">
                Ver cómo se ve el correo
              </a>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => enviar("enviar-recordatorios")} disabled={!!enviando || !estado.automaticosHabilitados}>
                <Send size={14} /> {enviando === "enviar-recordatorios" ? "Enviando…" : "Enviar los de hoy ahora"}
              </button>
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
            <h4 style={{ margin: 0 }}>Afiche de la tabla tras cada liquidación</h4>
            <p className="caption" style={{ margin: 0 }}>
              {estado.afiche.automatico ? "Automático" : "Apagado"} · Destino: {estado.afiche.destinatarios.join(", ") || "sin destinatarios"}
            </p>
            <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-text btn-sm" onClick={() => setVerAfiche((v) => !v)}>
                <ImageIcon size={14} /> {verAfiche ? "Ocultar afiche" : "Ver afiche actual"}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => enviar("enviar-afiche")} disabled={!!enviando || !estado.afiche.automatico}>
                <Send size={14} /> {enviando === "enviar-afiche" ? "Enviando…" : "Enviar afiche ahora"}
              </button>
            </div>
            {verAfiche && (
              <img
                src={`/api/admin/correos-automaticos?accion=afiche&t=${Date.now()}`}
                alt="Afiche de la tabla de posiciones"
                style={{ width: "100%", maxWidth: 420, borderRadius: "var(--r-ctl)", border: "1px solid var(--line)" }}
              />
            )}
          </section>

          {estado.ultimosEnvios.length > 0 && (
            <section style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
              <h4 style={{ margin: 0 }}>Últimos envíos</h4>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-2)", maxHeight: 200, overflowY: "auto" }}>
                {estado.ultimosEnvios.map((e) => (
                  <div key={e.clave} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "4px 0", borderBottom: "1px solid var(--line)" }}>
                    <span>
                      {e.tipo === "afiche" ? "Afiche" : "Recordatorio"} → {e.destinatario}
                    </span>
                    <span className="num" style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(e.creado_en).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
