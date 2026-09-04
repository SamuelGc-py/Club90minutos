"use client";

import React, { useState, useRef } from "react";
import { Search, Trophy, Calendar, Users, Loader2, Send, Sparkles, CheckCircle2, X, Info } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CentralDatosView() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<{ tipo: string; titulo: string; contenido: any } | null>(null);
  const mouseDownEnFondoRef = useRef(false);

  const enviarConsulta = async (textoConsulta: string) => {
    if (!textoConsulta.trim()) return;

    setLoading(true);
    setRespuesta(null);
    setPrompt(""); // Limpiar input si fue escrito manualmente

    try {
      const res = await fetch("/api/oraculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textoConsulta }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error consultando la Central de Datos");
      }

      setRespuesta({
        tipo: data.type,
        titulo: data.title,
        contenido: data.data,
      });

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContenido = () => {
    if (!respuesta) return null;

    if (respuesta.tipo === "GENERAL") {
      return (
        <div
          className="markdown-oraculo"
          style={{
            background: "#1A1F26",
            borderRadius: 16,
            padding: "24px 28px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            color: "var(--tiza)",
            fontSize: "0.98rem",
            lineHeight: 1.7,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{respuesta.contenido.answer || ""}</ReactMarkdown>
        </div>
      );
    }

    if (respuesta.tipo === "STANDINGS") {
      const entries = respuesta.contenido?.children?.[0]?.standings?.entries;
      if (entries && Array.isArray(entries)) {
        return (
          <div style={{ overflowX: "auto", borderRadius: 16, background: "rgba(15, 23, 42, 0.9)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem", color: "#fff" }}>
              <thead>
                <tr style={{ background: "rgba(30, 41, 59, 0.9)", borderBottom: "1px solid rgba(255,255,255,0.08)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.06em", color: "var(--graderia)" }}>
                  <th style={{ padding: "14px 16px" }}>Pos</th>
                  <th style={{ padding: "14px 16px" }}>Equipo</th>
                  <th style={{ padding: "14px 16px", textAlign: "center", color: "#34d399", fontWeight: 800 }}>PTS</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>PJ</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>PG</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>PE</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>PP</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>GF</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>GC</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>DIF</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: any, index: number) => {
                  const team = entry.team;
                  const stats = entry.stats.reduce((acc: any, stat: any) => {
                    acc[stat.name] = stat.value;
                    return acc;
                  }, {});

                  return (
                    <tr
                      key={team.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        background: index % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.02)",
                      }}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 800, color: index < 8 ? "#34d399" : "var(--graderia)" }}>#{index + 1}</td>
                      <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
                        {team.logos?.[0]?.href && (
                          <img src={team.logos[0].href} alt={team.displayName} style={{ width: 24, height: 24, objectFit: "contain" }} />
                        )}
                        <span>{team.displayName}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 900, color: "#34d399", fontSize: "1.05rem" }}>{stats.points}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--graderia)" }}>{stats.gamesPlayed}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", color: "#38bdf8" }}>{stats.wins}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", color: "#fbbf24" }}>{stats.ties}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", color: "#ef4444" }}>{stats.losses}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--graderia)" }}>{stats.pointsFor}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--graderia)" }}>{stats.pointsAgainst}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700 }}>{stats.pointDifferential}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      return null;
    }

    if (respuesta.tipo === "SCOREBOARD") {
      const dbPartidos = respuesta.contenido?.dbPartidos || [];
      const espnEvents = respuesta.contenido?.espnEvents || [];

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* PARTIDOS DE LA BASE DE DATOS CLUB 90 MINUTOS (OFICIALES) */}
          {dbPartidos.length > 0 && (
            <div>
              <div style={{ fontSize: "0.85rem", color: "#34d399", fontWeight: 800, textTransform: "uppercase", marginBottom: 10, letterSpacing: "0.05em" }}>
                🏆 Resultados Oficiales de la Polla 90 Minutos
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {dbPartidos.map((partido: any) => {
                  const localRes = partido.resultado_oficial?.goles_local ?? 0;
                  const visitanteRes = partido.resultado_oficial?.goles_visitante ?? 0;
                  const goleadores = partido.resultado_oficial?.goleadores || [];

                  return (
                    <div
                      key={partido.id}
                      style={{
                        background: "#1A1F26",
                        padding: 18,
                        borderRadius: 16,
                                                display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 800 }}>🏁 FINALIZADO (Jornada {partido.jornada})</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--graderia)" }}>
                          {new Date(partido.fecha_hora_partido).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                          {partido.equipo_local?.escudo_url && <img src={partido.equipo_local.escudo_url} alt="local" style={{ width: 34, height: 34, objectFit: "contain" }} />}
                          <span style={{ fontSize: "0.82rem", textAlign: "center", fontWeight: 800, color: "#fff" }}>{partido.equipo_local?.nombre}</span>
                        </div>
                        <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#34d399", minWidth: 70, textAlign: "center" }}>
                          {localRes} - {visitanteRes}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                          {partido.equipo_visitante?.escudo_url && <img src={partido.equipo_visitante.escudo_url} alt="away" style={{ width: 34, height: 34, objectFit: "contain" }} />}
                          <span style={{ fontSize: "0.82rem", textAlign: "center", fontWeight: 800, color: "#fff" }}>{partido.equipo_visitante?.nombre}</span>
                        </div>
                      </div>

                      {goleadores.length > 0 && (
                        <div style={{ fontSize: "0.75rem", color: "#a7f3d0", background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: 8, textAlign: "center" }}>
                          👟 Goleadores: {goleadores.map((g: any) => g.jugador?.nombre).filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PARTIDOS DE ESPN WEB EN VIVO / ÚLTIMOS */}
          {espnEvents.length > 0 && (
            <div>
              <div style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 800, textTransform: "uppercase", marginBottom: 10, letterSpacing: "0.05em" }}>
                🌐 Marcadores y Partidos de la Web
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {espnEvents.map((evento: any) => {
                  const comp = evento.competitions[0];
                  const local = comp.competitors.find((c: any) => c.homeAway === "home");
                  const away = comp.competitors.find((c: any) => c.homeAway === "away");
                  const state = evento.status?.type?.state;
                  const detail = evento.status?.type?.detail;
                  const estInfo = state === "post"
                    ? { texto: "🏁 FINALIZADO", color: "#10b981" }
                    : state === "in"
                    ? { texto: "🔴 EN VIVO", color: "#ef4444" }
                    : { texto: detail || "PROGRAMADO", color: "#38bdf8" };

                  return (
                    <div
                      key={evento.id}
                      style={{
                        background: "#1A1F26",
                        padding: 18,
                        borderRadius: 16,
                                                display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontSize: "0.72rem", textAlign: "center", color: estInfo.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {estInfo.texto}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                          {local?.team?.logo && <img src={local.team.logo} alt="local" style={{ width: 34, height: 34, objectFit: "contain" }} />}
                          <span style={{ fontSize: "0.82rem", textAlign: "center", fontWeight: 800, color: "#fff" }}>{local?.team?.shortDisplayName || local?.team?.displayName}</span>
                        </div>
                        <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#34d399", minWidth: 70, textAlign: "center" }}>
                          {local?.score || "0"} - {away?.score || "0"}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                          {away?.team?.logo && <img src={away.team.logo} alt="away" style={{ width: 34, height: 34, objectFit: "contain" }} />}
                          <span style={{ fontSize: "0.82rem", textAlign: "center", fontWeight: 800, color: "#fff" }}>{away?.team?.shortDisplayName || away?.team?.displayName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (respuesta.tipo === "LINEUPS") {
      const rosters = respuesta.contenido?.rosters || [];
      if (rosters.length === 0) {
        return (
          <div style={{ padding: 20, textAlign: "center", color: "var(--graderia)" }}>
            No hay alineación disponible todavía para este partido.
          </div>
        );
      }

      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {rosters.map((r: any, idx: number) => {
            const nombreEquipo = r.team?.displayName || r.team?.name || `Equipo ${idx + 1}`;
            const escudo = r.team?.logo || r.team?.logos?.[0]?.href;
            const jugadores = (r.roster || []) as any[];
            const titulares = jugadores.filter((j) => j.starter);
            const suplentes = jugadores.filter((j) => !j.starter);

            return (
              <div
                key={idx}
                style={{
                  background: "#1A1F26",
                  borderRadius: 16,
                  padding: 18,
                                  }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  {escudo && <img src={escudo} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />}
                  <span style={{ fontWeight: 800, color: "#fff", fontSize: "0.95rem" }}>{nombreEquipo}</span>
                  {r.formation?.name && (
                    <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#a78bfa", fontWeight: 700 }}>{r.formation.name}</span>
                  )}
                </div>

                <div style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Titulares</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: titulares.length > 0 ? 14 : 0 }}>
                  {titulares.length > 0 ? titulares.map((j, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#fff" }}>
                      <span style={{ width: 22, color: "var(--graderia)", fontWeight: 700 }}>{j.jersey || ""}</span>
                      <span style={{ flex: 1 }}>{j.athlete?.displayName || j.athlete?.shortName || "—"}</span>
                      {j.position?.abbreviation && <span style={{ color: "var(--graderia)", fontSize: "0.72rem" }}>{j.position.abbreviation}</span>}
                    </div>
                  )) : (
                    <div style={{ fontSize: "0.8rem", color: "var(--graderia)" }}>Aún sin confirmar</div>
                  )}
                </div>

                {suplentes.length > 0 && (
                  <>
                    <div style={{ fontSize: "0.72rem", color: "var(--graderia)", fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Suplentes</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {suplentes.map((j, i) => (
                        <span key={i} style={{ fontSize: "0.75rem", color: "var(--graderia)", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 20 }}>
                          {j.athlete?.displayName || j.athlete?.shortName}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ width: "100%", maxWidth: 1260, margin: "0 auto", padding: "12px 0 60px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* HEADER DE RECOMENDACIONES */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#1A1F26", padding: 20, borderRadius: 12, borderLeft: "3px solid #74CC10" }}>
        <div style={{ width: 50, height: 50, borderRadius: 10, background: "#74CC10", display: "flex", alignItems: "center", justifyContent: "center", color: "#04060A" }}>
          <img src="/marca/logo-club90-monograma-transparente.webp" alt="" style={{ height: 28, width: 28, objectFit: "contain" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            Recomendaciones y Datos <Sparkles size={18} style={{ color: "#74CC10" }} />
          </h2>
          <p style={{ color: "var(--graderia)", fontSize: "0.88rem", margin: 0 }}>
            Consulta tablas de posiciones, marcadores reales, estadísticas y análisis deportivo
          </p>
        </div>
      </div>

      {/* BANNER: QUÉ SE PUEDE CONSULTAR AQUÍ */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: 14, padding: "14px 18px" }}>
        <Info size={18} style={{ color: "#38bdf8", flexShrink: 0, marginTop: 2 }} />
        <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.6 }}>
          Aquí puedes consultar la <strong style={{ color: "#38bdf8" }}>tabla de posiciones</strong> de los equipos, goles a favor y en contra, partidos ganados/perdidos, los <strong style={{ color: "#38bdf8" }}>últimos 5 resultados</strong> y más — igual que en Flashscore o Google, pero de la Liga BetPlay.
        </p>
      </div>

      {/* CHIPS SUGERENCIAS RÁPIDAS DE BÚSQUEDA */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: "0.82rem", color: "var(--graderia)", fontWeight: 700 }}>💡 Consultas sugeridas:</span>
        {[
          { label: "📊 Tabla de Posiciones", query: "Muéstrame la tabla de posiciones actual de la liga colombiana" },
          { label: "🏁 Marcadores y Resultados", query: "Cuáles son los marcadores y últimos resultados de los partidos" },
          { label: "👥 Alineaciones Probables", query: "Dime las posibles alineaciones para los partidos principales" },
          { label: "👟 Tabla de Goleadores", query: "Quiénes son los actuales goleadores de la liga colombiana" },
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => enviarConsulta(chip.query)}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "none",
              borderRadius: 50,
              padding: "7px 15px",
              color: "#38bdf8",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(56, 189, 248, 0.15)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.transform = "none";
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* BUSCADOR */}
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarConsulta(prompt)}
          placeholder="Pregunta sobre alineaciones, posiciones, goleadores o análisis..."
          style={{
            width: "100%",
            background: "rgba(15, 23, 42, 0.95)",
            border: "none",
            borderRadius: 16,
            padding: "16px 56px 16px 20px",
            color: "#fff",
            fontSize: "0.95rem",
            outline: "none",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          }}
        />
        <button
          onClick={() => enviarConsulta(prompt)}
          disabled={loading || !prompt.trim()}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 42,
            height: 42,
            background: loading || !prompt.trim() ? "rgba(255,255,255,0.1)" : "#74CC10",
            color: loading || !prompt.trim() ? "#fff" : "#04060A",
            border: "none",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
            transition: "background-color 0.15s ease",
          }}
        >
          {loading ? <Loader2 size={20} className="spin" /> : <Send size={18} />}
        </button>
      </div>

      {/* VENTANA FLOTANTE CON EL RESULTADO DE LA CONSULTA */}
      {(loading || respuesta) && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(4,6,10,0.9)",
            display: "flex", justifyContent: "center", alignItems: "flex-start",
            overflowY: "auto",
            zIndex: 9999, padding: "40px 20px",
          }}
          onMouseDown={(e) => { mouseDownEnFondoRef.current = e.target === e.currentTarget; }}
          onClick={(e) => { if (!loading && mouseDownEnFondoRef.current && e.target === e.currentTarget) setRespuesta(null); }}
        >
          <div
            style={{
              background: "#0b0f1a",
              border: "1px solid rgba(116, 204, 16, 0.3)",
              borderRadius: 20,
              width: "100%", maxWidth: 760,
              maxHeight: "100%",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
              
            }}
          >
            <div style={{ flexShrink: 0, padding: "18px 22px", background: "#12161c", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <img src="/marca/logo-club90-monograma-transparente.webp" alt="" style={{ height: 22, width: 22, objectFit: "contain" }} />
                {loading ? "Consultando..." : respuesta?.titulo}
              </h3>
              <button
                onClick={() => !loading && setRespuesta(null)}
                disabled={loading}
                style={{ background: "transparent", border: "none", color: "var(--graderia)", cursor: loading ? "default" : "pointer", opacity: loading ? 0.4 : 1 }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: 22, overflowY: "auto" }}>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", gap: 14 }}>
                  <Loader2 className="spin" style={{ color: "#74CC10" }} size={40} />
                  <p style={{ color: "var(--graderia)", fontSize: "0.9rem", margin: 0 }}>Consultando y analizando datos en tiempo real...</p>
                </div>
              ) : (
                renderContenido()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
