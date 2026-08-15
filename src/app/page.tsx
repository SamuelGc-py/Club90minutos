"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, Trophy, Users, TrendingUp, Calendar, Lock, Play, ArrowRight, Activity, Zap, ShieldCheck, AlertCircle, Facebook, Instagram, Twitter, Youtube, Music2, Home } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("inicio");

  useEffect(() => {
    document.body.classList.add("inicio-fullscreen");
    return () => {
      document.body.classList.remove("inicio-fullscreen");
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .landing-header {
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .landing-header-buttons {
          display: flex;
          gap: 12px;
        }
        .landing-layout {
          flex: 1;
          display: flex;
          gap: 28px;
          align-items: flex-start;
          padding: 0 24px 24px;
        }
        .landing-sidebar {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(11, 21, 32, 0.95) 100%);
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          width: 264px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 80px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 8px 16px rgba(0,0,0,0.3);
        }
        .landing-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        @media (max-width: 768px) {
          .landing-header {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }
          .landing-header-buttons {
            width: 100%;
            justify-content: center;
          }
          .landing-layout {
            flex-direction: column;
            padding: 0 16px 24px;
            gap: 20px;
          }
          .landing-sidebar {
            width: 100%;
            position: static;
          }
        }
      `}</style>

      {/* HEADER / NAVBAR */}
      <header className="landing-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img 
            src="/logo_principal_recortado.webp" 
            alt="Logo Club 90 Minutos" 
            style={{ height: 40, width: "auto" }}
          />
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.5px" }}>
            CLUB<span style={{ color: "#74CC10" }}>90</span>MINUTOS
          </span>
        </div>
        <div className="landing-header-buttons">
          <Link href="/dashboard" style={{ textDecoration: "none", flex: 1 }}>
            <button style={{ 
              width: "100%", padding: "10px 20px", background: "transparent", color: "#FFFFFF", 
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", 
              fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s"
            }}>
              Iniciar Sesión
            </button>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: "none", flex: 1 }}>
            <button style={{ 
              width: "100%", padding: "10px 20px", background: "#74CC10", color: "#04060A", 
              border: "none", borderRadius: "8px", 
              fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(116, 204, 16, 0.3)",
              transition: "transform 0.2s ease"
            }}>
              Únete al Club
            </button>
          </Link>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", marginTop: 24 }}>
        
        {/* LAYOUT PRINCIPAL */}
        <main className="landing-layout">
          
          {/* SIDEBAR LATERAL GLOBAL */}
          <aside className="landing-sidebar">
            <div style={{ padding: "6px 10px 14px", color: "#64748b", fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px dashed rgba(255,255,255,0.08)", marginBottom: 6 }}>
              Navegación
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "inicio", label: "Inicio", icon: Home, color: "#38bdf8" },
                { key: "como-funciona", label: "Cómo Funciona", icon: Play, color: "#a78bfa" },
                { key: "puntuacion", label: "Sistema de Puntuación", icon: Zap, color: "#f5b000" },
                { key: "terminos", label: "Términos y Condiciones", icon: ShieldCheck, color: "#34d399" },
              ].map((item) => {
                const activo = activeTab === item.key;
                const Icono = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px", borderRadius: "16px",
                      border: activo ? `1px solid ${item.color}66` : "1px solid transparent",
                      background: activo ? `linear-gradient(135deg, ${item.color}33 0%, ${item.color}14 100%)` : "transparent",
                      color: activo ? "#ffffff" : "#94a3b8",
                      fontWeight: activo ? 800 : 600, fontSize: "0.85rem",
                      cursor: "pointer", textAlign: "left",
                      boxShadow: activo ? `0 10px 25px -8px ${item.color}80` : "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => { if (!activo) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseOut={(e) => { if (!activo) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: "10px",
                      background: activo ? `${item.color}26` : "rgba(255,255,255,0.05)",
                      color: activo ? item.color : "#64748b",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      <Icono size={16} strokeWidth={activo ? 2.5 : 2} />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* CONTENIDO DERECHO */}
          <div className="landing-content">
            
            {activeTab === "inicio" && (
              <>
                {/* HERO SECTION */}
                <section style={{ 
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "40px 20px", textAlign: "center", position: "relative", overflow: "hidden",
                  background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 24
                }}>
                  {/* Background Glow */}
                  <div style={{ 
                    position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)",
                    width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(116,204,16,0.15) 0%, rgba(4,6,10,0) 70%)",
                    zIndex: 0, pointerEvents: "none"
                  }} />

                  <div style={{ zIndex: 1, maxWidth: 800 }}>
                    <div style={{ 
                      display: "inline-block", background: "rgba(116, 204, 16, 0.1)", color: "#74CC10",
                      padding: "6px 16px", borderRadius: "30px", fontWeight: 700, fontSize: "0.85rem", marginBottom: 24,
                      border: "1px solid rgba(116, 204, 16, 0.3)"
                    }}>
                      ⚽ La polla futbolera más competitiva
                    </div>
                    
                    <h1 style={{ 
                      fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", 
                      fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-1px"
                    }}>
                      DEMUESTRA QUE <br/>
                      <span style={{ color: "#74CC10" }}>SABES DE FÚTBOL</span>
                    </h1>
                    
                    <p style={{ color: "#E5E7EB", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
                      Crea tu polla, compite en vivo con amigos y escala en la tabla de posiciones jornada tras jornada. La pasión del fútbol, con esteroides.
                    </p>
                    
                    <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                      <Link href="/dashboard" style={{ textDecoration: "none" }}>
                        <button style={{ 
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "16px 32px", background: "#74CC10", color: "#04060A", 
                          border: "none", borderRadius: "12px", 
                          fontWeight: 900, fontSize: "1.1rem", cursor: "pointer", 
                          boxShadow: "0 8px 25px rgba(116, 204, 16, 0.4)",
                          transition: "transform 0.2s ease"
                        }}>
                          Comenzar a Predecir <ArrowRight size={20} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </section>

                <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.4rem", fontWeight: 800, marginTop: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 10, color: "#FFFFFF" }}>
                  <Trophy color="#EFCC36" size={26} /> Torneos Disponibles
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                  <Link href="/dashboard" style={{ textDecoration: "none" }}>
                    <div style={{ 
                      padding: "24px", background: "rgba(116, 204, 16, 0.05)", border: "1px solid rgba(116, 204, 16, 0.2)",
                      borderRadius: 24, cursor: "pointer", transition: "all 0.2s ease",
                      display: "flex", alignItems: "center", gap: 20
                    }}>
                      <div style={{ width: 64, height: 64, background: "#FFFFFF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", padding: 6 }}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Liga_BetPlay_Dimayor_2020.png" alt="Liga BetPlay" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "1.2rem" }}>Liga BetPlay</div>
                        <div style={{ fontSize: "0.9rem", color: "#74CC10", fontWeight: 700, marginTop: 6 }}>En Juego • Ingresar</div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/construccion" style={{ textDecoration: "none" }}>
                    <div style={{ 
                      padding: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 24, cursor: "pointer", transition: "all 0.2s ease", opacity: 0.7,
                      display: "flex", alignItems: "center", gap: 20
                    }}>
                      <div style={{ width: 64, height: 64, background: "#FFFFFF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", padding: 6 }}>
                        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo_2.svg/1200px-UEFA_Champions_League_logo_2.svg.png" alt="Champions League" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "1.2rem" }}>Champions League</div>
                        <div style={{ fontSize: "0.9rem", color: "#6B7280", fontWeight: 600, marginTop: 6 }}>Próximamente</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </>
            )}

            {activeTab === "como-funciona" && (
              <div id="como-funciona" style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 24, padding: "40px" }}>
                <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "2rem", fontWeight: 800, marginBottom: 32, color: "#38bdf8", display: "flex", alignItems: "center", gap: 12 }}>
                  <Play size={28} color="#38bdf8" /> ¿Cómo Funciona?
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ width: 56, height: 56, background: "rgba(67, 138, 255, 0.1)", color: "#438AFF", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Calendar size={28} />
                    </div>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: 800 }}>1. Predice la Jornada</h4>
                    <p style={{ color: "#E5E7EB", fontSize: "0.95rem", lineHeight: 1.6 }}>
                      Ingresa tus marcadores exactos y goleadores antes de que ruede el balón. Todo se bloquea en tiempo real.
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ width: 56, height: 56, background: "rgba(234, 61, 53, 0.1)", color: "#EA3D35", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Activity size={28} />
                    </div>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: 800 }}>2. Sigue el En Vivo</h4>
                    <p style={{ color: "#E5E7EB", fontSize: "0.95rem", lineHeight: 1.6 }}>
                      Sigue los resultados en tiempo real y cómo se mueven los pronósticos de tus rivales minuto a minuto.
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ width: 56, height: 56, background: "rgba(116, 204, 16, 0.1)", color: "#74CC10", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <TrendingUp size={28} />
                    </div>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: 800 }}>3. Suma Puntos</h4>
                    <p style={{ color: "#E5E7EB", fontSize: "0.95rem", lineHeight: 1.6 }}>
                      Acierta resultados exactos, ganadores o goleadores y escala posiciones en la tabla general de la polla.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "puntuacion" && (
              <div id="sistema-puntuacion" style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 24, padding: "40px" }}>
                <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "2rem", fontWeight: 800, marginBottom: 32, color: "#f5b000", display: "flex", alignItems: "center", gap: 12 }}>
                  <Zap size={28} color="#f5b000" /> Sistema de Puntuación
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 20 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 6 }}>Resultado Exacto</div>
                      <div style={{ color: "#8ba3b4", fontSize: "0.95rem" }}>Acertar el marcador exacto del partido</div>
                    </div>
                    <div style={{ color: "#74CC10", fontWeight: 900, fontSize: "1.4rem" }}>+5 pts</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 20 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 6 }}>Ganador del Partido</div>
                      <div style={{ color: "#8ba3b4", fontSize: "0.95rem" }}>Acertar qué equipo gana (o si es empate)</div>
                    </div>
                    <div style={{ color: "#74CC10", fontWeight: 900, fontSize: "1.4rem" }}>+3 pts</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 6 }}>Goleador del Partido</div>
                      <div style={{ color: "#8ba3b4", fontSize: "0.95rem" }}>El jugador que elegiste anota al menos un gol</div>
                    </div>
                    <div style={{ color: "#74CC10", fontWeight: 900, fontSize: "1.4rem" }}>+2 pts</div>
                  </div>
                </div>
                
                <div style={{ marginTop: 32, padding: 20, background: "rgba(239, 204, 54, 0.1)", border: "1px solid rgba(239, 204, 54, 0.3)", borderRadius: 12, color: "#EFCC36", fontSize: "0.95rem", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <Lock size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ margin: 0, lineHeight: 1.5 }}>
                    <strong>Cierre de Predicciones:</strong> Todos los pronósticos se bloquean automáticamente 30 minutos antes de la hora de inicio oficial del partido. Ningún usuario puede modificar sus pronósticos después de ese momento.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "terminos" && (
              <div id="terminos" style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 24, padding: "40px" }}>
                <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "2rem", fontWeight: 800, marginBottom: 32, color: "#34d399", display: "flex", alignItems: "center", gap: 12 }}>
                  <ShieldCheck color="#34d399" size={28} /> Términos y Condiciones
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", marginTop: 8, flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: "1.15rem", marginBottom: 8 }}>Participación y Cuentas</h4>
                      <p style={{ color: "#E5E7EB", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                        Para participar es obligatorio crear una cuenta con un correo válido. Cada usuario es responsable de la seguridad de sus credenciales. No se permiten multicuentas para un mismo torneo.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", marginTop: 8, flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: "1.15rem", marginBottom: 8 }}>Cierre de Pronósticos</h4>
                      <p style={{ color: "#E5E7EB", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                        Los pronósticos se bloquean irreversiblemente <strong>30 minutos antes</strong> de la hora oficial programada para el pitazo inicial de cada partido.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", marginTop: 8, flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: "1.15rem", marginBottom: 8 }}>Partidos Aplazados o Suspendidos</h4>
                      <p style={{ color: "#E5E7EB", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                        Si un partido es suspendido tras haber iniciado, el resultado se mantendrá en espera hasta resolución oficial. Si es aplazado antes de iniciar, las predicciones se mantendrán hasta la nueva fecha programada.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", marginTop: 8, flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: "1.15rem", marginBottom: 8 }}>Liquidación de Puntos</h4>
                      <p style={{ color: "#E5E7EB", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                        Los puntos se calculan basándose estrictamente en el resultado final del tiempo regular (90 minutos + adición). En fases eliminatorias, NO se cuenta el tiempo extra ni penales, a menos que se especifique lo contrario.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 32, padding: 20, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 12, color: "#FCA5A5", fontSize: "0.95rem", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ margin: 0, lineHeight: 1.5 }}>
                    <strong>Importante:</strong> La administración se reserva el derecho de anular partidos de la polla o ajustar puntajes si se comprueba manipulación de resultados externos o fallas en el sistema oficial de la plataforma.
                  </p>
                </div>
              </div>
            )}
            
          </div>
        </main>

        {/* FOOTER */}
        <footer style={{ 
          background: "rgba(11, 21, 32, 0.95)", borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "60px 24px 30px", marginTop: "auto"
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src="/logo_principal_recortado.webp" alt="Logo" style={{ height: 48 }} />
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "0.5px", color: "#FFFFFF" }}>
                    CLUB<span style={{ color: "#74CC10" }}>90</span>MINUTOS
                  </span>
                </div>
                <p style={{ color: "#8ba3b4", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 400 }}>
                  La plataforma definitiva para los amantes del fútbol colombiano. Pronostica, compite y demuestra que eres el que más sabe de la Liga BetPlay.
                </p>
                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                  <a href="#" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", transition: "background 0.2s" }}><Facebook size={20} /></a>
                  <a href="#" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", transition: "background 0.2s" }}><Instagram size={20} /></a>
                  <a href="#" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", transition: "background 0.2s" }}><Twitter size={20} /></a>
                  <a href="#" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", transition: "background 0.2s" }}><Youtube size={20} /></a>
                </div>
              </div>

              <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <h4 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.05rem" }}>Navegación</h4>
                  <span onClick={() => setActiveTab('inicio')} style={{ color: "#8ba3b4", cursor: "pointer", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#FFFFFF"} onMouseOut={(e) => e.currentTarget.style.color = "#8ba3b4"}>Inicio</span>
                  <span onClick={() => setActiveTab('como-funciona')} style={{ color: "#8ba3b4", cursor: "pointer", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#FFFFFF"} onMouseOut={(e) => e.currentTarget.style.color = "#8ba3b4"}>Cómo funciona</span>
                  <span onClick={() => setActiveTab('puntuacion')} style={{ color: "#8ba3b4", cursor: "pointer", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#FFFFFF"} onMouseOut={(e) => e.currentTarget.style.color = "#8ba3b4"}>Sistema de Puntuación</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <h4 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.05rem" }}>Legal</h4>
                  <span onClick={() => setActiveTab('terminos')} style={{ color: "#8ba3b4", cursor: "pointer", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#FFFFFF"} onMouseOut={(e) => e.currentTarget.style.color = "#8ba3b4"}>Términos y Condiciones</span>
                  <a href="/construccion" style={{ color: "#8ba3b4", textDecoration: "none", fontSize: "0.95rem" }}>Políticas de Privacidad</a>
                </div>
              </div>
            </div>

            <div style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
              paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "0.8rem", color: "#6B7280"
            }}>
              <div>&copy; {new Date().getFullYear()} Club 90 Minutos. Todos los derechos reservados.</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                Hecho con ⚽ para los amantes del fútbol
              </div>
            </div>
            
          </div>
        </footer>
      </div>
    </div>
  );
}
