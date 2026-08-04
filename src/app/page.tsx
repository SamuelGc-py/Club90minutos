"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Users, Star, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, var(--noche) 0%, var(--noche-2) 100%)",
      color: "var(--tiza)",
      fontFamily: "var(--fuente-base)"
    }}>
      {/* NAVBAR */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--esp-4) var(--esp-6)",
        background: "rgba(19, 32, 48, 0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--linea)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Trophy color="var(--cancha)" size={24} />
          <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, letterSpacing: "-0.5px" }}>
            CLUB 90 MINUTOS
          </h1>
        </div>
        <div style={{ display: "flex", gap: "var(--esp-4)" }}>
          <Link href="/dashboard" className="btn btn-secondary" style={{ padding: "8px 16px", textDecoration: "none" }}>
            Ingresar
          </Link>
          <Link href="/registro" className="btn btn-primary" style={{ padding: "8px 16px", textDecoration: "none" }}>
            Registrarse
          </Link>
        </div>
      </nav>

      {/* HERO SECTION COMPLETO */}
      <section style={{
        padding: "clamp(30px, 8vw, 80px) 20px clamp(40px, 10vw, 100px)",
        textAlign: "center",
        maxWidth: 1000,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--esp-6)",
        position: "relative"
      }}>
        {/* Glow de fondo para matar el espacio negro */}
        <div style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translate(-50%, 0)",
          width: "100%",
          maxWidth: 600,
          height: 300,
          background: "radial-gradient(circle, rgba(29, 185, 84, 0.15) 0%, rgba(0,0,0,0) 70%)",
          zIndex: 0,
          pointerEvents: "none"
        }}></div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--esp-5)" }}>
          <div style={{
            display: "inline-block",
            padding: "6px 14px",
            background: "var(--cancha-suave)",
            color: "var(--cancha)",
            borderRadius: 20,
            fontSize: "0.85rem",
            fontWeight: 700,
            border: "1px solid var(--cancha-borde)",
            boxShadow: "0 0 20px rgba(29, 185, 84, 0.2)"
          }}>
            🔥 LIGA BETPLAY & CHAMPIONS LEAGUE
          </div>
          
          <h2 style={{
            margin: 0,
            fontSize: "clamp(2.2rem, 8vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-1px",
            background: "linear-gradient(135deg, #ffffff 0%, #8ba3b4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))"
          }}>
            Demuestra lo que sabes <br/> de fútbol.
          </h2>
          
          <p style={{
            fontSize: "clamp(1rem, 3vw, 1.15rem)",
            color: "var(--graderia)",
            maxWidth: 600,
            margin: 0,
            lineHeight: 1.6
          }}>
            Únete a la comunidad exclusiva de pronósticos. Acierta resultados, compite con tus amigos y gana los premios acumulados de cada torneo.
          </p>

          <div style={{ display: "flex", gap: "var(--esp-4)", flexWrap: "wrap", justifyContent: "center", marginTop: "var(--esp-2)" }}>
            <Link href="/registro" className="btn btn-primary" style={{ 
              padding: "16px 32px", 
              fontSize: "1.1rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              borderRadius: "var(--radio-card)",
              boxShadow: "0 8px 20px rgba(29, 185, 84, 0.3)"
            }}>
              Jugar Ahora <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* MOCKUP VISUAL PARA LLENAR ESPACIO */}
        <div style={{
          marginTop: "clamp(30px, 6vw, 60px)",
          width: "100%",
          maxWidth: 700,
          background: "var(--tribuna)",
          border: "1px solid var(--linea-fuerte)",
          borderRadius: "var(--radio-card)",
          padding: "var(--esp-4)",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(29, 185, 84, 0.1) inset",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          textAlign: "left"
        }}>
          {/* Header del Mockup */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--linea)", paddingBottom: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--graderia)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <Trophy size={14} color="var(--trofeo)" /> LIGA BETPLAY - JORNADA 10
            </span>
            <span style={{ fontSize: "0.75rem", background: "var(--azul-suave)", color: "var(--azul)", padding: "4px 8px", borderRadius: 10, fontWeight: 800 }}>HOY 20:00</span>
          </div>
          
          {/* Partido Mockup */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--linea)", display: "flex", alignItems: "center", justifyContent: "center" }}>🛡️</div>
              <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Bucaramanga</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ background: "var(--noche)", border: "1px solid var(--linea-fuerte)", width: 45, height: 50, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 900 }}>2</div>
                <span style={{ color: "var(--graderia)", fontWeight: 900 }}>-</span>
                <div style={{ background: "var(--noche)", border: "1px solid var(--linea-fuerte)", width: 45, height: 50, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 900 }}>1</div>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--cancha)", marginTop: 6, fontWeight: 700 }}>Tu Pronóstico</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "flex-end" }}>
              <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Cúcuta Dep.</span>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--linea)", display: "flex", alignItems: "center", justifyContent: "center" }}>⚔️</div>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section style={{
        padding: "60px 20px",
        background: "var(--tribuna)",
        borderTop: "1px solid var(--linea)",
        borderBottom: "1px solid var(--linea)"
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h3 style={{ textAlign: "center", fontSize: "2rem", marginBottom: 40, fontWeight: 800 }}>
            ¿Cómo Funciona?
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "var(--esp-6)",
          }}>
            <div style={{ background: "var(--tribuna-2)", padding: 30, borderRadius: "var(--radio-card)", textAlign: "center", border: "1px solid var(--linea)" }}>
              <Users size={40} color="var(--cancha)" style={{ margin: "0 auto 20px" }} />
              <h4 style={{ fontSize: "1.2rem", marginBottom: 10 }}>1. Reserva tu Cupo</h4>
              <p style={{ color: "var(--graderia)", fontSize: "0.95rem" }}>
                Regístrate y contacta a los administradores para activar tu cuenta oficial en el torneo.
              </p>
            </div>
            
            <div style={{ background: "var(--tribuna-2)", padding: 30, borderRadius: "var(--radio-card)", textAlign: "center", border: "1px solid var(--linea)" }}>
              <HelpCircle size={40} color="var(--azul)" style={{ margin: "0 auto 20px" }} />
              <h4 style={{ fontSize: "1.2rem", marginBottom: 10 }}>2. Pronostica</h4>
              <p style={{ color: "var(--graderia)", fontSize: "0.95rem" }}>
                Ingresa tus marcadores antes del inicio de cada partido oficial de la fecha.
              </p>
            </div>
            
            <div style={{ background: "var(--tribuna-2)", padding: 30, borderRadius: "var(--radio-card)", textAlign: "center", border: "1px solid var(--linea)" }}>
              <Star size={40} color="var(--trofeo)" style={{ margin: "0 auto 20px" }} />
              <h4 style={{ fontSize: "1.2rem", marginBottom: 10 }}>3. Suma y Gana</h4>
              <p style={{ color: "var(--graderia)", fontSize: "0.95rem" }}>
                Gana puntos por acertar el ganador, el marcador exacto y los goleadores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "40px 20px",
        textAlign: "center",
        color: "var(--graderia-2)",
        fontSize: "0.9rem"
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 20 }}>
          <Link href="/terminos" style={{ color: "var(--tiza)", textDecoration: "none" }}>Términos y Condiciones</Link>
          <Link href="/reglas" style={{ color: "var(--tiza)", textDecoration: "none" }}>Reglamento de Puntos</Link>
        </div>
        <p>© 2026 Club 90 Minutos. Todos los derechos reservados.</p>
        <p style={{ fontSize: "0.8rem", marginTop: 5, opacity: 0.7 }}>
          <ShieldCheck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
          Plataforma Segura y Privada.
        </p>
      </footer>
    </div>
  );
}
