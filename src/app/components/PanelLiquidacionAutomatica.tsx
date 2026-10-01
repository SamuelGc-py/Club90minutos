"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Reporte {
  fecha?: string;
  revisados: number;
  liquidados: { partido_id: number; partido: string; marcador: string; goleadores: string[] }[];
  requierenRevision: { partido_id: number; partido: string; motivo: string }[];
  sinTerminar: number;
  sinEventoEspn: number;
}

/**
 * Estado de la liquidación automática para el administrador: qué se liquidó solo
 * y qué partidos terminados necesitan carga manual (ver src/lib/liquidacionAutomatica.ts).
 */
export default function PanelLiquidacionAutomatica({ onLiquidado }: { onLiquidado?: () => void }) {
  const [activa, setActiva] = useState<boolean | null>(null);
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [revisando, setRevisando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/liquidacion-automatica", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setActiva(!!d.activa);
        if (d.ultimoReporte) setReporte(d.ultimoReporte);
      })
      .catch(() => {});
  }, []);

  const revisarAhora = async () => {
    setRevisando(true);
    setError(null);
    try {
      const res = await fetch("/api/cron/espn", { cache: "no-store" });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "No se pudo revisar");
      setReporte({ ...d.reporte, fecha: new Date().toISOString() });
      if (d.reporte?.liquidados?.length) onLiquidado?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRevisando(false);
    }
  };

  return (
    <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 16, padding: 16, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={16} style={{ color: "#38bdf8" }} /> Liquidación automática
            <span
              style={{
                fontSize: "0.68rem",
                padding: "2px 8px",
                borderRadius: 999,
                background: activa ? "rgba(29,185,84,0.15)" : "rgba(148,163,184,0.15)",
                color: activa ? "#1db954" : "#94a3b8",
              }}
            >
              {activa === null ? "…" : activa ? "ACTIVA" : "APAGADA"}
            </span>
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.76rem", marginTop: 2 }}>
            Cuando ESPN da un partido por terminado, se cargan marcador y goleadores y se liquidan los puntos (revisa cada 10
            min). Si un goleador no se puede identificar con certeza, el partido queda aquí para carga manual.
          </div>
        </div>
        <button
          onClick={revisarAhora}
          disabled={revisando}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 14px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "0.82rem",
            cursor: revisando ? "wait" : "pointer",
          }}
        >
          <RefreshCw size={14} className={revisando ? "spin" : ""} /> {revisando ? "Revisando ESPN…" : "Revisar ahora"}
        </button>
      </div>

      {error && <div style={{ color: "#ff9d9d", fontSize: "0.8rem", marginTop: 8 }}>{error}</div>}

      {reporte && (
        <div style={{ marginTop: 12, fontSize: "0.8rem" }}>
          <div style={{ color: "#64748b", marginBottom: 6 }}>
            Última revisión{reporte.fecha ? `: ${new Date(reporte.fecha).toLocaleString("es-CO", { timeZone: "America/Bogota" })}` : ""} ·{" "}
            {reporte.revisados} partido(s) pendientes revisados · {reporte.sinTerminar} aún en juego
          </div>
          {reporte.liquidados.map((x) => (
            <div key={x.partido_id} style={{ color: "#cbd5e1", display: "flex", gap: 6, marginBottom: 4 }}>
              <CheckCircle2 size={14} style={{ color: "#1db954", flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong style={{ color: "#fff" }}>{x.partido} {x.marcador}</strong> liquidado — {x.goleadores.join(", ") || "sin goles"}
              </span>
            </div>
          ))}
          {reporte.requierenRevision.map((x) => (
            <div key={x.partido_id} style={{ color: "#fde68a", display: "flex", gap: 6, marginBottom: 4 }}>
              <AlertTriangle size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong>{x.partido}</strong>: {x.motivo}
              </span>
            </div>
          ))}
          {!reporte.liquidados.length && !reporte.requierenRevision.length && (
            <div style={{ color: "#94a3b8" }}>No hay partidos terminados pendientes de liquidar.</div>
          )}
        </div>
      )}
    </div>
  );
}
