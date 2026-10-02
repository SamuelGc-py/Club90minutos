"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, AlertTriangle } from "lucide-react";

/**
 * "Mis Resultados y Puntos": fusiona las antiguas pestañas "Partidos Terminados" y
 * "Tus Puntuaciones". Muestra TODOS los partidos finalizados del torneo, ordenados por
 * fecha (más reciente primero), con el marcador oficial, el pronóstico del participante
 * y los puntos que obtuvo en cada uno. Fuente: /api/historial-puntos.
 */

interface Partido {
  partido_id: number;
  jornada: number;
  fecha: string;
  equipo_local: string;
  equipo_visitante: string;
  escudo_local: string | null;
  escudo_visitante: string | null;
  marcador_real: string;
  pronosticado: boolean;
  marcador_predicho: string | null;
  goleador_predicho: string | null;
  goleadores_reales: string[];
  sin_goleadores_registrados: boolean;
  puntos_resultado_exacto: number;
  puntos_ganador_partido: number;
  puntos_goleador: number;
  puntos_total: number;
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
    partidos_pronosticados?: number;
    partidos_con_puntos: number;
  };
  partidos: Partido[];
  ajustes: { categoria: string; puntos: number; motivo: string }[];
}

type Filtro = "todos" | "sume" | "exactos" | "goleador" | "sin_pronostico";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "sume", label: "Donde sumé" },
  { id: "exactos", label: "Marcador exacto" },
  { id: "goleador", label: "Goleador" },
  { id: "sin_pronostico", label: "Sin pronóstico" },
];

const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Bogota",
  });

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" });

