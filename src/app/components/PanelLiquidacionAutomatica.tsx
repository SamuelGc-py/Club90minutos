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
  noEncontrados?: { partido_id: number; partido: string }[];
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
      const res = await fetch("/api/cron/espn", { method: "POST", cache: "no-store" });
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
    <div style={{ background: "rgba(26, 31, 38, 0.7)", border: "1px solid rgba(67, 138, 255, 0.25)", borderRadius: 16, padding: 16, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#FFFFFF", fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={16} style={{ color: "#438AFF" }} /> Liquidación automática
            <span
              style={{
                fontSize: "0.68rem",
                padding: "2px 8px",
                borderRadius: 999,
                background: activa ? "rgba(116, 204, 16, 0.15)" : "rgba(107, 114, 128, 0.15)",
                color: activa ? "#74CC10" : "var(--text-muted)",
              }}
            >
              {activa === null ? "…" : activa ? "ACTIVA" : "APAGADA"}
            </span>
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.76rem", marginTop: 2 }}>
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
            background: "#438AFF",
            color: "#04060A",
            fontWeight: 800,
            fontSize: "0.82rem",
            cursor: revisando ? "wait" : "pointer",
          }}
        >
          <RefreshCw size={14} className={revisando ? "spin" : ""} /> {revisando ? "Revisando ESPN…" : "Revisar ahora"}
        </button>
      </div>

      {error && <div style={{ color: "#EA3D35", fontSize: "0.8rem", marginTop: 8 }}>{error}</div>}

      {reporte && (
        <div style={{ marginTop: 12, fontSize: "0.8rem" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: 6 }}>
            Última revisión{reporte.fecha ? `: ${new Date(reporte.fecha).toLocaleString("es-CO", { timeZone: "America/Bogota" })}` : ""} ·{" "}
            {reporte.revisados} partido(s) pendientes revisados · {reporte.sinTerminar} aún en juego
          </div>
          {reporte.liquidados.map((x) => (
            <div key={x.partido_id} style={{ color: "#E5E7EB", display: "flex", gap: 6, marginBottom: 4 }}>
              <CheckCircle2 size={14} style={{ color: "#74CC10", flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong style={{ color: "#FFFFFF" }}>{x.partido} {x.marcador}</strong> liquidado — {x.goleadores.join(", ") || "sin goles"}
              </span>
            </div>
          ))}
          {reporte.requierenRevision.map((x) => (
            <div key={x.partido_id} style={{ color: "#EFCC36", display: "flex", gap: 6, marginBottom: 4 }}>
              <AlertTriangle size={14} style={{ color: "#EFCC36", flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong>{x.partido}</strong>: {x.motivo}
              </span>
            </div>
          ))}
          {(reporte.noEncontrados ?? []).map((x) => (
            <div key={`ne-${x.partido_id}`} style={{ color: "#EFCC36", display: "flex", gap: 6, marginBottom: 4 }}>
              <AlertTriangle size={14} style={{ color: "#EFCC36", flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong>{x.partido}</strong>: ya debió terminar pero no aparece en ESPN (¿nombre o fecha distintos?). Cárgalo manualmente.
              </span>
            </div>
          ))}
          {!reporte.liquidados.length && !reporte.requierenRevision.length && !(reporte.noEncontrados ?? []).length && (
            <div style={{ color: "var(--text-muted)" }}>No hay partidos terminados pendientes de liquidar.</div>
          )}
        </div>
      )}
    </div>
  );
}
