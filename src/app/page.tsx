"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, Trophy, Users, TrendingUp, Calendar, Lock, Play, ArrowRight, Activity, Zap, ShieldCheck, AlertCircle, Facebook, Instagram, Twitter, Youtube, Music2, Home } from "lucide-react";
import Link from "next/link";
import { TerminosCompletos } from "./components/TerminosCompletos";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("inicio");


  return (
    <div style={{ minHeight: "100vh", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        body main {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
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
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
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
          .landing-header-inner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            width: 100%;
            margin: 0 auto;
          }
        @media (max-width: 768px) {
          .landing-header {
            padding: 12px 16px;
          }
          .landing-header-inner {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          .landing-header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
          .landing-header-top .logo-img {
            height: 34px !important;
            margin-right: 8px;
          }
          .landing-header-top .logo-text {
            font-size: 1rem !important;
          }
          .landing-nav {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            width: 100%;
            padding-bottom: 8px;
            justify-content: flex-start;
          }
          .landing-nav::-webkit-scrollbar {
            height: 4px;
          }
          .landing-nav::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
          }
          .landing-header-buttons {
            width: 100%;
            justify-content: center;
          }
          .landing-layout {
            padding: 0 16px 24px;
          }
        }
        @media (min-width: 769px) {
          .landing-nav {
            display: flex;
            gap: 20px;
            align-items: center;
          }
        }
      `}</style>

      {/* HEADER / NAVBAR */}
      <header className="landing-header">
        <div className="landing-header-inner">
          
          {/* TOP FOR MOBILE: LOGO AND MAYBE BUTTONS */}
          <div className="landing-header-top">
            <div style={{ display: "flex", alignItems: "center" }}>
              <picture>
                <source srcSet="/marca/logo-club90-escudo-transparente.webp" type="image/webp" />
                <img 
                  src="/marca/logo-club90-escudo-transparente.png" 
                  alt="Logo Club 90 Minutos" 
                  className="logo-img"
                  style={{ 
                    height: 44, width: "auto", 
                    filter: "drop-shadow(0px 2px 8px rgba(116, 204, 16, 0.4))", 
                    marginRight: 12
                  }}
                />
              </picture>
              <span className="logo-text" style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                CLUB<span style={{ color: "var(--color-verde-club)" }}>90</span>MINUTOS
              </span>
            </div>
            
            {/* Buttons hidden on mobile from here, moved below? No, let's keep buttons below nav on mobile */}
          </div>

          {/* NAVIGATION IN HEADER */}
          <nav className="landing-nav">
            {[
              { key: "inicio", label: "Inicio" },
              { key: "como-funciona", label: "Cómo Funciona" },
              { key: "puntuacion", label: "Puntuación" },
              { key: "terminos", label: "Términos" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: activeTab === item.key ? "var(--color-verde-club)" : "var(--color-gris-medio)",
                  fontWeight: activeTab === item.key ? 800 : 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  padding: "8px 4px",
                  borderBottom: activeTab === item.key ? "2px solid var(--color-verde-club)" : "2px solid transparent",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="landing-header-buttons">
            <Link href="/dashboard" style={{ textDecoration: "none", flex: 1 }}>
              <button style={{ 
                width: "100%", padding: "10px 20px", background: "transparent", color: "#FFFFFF", 
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", 
                fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}>
                Iniciar Sesión
              </button>
            </Link>
            <Link href="/dashboard" style={{ textDecoration: "none", flex: 1 }}>
              <button style={{ 
                width: "100%", padding: "10px 20px", background: "var(--color-verde-club)", color: "var(--color-negro-estadio)", 
                border: "none", borderRadius: "8px", 
                fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(116, 204, 16, 0.3)",
                transition: "transform 0.2s ease",
                whiteSpace: "nowrap"
              }}>
                Únete al Club
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", marginTop: 24 }}>
        
        {/* LAYOUT PRINCIPAL */}
        <main className="landing-layout" style={{ display: "block", textAlign: "center" }}>

          {/* CONTENIDO DERECHO */}
          <div className="landing-content" style={{ margin: "0 auto", maxWidth: "1000px" }}>
            
            {activeTab === "inicio" && (
              <>
                {/* HERO SECTION */}
                <section style={{ 
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "40px 20px", textAlign: "center", position: "relative"
                }}>
                  {/* Background Glow */}
                  <div style={{ 
                    position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)",
                    width: "80vw", height: "80vw", maxWidth: "800px", maxHeight: "800px",
                    background: "radial-gradient(circle, rgba(116,204,16,0.12) 0%, rgba(4,6,10,0) 70%)",
                    zIndex: 0, pointerEvents: "none"
                  }} />

                  <div style={{ zIndex: 1, maxWidth: 800 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                      <img src="/betplay.webp" alt="BetPlay" style={{ height: 40, objectFit: "contain" }} />
                    </div>
                    
                    <h1 style={{ 
                      fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(2rem, 6vw, 4.5rem)", 
                      fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-1px"
                    }}>
                      VIVE LA PASIÓN DE LA <br/>
                      <span style={{ color: "#74CC10" }}>LIGA BETPLAY</span>
                    </h1>
                    
                    <p style={{ color: "#E5E7EB", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
                      Pronostica los marcadores, compite en vivo y demuestra tu conocimiento en la polla más emocionante de Colombia. La pasión del fútbol, con esteroides.
                    </p>
                    
                    <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                      <Link href="/dashboard" style={{ textDecoration: "none" }}>
                        <button style={{ 
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "16px 32px", background: "var(--color-verde-club)", color: "var(--color-negro-estadio)", 
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
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                  gap: 20, 
                  maxWidth: 700, 
                  margin: "0 auto" 
                }}>
                  <Link href="/dashboard" style={{ textDecoration: "none" }}>
                    <div style={{ 
                      padding: "24px", background: "rgba(116, 204, 16, 0.05)", border: "1px solid rgba(116, 204, 16, 0.2)",
                      borderRadius: 24, cursor: "pointer", transition: "all 0.2s ease",
                      display: "flex", alignItems: "center", gap: 20
                    }}>
                      <div style={{ width: 64, height: 64, background: "#FFFFFF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", padding: 6 }}>
                        <img src="/images/tournaments/betplay.webp" alt="Liga BetPlay" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
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
                        <img src="/images/tournaments/champions.webp" alt="Champions League" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
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
              <div id="terminos" style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 24, padding: "40px 20px" }}>
                <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "2rem", fontWeight: 800, marginBottom: 32, color: "#34d399", display: "flex", alignItems: "center", gap: 12 }}>
                  <ShieldCheck color="#34d399" size={28} /> Términos y Condiciones
                </h2>
                <TerminosCompletos />
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
                  <picture>
                    <source srcSet="/marca/logo-club90-escudo-transparente.webp" type="image/webp" />
                    <img src="/marca/logo-club90-escudo-transparente.png" alt="Logo" style={{ height: 48 }} />
                  </picture>
                  <span style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "0.5px", color: "var(--color-blanco)" }}>
                    CLUB<span style={{ color: "var(--color-verde-club)" }}>90</span>MINUTOS
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
