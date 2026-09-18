"use client";

import { useEffect, useState } from "react";
import { X, Download, Trophy, Target, Goal, AlertTriangle, Loader2 } from "lucide-react";

/**
 * Historial de puntos del participante, partido por partido.
 *
 * Transparencia: cada quien puede auditar de dónde salió cada punto suyo — qué pronosticó,
 * qué pasó realmente y cuánto sumó por cada concepto. Los ajustes de homologación se
 * muestran aparte y con su motivo, nunca disfrazados de acierto.
 */

interface PartidoHistorial {
  partido_id: number;
  jornada: number;
  fecha: string;
  equipo_local: string;
  equipo_visitante: string;
  escudo_local: string | null;
  escudo_visitante: string | null;
  marcador_real: string;
  marcador_predicho: string;
  goleador_predicho: string | null;
  goleadores_reales: string[];
  sin_goleadores_registrados: boolean;
  puntos_resultado_exacto: number;
  puntos_ganador_partido: number;
  puntos_goleador: number;
  puntos_total: number;
  detalle: string[];
}

interface Ajuste {
  categoria: string;
  puntos: number;
  motivo: string;
}

interface Datos {
  usuario: { id: number; nombre_completo: string };
  resumen: {
    puntos_resultado_exacto: number;
    puntos_ganador_partido: number;
    puntos_goleador: number;
    puntos_ajustes: number;
    puntos_total: number;
    partidos_evaluados: number;
    partidos_con_puntos: number;
  };
  partidos: PartidoHistorial[];
  ajustes: Ajuste[];
}

