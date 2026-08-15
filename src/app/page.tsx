"use client";

import React, { useState } from "react";
import { ChevronRight, Trophy, Users, TrendingUp, Calendar, Lock, Play, ArrowRight, Activity, Zap, ShieldCheck, AlertCircle, Facebook, Instagram, Twitter, Youtube, Music2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#04060A", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER / NAVBAR */}
      <header style={{ 
        position: "sticky", top: 0, zIndex: 100, 
        background: "rgba(4, 6, 10, 0.8)", backdropFilter: "blur(12px)", 
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
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
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button style={{ 
              padding: "10px 20px", background: "transparent", color: "#FFFFFF", 
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", 
              fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s"
            }}>
              Iniciar Sesión
            </button>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button style={{ 
              padding: "10px 20px", background: "#74CC10", color: "#04060A", 
              border: "none", borderRadius: "8px", 
              fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(116, 204, 16, 0.3)",
              transition: "transform 0.2s ease"
            }}>
              Únete al Club
            </button>
          </Link>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 73px)" }}>
        
        {/* HERO SECTION */}
        <section style={{ 
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 20px", textAlign: "center", position: "relative", overflow: "hidden"
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

        {/* CONTENIDO PRINCIPAL: SIDEBAR Y CÓMO JUGAR */}
        <section style={{ 
          maxWidth: 1200, width: "100%", margin: "0 auto", padding: "0 20px 80px",
          display: "grid", gridTemplateColumns: "1fr", gap: 40,
          "@media (min-width: 900px)": { gridTemplateColumns: "300px 1fr" }
        } as React.CSSProperties}>
          
          {/* SIDEBAR: TORNEOS DISPONIBLES */}
          <aside style={{ 
            background: "#1A1F26", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.05)",
            height: "fit-content"
          }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.2rem", fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Trophy color="#EFCC36" size={22} /> Torneos Activos
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Torneo Activo */}
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <div style={{ 
                  padding: "16px", background: "rgba(116, 204, 16, 0.05)", border: "1px solid rgba(116, 204, 16, 0.2)",
                  borderRadius: 12, cursor: "pointer", transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", gap: 16
                }}>
                  <div style={{ width: 48, height: 48, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Liga_BetPlay_Dimayor_2020.png" alt="Liga BetPlay" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "#fff", fontSize: "1.05rem" }}>Liga BetPlay</div>
                    <div style={{ fontSize: "0.8rem", color: "#74CC10", fontWeight: 700, marginTop: 4 }}>En Juego • Ingresar</div>
                  </div>
                </div>
              </Link>

              {/* Torneo En Construcción */}
              <Link href="/construccion" style={{ textDecoration: "none" }}>
                <div style={{ 
                  padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 12, cursor: "pointer", transition: "all 0.2s ease", opacity: 0.7,
                  display: "flex", alignItems: "center", gap: 16
                }}>
                  <div style={{ width: 48, height: 48, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}>
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo_2.svg/1200px-UEFA_Champions_League_logo_2.svg.png" alt="Champions League" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "#fff", fontSize: "1.05rem" }}>Champions League</div>
                    <div style={{ fontSize: "0.8rem", color: "#6B7280", fontWeight: 600, marginTop: 4 }}>Próximamente</div>
                  </div>
                </div>
              </Link>
            </div>
          </aside>

          {/* MAIN CONTENT: CÓMO JUGAR & TYC */}
          <main style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            
            {/* Cómo Funciona */}
            <div style={{ background: "#1A1F26", borderRadius: 16, padding: 32, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 24, color: "#74CC10" }}>
                ¿Cómo Funciona?
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ width: 48, height: 48, background: "rgba(67, 138, 255, 0.1)", color: "#438AFF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Calendar size={24} />
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 800 }}>1. Predice la Jornada</h4>
                  <p style={{ color: "#E5E7EB", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    Ingresa tus marcadores exactos y goleadores antes de que ruede el balón. Todo se bloquea en tiempo real.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ width: 48, height: 48, background: "rgba(234, 61, 53, 0.1)", color: "#EA3D35", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Activity size={24} />
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 800 }}>2. Sigue el En Vivo</h4>
                  <p style={{ color: "#E5E7EB", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    Sigue los resultados en tiempo real y cómo se mueven los pronósticos de tus rivales minuto a minuto.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ width: 48, height: 48, background: "rgba(116, 204, 16, 0.1)", color: "#74CC10", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrendingUp size={24} />
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 800 }}>3. Suma Puntos</h4>
                  <p style={{ color: "#E5E7EB", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    Acierta resultados exactos, ganadores o goleadores y escala posiciones en la tabla general de la polla.
                  </p>
                </div>
              </div>
            </div>

            {/* Sistema de Puntuación (Términos Básicos) */}
            <div style={{ background: "#1A1F26", borderRadius: 16, padding: 32, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 24, color: "#fff" }}>
                Sistema de Puntuación
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>Resultado Exacto</div>
                    <div style={{ color: "#6B7280", fontSize: "0.85rem" }}>Acertar el marcador exacto del partido</div>
                  </div>
                  <div style={{ color: "#74CC10", fontWeight: 900, fontSize: "1.2rem" }}>+5 pts</div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>Ganador del Partido</div>
                    <div style={{ color: "#6B7280", fontSize: "0.85rem" }}>Acertar qué equipo gana (o si es empate)</div>
                  </div>
                  <div style={{ color: "#74CC10", fontWeight: 900, fontSize: "1.2rem" }}>+3 pts</div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>Goleador del Partido</div>
                    <div style={{ color: "#6B7280", fontSize: "0.85rem" }}>El jugador que elegiste anota al menos un gol</div>
                  </div>
                  <div style={{ color: "#74CC10", fontWeight: 900, fontSize: "1.2rem" }}>+2 pts</div>
                </div>

              </div>
              
              <div style={{ marginTop: 24, padding: 16, background: "rgba(239, 204, 54, 0.1)", border: "1px solid rgba(239, 204, 54, 0.3)", borderRadius: 8, color: "#EFCC36", fontSize: "0.85rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Lock size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0 }}>
                  <strong>Cierre de Predicciones:</strong> Todos los pronósticos se bloquean automáticamente 30 minutos antes de la hora de inicio oficial del partido. Ningún usuario puede modificar sus pronósticos después de ese momento.
                </p>
              </div>
            </div>

            {/* Términos y Condiciones */}
            <div style={{ background: "#1A1F26", borderRadius: 16, padding: 32, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 24, color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
                <ShieldCheck color="#74CC10" size={28} /> Términos y Condiciones
              </h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#74CC10", marginTop: 8, flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 6 }}>Participación y Cuentas</h4>
                    <p style={{ color: "#E5E7EB", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                      Para participar es obligatorio crear una cuenta con un correo válido. Cada usuario es responsable de la seguridad de sus credenciales. No se permiten multicuentas para un mismo torneo.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#74CC10", marginTop: 8, flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 6 }}>Cierre de Pronósticos</h4>
                    <p style={{ color: "#E5E7EB", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                      Los pronósticos se bloquean irreversiblemente <strong>30 minutos antes</strong> de la hora oficial programada para el pitazo inicial de cada partido.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#74CC10", marginTop: 8, flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 6 }}>Partidos Aplazados o Suspendidos</h4>
                    <p style={{ color: "#E5E7EB", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                      Si un partido es suspendido tras haber iniciado, el resultado se mantendrá en espera hasta resolución oficial. Si es aplazado antes de iniciar, las predicciones se mantendrán hasta la nueva fecha programada.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#74CC10", marginTop: 8, flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 6 }}>Liquidación de Puntos</h4>
                    <p style={{ color: "#E5E7EB", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                      Los puntos se calculan basándose estrictamente en el resultado final del tiempo regular (90 minutos + adición). En fases eliminatorias, NO se cuenta el tiempo extra ni penales, a menos que se especifique lo contrario.
                    </p>
                  </div>
                </div>

              </div>

              <div style={{ marginTop: 24, padding: 16, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, color: "#FCA5A5", fontSize: "0.85rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0 }}>
                  <strong>Importante:</strong> La administración se reserva el derecho de anular partidos de la polla o ajustar puntajes si se comprueba manipulación de resultados externos o fallas en el sistema oficial de la plataforma.
                </p>
              </div>
            </div>

          </main>
        </section>

        {/* FOOTER */}
        <footer style={{ 
          marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "60px 20px 20px", 
          background: "#04060A", color: "#6B7280", fontSize: "0.85rem" 
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            
            {/* Coljuegos Banner */}
            <div style={{ 
              display: "flex", alignItems: "center", justifyContent: "center", gap: 16, 
              background: "#111418", padding: "16px 24px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)",
              marginBottom: 40, flexWrap: "wrap", textAlign: "center"
            }}>
              <div style={{ background: "#EF4444", color: "#FFF", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.8rem" }}>
                18+
              </div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#FFF", letterSpacing: "1px" }}>
                Coljueg<span style={{ color: "#EFCC36" }}>O</span>s
              </div>
              <span style={{ color: "#E5E7EB", fontWeight: 600, fontSize: "0.95rem" }}>
                Juega bien. Ser responsable es parte del juego...
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 40 }}>
              
              {/* Columna Logo & Desc */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <img src="/logo_principal_recortado.webp" alt="Logo" style={{ height: 36, width: "auto" }} />
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#FFF" }}>
                    CLUB<span style={{ color: "#74CC10" }}>90</span>MINUTOS
                  </span>
                </div>
                <p style={{ color: "#9CA3AF", lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
                  La plataforma de pronósticos de fútbol más divertida. Compite con amigos en todas las ligas.
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <a href="#" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", textDecoration: "none" }}><Facebook size={18} /></a>
                  <a href="#" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", textDecoration: "none" }}><Instagram size={18} /></a>
                  <a href="#" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", textDecoration: "none" }}><Twitter size={18} /></a>
                  <a href="#" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", textDecoration: "none" }}><Music2 size={18} /></a>
                  <a href="#" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", textDecoration: "none" }}><Youtube size={18} /></a>
                </div>
              </div>

              {/* Columna Plataforma */}
              <div>
                <h4 style={{ color: "#FFF", fontWeight: 800, fontSize: "0.95rem", marginBottom: 20, letterSpacing: "1px" }}>PLATAFORMA</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Link href="#" style={{ color: "#9CA3AF", textDecoration: "none", transition: "color 0.2s" }}>Quiénes Somos</Link>
                  <Link href="#" style={{ color: "#9CA3AF", textDecoration: "none", transition: "color 0.2s" }}>Reglas y Puntajes</Link>
                </div>
              </div>

              {/* Columna Soporte */}
              <div>
                <h4 style={{ color: "#FFF", fontWeight: 800, fontSize: "0.95rem", marginBottom: 20, letterSpacing: "1px" }}>SOPORTE</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Link href="#" style={{ color: "#9CA3AF", textDecoration: "none", transition: "color 0.2s" }}>FAQ's</Link>
                </div>
              </div>

              {/* Columna Legal */}
              <div>
                <h4 style={{ color: "#FFF", fontWeight: 800, fontSize: "0.95rem", marginBottom: 20, letterSpacing: "1px" }}>LEGAL</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Link href="#" style={{ color: "#9CA3AF", textDecoration: "none", transition: "color 0.2s" }}>Política de privacidad</Link>
                  <Link href="#" style={{ color: "#9CA3AF", textDecoration: "none", transition: "color 0.2s" }}>Política de Cookies</Link>
                  <Link href="/terminos" style={{ color: "#9CA3AF", textDecoration: "none", transition: "color 0.2s" }}>Términos y Condiciones</Link>
                </div>
              </div>

            </div>

            {/* Copyright Row */}
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
