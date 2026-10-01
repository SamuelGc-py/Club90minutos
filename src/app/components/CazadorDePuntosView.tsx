"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, TrendingUp, Info } from "lucide-react";
import CentralDatosView from "./CentralDatosView";

/**
 * "Cazador de Puntos" — fusiona las antiguas pestañas "Cazador de Puntos" y
 * "Recomendaciones y Datos":
 *   1. Recomendaciones para los próximos partidos de la polla, calculadas con datos
 *      reales (posición, puntos por partido, racha de últimos 5, goles a favor/en contra).
 *   2. Tabla de posiciones de la Liga BetPlay con la racha de cada equipo (fuente: ESPN).
 *   3. El asistente de IA, para preguntas libres.
 */

interface Forma {
  resultado: "G" | "E" | "P";
  rival: string;
  marcador: string;
  local: boolean;
  fecha: string;
}

interface Equipo {
  posicion: number;
  espn_id: string;
  equipo_id: number | null;
  nombre: string;
  abreviatura: string;
  logo: string | null;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  forma: Forma[];
}

interface Tabla {
  torneo: string;
  actualizado: string;
  equipos: Equipo[];
}

const COLOR_FORMA = { G: "#1db954", E: "#94a3b8", P: "#ef4444" } as const;

function Racha({ forma }: { forma: Forma[] }) {
  if (!forma.length) return <span style={{ color: "#475569", fontSize: "0.72rem" }}>—</span>;
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {forma.map((f, i) => (
        <span
          key={i}
          title={`${f.local ? "vs" : "en casa de"} ${f.rival}: ${f.marcador} (${new Date(f.fecha).toLocaleDateString("es-CO")})`}
          style={{
            width: 19,
            height: 19,
            borderRadius: 5,
            background: COLOR_FORMA[f.resultado],
            color: "#04060A",
            fontSize: "0.62rem",
            fontWeight: 900,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {f.resultado}
        </span>
      ))}
    </span>
  );
}

/** Índice de fuerza: puntos por partido (temporada) combinado con la racha reciente. */
function indice(e: Equipo) {
  const ppg = e.pj ? e.pts / e.pj : 0;
  const formaPts = e.forma.length
    ? e.forma.reduce((a, f) => a + (f.resultado === "G" ? 3 : f.resultado === "E" ? 1 : 0), 0) / e.forma.length
    : ppg;
  return ppg * 0.6 + formaPts * 0.4;
}

function recomendar(local: Equipo, visita: Equipo) {
  const VENTAJA_LOCAL = 0.3;
  const dif = indice(local) + VENTAJA_LOCAL - indice(visita);
  // Goles esperados: ataque propio contra defensa rival (promedios por partido)
  const pj = (e: Equipo) => Math.max(e.pj, 1);
  const golesLocal = (local.gf / pj(local) + visita.gc / pj(visita)) / 2 + 0.15;
  const golesVisita = (visita.gf / pj(visita) + local.gc / pj(local)) / 2;
  let gl = Math.round(golesLocal);
  let gv = Math.round(golesVisita);

  let veredicto: string;
  let favorito: "local" | "visita" | "parejo";
  if (Math.abs(dif) < 0.35) {
    favorito = "parejo";
    veredicto = "Partido parejo: el empate es una opción seria.";
    const g = Math.round((golesLocal + golesVisita) / 2);
    gl = g;
    gv = g;
  } else if (dif > 0) {
    favorito = "local";
    veredicto = `Ligero favorito: ${local.nombre}${dif > 0.9 ? " (claro favorito)" : ""}.`;
    if (gl <= gv) gl = gv + 1;
  } else {
    favorito = "visita";
    veredicto = `Ligero favorito: ${visita.nombre}${dif < -0.9 ? " (claro favorito)" : ""}.`;
    if (gv <= gl) gv = gl + 1;
  }

  const confianza = Math.min(95, Math.round(50 + Math.abs(dif) * 25));
  return { favorito, veredicto, marcador: `${gl}-${gv}`, confianza };
}

export default function CazadorDePuntosView({ partidos }: { partidos: any[] }) {
  const [tabla, setTabla] = useState<Tabla | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verAsistente, setVerAsistente] = useState(false);

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await fetch("/api/liga/tabla", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || json.error) setError(json.error || "No se pudo cargar la tabla de la liga.");
      else setTabla(json);
    } catch (e: any) {
      setError("Error de conexión: " + e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const porEquipoId = useMemo(() => {
    const m = new Map<number, Equipo>();
    for (const e of tabla?.equipos ?? []) if (e.equipo_id) m.set(e.equipo_id, e);
    return m;
  }, [tabla]);

  // Próximos partidos de la polla que aún no se juegan
  const proximos = useMemo(() => {
    const ahora = Date.now() - 2 * 60 * 60 * 1000;
    return (partidos ?? [])
      .filter((p) => !p.resultado_oficial && p.estado !== "aplazado" && new Date(p.fecha_hora_partido).getTime() >= ahora)
      .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime())
      .slice(0, 10);
  }, [partidos]);

  const fechaCorta = (iso: string) =>
    new Date(iso).toLocaleString("es-CO", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Bogota",
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Encabezado */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0 }}>🔮 Cazador de Puntos</h2>
            <p style={{ color: "var(--graderia)", margin: "4px 0 0", fontSize: "0.85rem" }}>
              Recomendaciones para tus pronósticos, tabla de la Liga BetPlay y racha de cada equipo.
            </p>
          </div>
          <button className="btn" onClick={cargar} title="Actualizar" style={{ padding: "8px 12px" }}>
            <RefreshCw size={15} className={cargando ? "spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ textAlign: "center", color: "#ff9d9d" }}>
          {error}{" "}
          <button className="btn btn-primary" onClick={cargar} style={{ marginLeft: 8 }}>
            Reintentar
          </button>
        </div>
      )}

      {cargando && !tabla && (
        <div className="card" style={{ textAlign: "center", padding: 36 }}>
          <RefreshCw className="spin" size={28} style={{ color: "#38bdf8" }} />
          <div style={{ marginTop: 8, color: "var(--graderia)" }}>Consultando la liga…</div>
        </div>
      )}

      {/* 1. RECOMENDACIONES */}
      {tabla && (
        <div className="card">
          <h3 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} style={{ color: "var(--cancha)" }} /> Recomendaciones para los próximos partidos
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.76rem", margin: "0 0 12px", display: "flex", gap: 6 }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} />
            Calculadas con puntos por partido, racha de los últimos 5, goles a favor y en contra, y ventaja de local. Son
            una orientación estadística, no una garantía.
          </p>

          {proximos.length === 0 ? (
            <div style={{ color: "var(--graderia)", fontSize: "0.85rem", padding: 12 }}>
              No hay partidos próximos pendientes en la polla.
            </div>
          ) : (
            <div className="cazador-grid">
              {proximos.map((p) => {
                const l = porEquipoId.get(p.equipo_local_id);
                const v = porEquipoId.get(p.equipo_visitante_id);
                const rec = l && v ? recomendar(l, v) : null;
                return (
                  <div key={p.id} className="cazador-partido">
                    <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, marginBottom: 8 }}>
                      Fecha {p.jornada} · {fechaCorta(p.fecha_hora_partido)}
                    </div>
                    {[
                      { lado: "local", eq: l, nombre: p.equipo_local?.nombre, escudo: p.equipo_local?.escudo_url },
                      { lado: "visita", eq: v, nombre: p.equipo_visitante?.nombre, escudo: p.equipo_visitante?.escudo_url },
                    ].map((x) => (
                      <div
                        key={x.lado}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 0",
                          fontWeight: rec?.favorito === x.lado ? 900 : 600,
                        }}
                      >
                        {x.escudo ? (
                          <img src={x.escudo} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
                        ) : (
                          <span style={{ width: 24 }} />
                        )}
                        <span style={{ color: "#fff", fontSize: "0.86rem", flex: 1, minWidth: 0 }}>
                          {x.nombre}
                          {x.eq && <span style={{ color: "#64748b", fontWeight: 600 }}> · {x.eq.posicion}º ({x.eq.pts} pts)</span>}
                        </span>
                        {x.eq && <Racha forma={x.eq.forma} />}
                      </div>
                    ))}

                    {rec ? (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "8px 10px",
                          borderRadius: 10,
                          background: "rgba(29,185,84,0.08)",
                          border: "1px solid rgba(29,185,84,0.25)",
                        }}
                      >
                        <div style={{ color: "#e2e8f0", fontSize: "0.8rem", fontWeight: 700 }}>{rec.veredicto}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "0.76rem", color: "#94a3b8" }}>
                          <span>
                            Marcador sugerido: <strong style={{ color: "#fff", fontSize: "0.9rem" }}>{rec.marcador}</strong>
                          </span>
                          <span>Confianza {rec.confianza}%</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 4 }}>
                          Goles por partido — {l!.nombre}: {(l!.gf / Math.max(l!.pj, 1)).toFixed(1)} a favor,{" "}
                          {(l!.gc / Math.max(l!.pj, 1)).toFixed(1)} en contra · {v!.nombre}: {(v!.gf / Math.max(v!.pj, 1)).toFixed(1)} a favor,{" "}
                          {(v!.gc / Math.max(v!.pj, 1)).toFixed(1)} en contra
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: "#64748b", fontSize: "0.74rem", marginTop: 6 }}>Sin datos suficientes de la liga para este cruce.</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. TABLA DE POSICIONES */}
      {tabla && (
        <div className="card">
          <h3 style={{ margin: "0 0 2px" }}>📊 Tabla de posiciones — Liga BetPlay</h3>
          <p style={{ color: "#64748b", fontSize: "0.74rem", margin: "0 0 10px" }}>
            {tabla.torneo} · Los 8 primeros clasifican a cuadrangulares · Fuente: ESPN · Actualizado{" "}
            {new Date(tabla.actualizado).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" })}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="tabla-liga">
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ textAlign: "left" }}>Equipo</th>
                  <th title="Partidos jugados">PJ</th>
                  <th title="Ganados">G</th>
                  <th title="Empatados">E</th>
                  <th title="Perdidos">P</th>
                  <th title="Goles a favor">GF</th>
                  <th title="Goles en contra">GC</th>
                  <th title="Diferencia de gol">DG</th>
                  <th>Pts</th>
                  <th style={{ textAlign: "left" }}>Últimos 5</th>
                </tr>
              </thead>
              <tbody>
                {tabla.equipos.map((e) => (
                  <tr key={e.espn_id} className={e.posicion <= 8 ? "clasifica" : ""}>
                    <td style={{ fontWeight: 800 }}>{e.posicion}</td>
                    <td style={{ textAlign: "left" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        {e.logo && <img src={e.logo} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />}
                        <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{e.nombre}</span>
                      </span>
                    </td>
                    <td>{e.pj}</td>
                    <td>{e.g}</td>
                    <td>{e.e}</td>
                    <td>{e.p}</td>
                    <td>{e.gf}</td>
                    <td>{e.gc}</td>
                    <td style={{ color: e.dg > 0 ? "#1db954" : e.dg < 0 ? "#ef4444" : undefined }}>{e.dg > 0 ? `+${e.dg}` : e.dg}</td>
                    <td style={{ fontWeight: 900, color: "#fff" }}>{e.pts}</td>
                    <td style={{ textAlign: "left" }}>
                      <Racha forma={e.forma} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ASISTENTE IA (opcional) */}
      <div className="card">
        <button
          type="button"
          onClick={() => setVerAsistente((v) => !v)}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: "1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "space-between" }}
        >
          <span>🤖 Pregúntale al asistente (alineaciones, goleadores, historia…)</span>
          <span style={{ color: "#64748b" }}>{verAsistente ? "Ocultar ▲" : "Abrir ▼"}</span>
        </button>
        {verAsistente && (
          <div style={{ marginTop: 12 }}>
            <CentralDatosView compacto />
          </div>
        )}
      </div>

      <style>{`
        .cazador-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }
        .cazador-partido { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 12px 14px; }
        .tabla-liga { width: 100%; border-collapse: collapse; font-size: 0.82rem; min-width: 640px; }
        .tabla-liga th { color: #64748b; font-weight: 800; font-size: 0.7rem; padding: 8px 6px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .tabla-liga td { padding: 8px 6px; text-align: center; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .tabla-liga tr.clasifica td:first-child { box-shadow: inset 3px 0 0 var(--cancha); }
        .tabla-liga tbody tr:hover td { background: rgba(255,255,255,0.03); }
      `}</style>
    </div>
  );
}