export default function HistorialPuntosModal({
  usuarioId,
  nombreUsuario,
  onClose,
}: {
  usuarioId: number;
  nombreUsuario?: string;
  onClose: () => void;
}) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soloConPuntos, setSoloConPuntos] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        setCargando(true);
        const res = await fetch(`/api/historial-puntos?usuario_id=${usuarioId}`);
        const json = await res.json();
        if (!activo) return;
        if (!res.ok || json.error) setError(json.error || "No se pudo cargar el historial.");
        else setDatos(json);
      } catch (e: any) {
        if (activo) setError("Error de conexión: " + e.message);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [usuarioId]);

  const partidosVisibles = datos
    ? soloConPuntos
      ? datos.partidos.filter((p) => p.puntos_total > 0)
      : datos.partidos
    : [];

  const Kpi = ({ icon, label, valor, color }: { icon: React.ReactNode; label: string; valor: number; color: string }) => (
    <div
      style={{
        flex: "1 1 120px",
        background: "rgba(15,23,42,0.75)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "12px 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, color, fontSize: "0.72rem", fontWeight: 800 }}>
        {icon}
        {label}
      </div>
      <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1.2 }}>{valor}</div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 1000,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--noche, #0f172a)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 30px 70px -20px rgba(0,0,0,0.8)",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "1.15rem", fontWeight: 900 }}>
              📊 Historial de puntos
            </h2>
            <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "0.8rem" }}>
              {datos?.usuario.nombre_completo || nombreUsuario || "Participante"} · de dónde salió cada punto
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a
              href={`/api/historial-puntos?usuario_id=${usuarioId}&formato=excel`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--cancha, #1db954)",
                color: "#04060A",
                fontWeight: 800,
                fontSize: "0.8rem",
                padding: "8px 14px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              <Download size={15} /> Exportar Excel
            </a>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "none",
                color: "#fff",
                width: 34,
                height: 34,
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div style={{ overflowY: "auto", padding: 16 }}>
          {cargando && (
            <div style={{ padding: 50, textAlign: "center", color: "#94a3b8" }}>
              <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
              <div style={{ marginTop: 10 }}>Cargando tu historial...</div>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: 18,
                borderRadius: 12,
                background: "rgba(255,92,92,0.1)",
                border: "1px solid rgba(255,92,92,0.35)",
                color: "#ff9d9d",
              }}
            >
              {error}
            </div>
          )}

          {datos && !cargando && (
            <>
              {/* KPIs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                <Kpi icon={<Trophy size={13} />} label="TOTAL" valor={datos.resumen.puntos_total} color="var(--trofeo, #ffc533)" />
                <Kpi icon={<Target size={13} />} label="MARCADOR EXACTO" valor={datos.resumen.puntos_resultado_exacto} color="#4da3ff" />
                <Kpi icon={<Trophy size={13} />} label="GANADOR" valor={datos.resumen.puntos_ganador_partido} color="var(--cancha, #1db954)" />
                <Kpi icon={<Goal size={13} />} label="GOLEADORES" valor={datos.resumen.puntos_goleador} color="#c084fc" />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 10,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                  {datos.resumen.partidos_evaluados} partidos evaluados · sumaste en {datos.resumen.partidos_con_puntos}
                </span>
                <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#cbd5e1", fontSize: "0.8rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={soloConPuntos} onChange={(e) => setSoloConPuntos(e.target.checked)} />
                  Ver solo donde sumé
                </label>
              </div>

              {/* Ajustes de homologación */}
              {datos.ajustes.length > 0 && (
                <div
                  style={{
                    marginBottom: 14,
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(255,197,51,0.08)",
                    border: "1px solid rgba(255,197,51,0.3)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--trofeo, #ffc533)", fontWeight: 800, fontSize: "0.82rem" }}>
                    <AlertTriangle size={14} /> Ajustes de homologación
                  </div>
                  {datos.ajustes.map((a, i) => (
                    <div key={i} style={{ color: "#e2e8f0", fontSize: "0.78rem", marginTop: 6 }}>
                      <strong>{a.puntos > 0 ? `+${a.puntos}` : a.puntos} pts</strong> ({a.categoria}) — {a.motivo}
                    </div>
                  ))}
                </div>
              )}

              {/* Listado de partidos */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {partidosVisibles.map((p) => {
                  const sumo = p.puntos_total > 0;
                  return (
                    <div
                      key={p.partido_id}
                      style={{
                        background: "rgba(15,23,42,0.6)",
                        border: `1px solid ${sumo ? "rgba(29,185,84,0.3)" : "rgba(255,255,255,0.06)"}`,
                        borderRadius: 14,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 220, flex: 1 }}>
                          <div style={{ color: "#64748b", fontSize: "0.68rem", fontWeight: 700, marginBottom: 2 }}>
                            FECHA {p.jornada} · {new Date(p.fecha).toLocaleDateString("es-CO")}
                          </div>
                          <div style={{ color: "#fff", fontWeight: 800, fontSize: "0.92rem" }}>
                            {p.equipo_local} vs {p.equipo_visitante}
                          </div>
                          <div style={{ color: "#cbd5e1", fontSize: "0.78rem", marginTop: 4 }}>
                            Real: <strong style={{ color: "#fff" }}>{p.marcador_real}</strong>
                            {"  ·  "}Tu pronóstico: <strong style={{ color: "#fff" }}>{p.marcador_predicho}</strong>
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: 2 }}>
                            Tu goleador: {p.goleador_predicho ?? "(ninguno)"}
                            {"  ·  "}Anotaron: {p.goleadores_reales.join(", ") || "(sin goles)"}
                          </div>
                          {p.sin_goleadores_registrados && (
                            <div style={{ color: "#ffc533", fontSize: "0.72rem", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                              <AlertTriangle size={12} /> Sin goleadores oficiales registrados en este partido
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: "right", minWidth: 130 }}>
                          <div
                            style={{
                              fontSize: "1.5rem",
                              fontWeight: 900,
                              color: sumo ? "var(--cancha, #1db954)" : "#475569",
                              lineHeight: 1,
                            }}
                          >
                            {p.puntos_total}
                            <span style={{ fontSize: "0.7rem", marginLeft: 3 }}>pts</span>
                          </div>
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 6, flexWrap: "wrap" }}>
                            {p.puntos_ganador_partido > 0 && <Chip color="#1db954">Ganador +{p.puntos_ganador_partido}</Chip>}
                            {p.puntos_resultado_exacto > 0 && <Chip color="#4da3ff">Exacto +{p.puntos_resultado_exacto}</Chip>}
                            {p.puntos_goleador > 0 && <Chip color="#c084fc">Goleador +{p.puntos_goleador}</Chip>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {partidosVisibles.length === 0 && (
                  <div style={{ padding: 34, textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                    No hay partidos que mostrar todavía.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`,
        borderRadius: 999,
        padding: "2px 8px",
        fontSize: "0.68rem",
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