export default function MisResultadosView({ usuarioId }: { usuarioId: number }) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await fetch(`/api/historial-puntos?usuario_id=${usuarioId}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || json.error) setError(json.error || "No se pudieron cargar tus resultados.");
      else setDatos(json);
    } catch (e: any) {
      setError("Error de conexión: " + e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  const visibles = useMemo(() => {
    const ps = datos?.partidos ?? [];
    switch (filtro) {
      case "sume":
        return ps.filter((p) => p.puntos_total > 0);
      case "exactos":
        return ps.filter((p) => p.puntos_resultado_exacto > 0);
      case "goleador":
        return ps.filter((p) => p.puntos_goleador > 0);
      case "sin_pronostico":
        return ps.filter((p) => !p.pronosticado);
      default:
        return ps;
    }
  }, [datos, filtro]);

  // Agrupar por día (en hora de Colombia), manteniendo el orden más reciente primero
  const grupos = useMemo(() => {
    const out: { dia: string; partidos: Partido[] }[] = [];
    for (const p of visibles) {
      const dia = fechaLarga(p.fecha);
      const ultimo = out[out.length - 1];
      if (ultimo && ultimo.dia === dia) ultimo.partidos.push(p);
      else out.push({ dia, partidos: [p] });
    }
    return out;
  }, [visibles]);

  if (cargando && !datos) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40 }}>
        <RefreshCw className="spin" size={30} style={{ color: "#438AFF" }} />
        <div style={{ marginTop: 10, color: "var(--graderia)" }}>Cargando tus resultados…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 30 }}>
        <p style={{ color: "#EA3D35", marginBottom: 14 }}>{error}</p>
        <button className="btn btn-primary" onClick={cargar}>Reintentar</button>
      </div>
    );
  }

  if (!datos) return null;
  const r = datos.resumen;
  const efectividad = r.partidos_pronosticados
    ? Math.round((r.partidos_con_puntos / r.partidos_pronosticados) * 100)
    : 0;

  return (
    <div>
      {/* Encabezado + resumen */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0 }}>Mis Resultados y Puntos</h2>
            <p style={{ color: "var(--graderia)", margin: "4px 0 0", fontSize: "0.85rem" }}>
              Todos los partidos finalizados, del más reciente al más antiguo, con lo que pronosticaste y lo que sumaste.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={cargar} title="Actualizar" style={{ padding: "8px 12px" }}>
              <RefreshCw size={15} className={cargando ? "spin" : ""} />
            </button>
            <a
              href={`/api/historial-puntos?usuario_id=${usuarioId}&formato=excel`}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", textDecoration: "none" }}
            >
              <Download size={15} /> Excel
            </a>
          </div>
        </div>

        <div className="mis-resultados-kpis">
          <Kpi label="Puntos totales" valor={r.puntos_total} color="var(--trofeo)" grande />
          <Kpi label="Marcador exacto" valor={r.puntos_resultado_exacto} color="#438AFF" />
          <Kpi label="Ganador / empate" valor={r.puntos_ganador_partido} color="var(--cancha)" />
          <Kpi label="Goleadores" valor={r.puntos_goleador} color="#438AFF" />
          <Kpi
            label="Partidos con puntos"
            valor={`${r.partidos_con_puntos}/${r.partidos_pronosticados ?? r.partidos_evaluados}`}
            sub={`${efectividad}% de efectividad`}
            color="#6B7280"
          />
        </div>

        {datos.ajustes.length > 0 && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(239, 204, 54, 0.08)",
              border: "1px solid rgba(239, 204, 54, 0.3)",
              fontSize: "0.78rem",
              color: "#E5E7EB",
            }}
          >
            <strong style={{ color: "var(--trofeo)" }}>Ajustes de homologación: </strong>
            {datos.ajustes.map((a, i) => (
              <span key={i}>
                {i > 0 && " · "}
                {a.puntos > 0 ? "+" : ""}
                {a.puntos} pts ({a.categoria})
              </span>
            ))}
            <div style={{ color: "var(--text-muted)", marginTop: 2 }}>{datos.ajustes[0].motivo}. No corresponden a un partido puntual.</div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: `1px solid ${filtro === f.id ? "var(--cancha)" : "rgba(255,255,255,0.12)"}`,
              background: filtro === f.id ? "rgba(116, 204, 16, 0.15)" : "transparent",
              color: filtro === f.id ? "#FFFFFF" : "var(--text-muted)",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Listado por día */}
      {grupos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 20px", color: "var(--graderia)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12 }}>
          No hay partidos para este filtro.
        </div>
      ) : (
        grupos.map((g) => (
          <div key={g.dia} style={{ marginBottom: 18 }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px 2px" }}>
              {g.dia}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {g.partidos.map((p) => (
                <FilaPartido key={p.partido_id} p={p} />
              ))}
            </div>
          </div>
        ))
      )}

      <style>{`
        .mis-resultados-kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 14px; }
        @media (max-width: 760px) { .mis-resultados-kpis { grid-template-columns: repeat(2, 1fr); } }
        .mr-fila { display: grid; grid-template-columns: 1fr auto 1fr auto; align-items: center; gap: 10px; }
        @media (max-width: 560px) { .mr-fila { grid-template-columns: 1fr auto 1fr; } .mr-puntos { grid-column: 1 / -1; justify-self: end; } }
      `}</style>
    </div>
  );
}

function Kpi({ label, valor, color, sub, grande }: { label: string; valor: number | string; color: string; sub?: string; grande?: boolean }) {
  return (
    <div style={{ background: "rgba(26, 31, 38, 0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 12px", gridColumn: grande ? "span 1" : undefined }}>
      <div style={{ color, fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: "#FFFFFF", fontSize: grande ? "1.6rem" : "1.3rem", fontWeight: 900, lineHeight: 1.15 }}>{valor}</div>
      {sub && <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>{sub}</div>}
    </div>
  );
}

function Escudo({ url, nombre }: { url: string | null; nombre: string }) {
  return url ? (
    <img src={url} alt="" style={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }} />
  ) : (
    <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#1A1F26", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", flexShrink: 0 }}>
      {nombre.charAt(0)}
    </span>
  );
}

function FilaPartido({ p }: { p: Partido }) {
  const sumo = p.puntos_total > 0;
  return (
    <div
      style={{
        background: "rgba(26, 31, 38, 0.6)",
        border: `1px solid ${sumo ? "rgba(116, 204, 16, 0.35)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14,
        padding: "12px 14px",
        opacity: p.pronosticado ? 1 : 0.7,
      }}
    >
      <div className="mr-fila">
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", textAlign: "right", minWidth: 0 }}>
          <span style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "0.88rem" }}>{p.equipo_local}</span>
          <Escudo url={p.escudo_local} nombre={p.equipo_local} />
        </div>

        <div style={{ textAlign: "center", minWidth: 74 }}>
          <div style={{ color: "#FFFFFF", fontSize: "1.35rem", fontWeight: 900, letterSpacing: "0.04em" }}>{p.marcador_real}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.64rem", fontWeight: 700 }}>
            F{p.jornada} · {hora(p.fecha)}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Escudo url={p.escudo_visitante} nombre={p.equipo_visitante} />
          <span style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "0.88rem" }}>{p.equipo_visitante}</span>
        </div>

        <div className="mr-puntos" style={{ textAlign: "right", minWidth: 70 }}>
          <div style={{ fontSize: "1.35rem", fontWeight: 900, color: sumo ? "var(--cancha)" : "var(--line-strong)", lineHeight: 1 }}>
            +{p.puntos_total}
            <span style={{ fontSize: "0.66rem", marginLeft: 2 }}>pts</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ color: "#E5E7EB", fontSize: "0.76rem" }}>
          {p.pronosticado ? (
            <>
              Tu pronóstico: <strong style={{ color: "#FFFFFF" }}>{p.marcador_predicho}</strong>
              {"  ·  "}Goleador: {p.goleador_predicho ?? "(ninguno)"}
            </>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>No pronosticaste este partido</span>
          )}
          <div style={{ color: "var(--text-muted)", marginTop: 2 }}>
            Anotaron: {p.goleadores_reales.join(", ") || (p.sin_goleadores_registrados ? "sin goleadores registrados" : "nadie (0-0)")}
          </div>
          {p.sin_goleadores_registrados && (
            <div style={{ color: "#EFCC36", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <AlertTriangle size={11} /> Sin goleadores oficiales registrados en este partido
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-start", flexWrap: "wrap" }}>
          {p.puntos_ganador_partido > 0 && <Chip color="#74CC10">Ganador +{p.puntos_ganador_partido}</Chip>}
          {p.puntos_resultado_exacto > 0 && <Chip color="#438AFF">Exacto +{p.puntos_resultado_exacto}</Chip>}
          {p.puntos_goleador > 0 && <Chip color="#438AFF">Goleador +{p.puntos_goleador}</Chip>}
        </div>
      </div>
    </div>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ background: `${color}22`, color, border: `1px solid ${color}55`, borderRadius: 999, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 800, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}
