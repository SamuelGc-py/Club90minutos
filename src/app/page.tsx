"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, ArrowRight, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function LandingPage() {
  // Simple countdown logic for the visual effect
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--noche)",
      color: "var(--tiza)",
      fontFamily: "var(--fuente-base)",
      overflowX: "hidden"
    }}>
      {/* NAVBAR */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "transparent",
        position: "absolute",
        width: "100%",
        top: 0,
        zIndex: 50
      }}>
        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img 
            src="/logo_principal_recortado.webp" 
            alt="Club 90 Minutos" 
            style={{ height: 50, objectFit: "contain" }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span style={{ fontWeight: 900, fontSize: "1.2rem", color: "#fff" }}>CLUB 90 MINUTOS</span>
        </div>

        {/* LINKS (Desktop) */}
        <div style={{ display: "none", gap: "2rem", alignItems: "center", "@media (min-width: 1024px)": { display: "flex" } }} className="nav-links">
          <Link href="#" style={{ color: "var(--tiza)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>JUEGA AQUÍ ▾</Link>
          <Link href="#" style={{ color: "var(--tiza)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>COMO VAS! ▾</Link>
          <Link href="/dashboard" style={{ color: "var(--tiza)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>GRUPOS PRIVADOS</Link>
          <Link href="#" style={{ color: "var(--tiza)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>ESTADÍSTICAS ▾</Link>
          <Link href="/reglas" style={{ color: "var(--tiza)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>REGLAS</Link>
        </div>

        {/* SOCIAL & CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", gap: 8, opacity: 0.7 }}>
            <Facebook size={18} />
            <Instagram size={18} />
            <Twitter size={18} />
            <Youtube size={18} />
          </div>
          <Link href="/registro" className="btn" style={{ 
            padding: "10px 20px", 
            background: "var(--cancha)", 
            color: "#000", 
            fontWeight: 800,
            borderRadius: "8px",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 0 15px rgba(29, 185, 84, 0.4)"
          }}>
            ⚽ JUGAR GRATIS
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        paddingTop: "120px",
        paddingBottom: "60px",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}>
        <div style={{
          width: "100%",
          padding: "0 2rem",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          zIndex: 10
        }}>
          
          {/* LADO IZQUIERDO: TEXTOS */}
          <div style={{ flex: "1 1 50%", minWidth: "300px", paddingRight: "4rem", display: "flex", flexDirection: "column", gap: 24, position: "relative", zIndex: 20 }}>
            
            {/* Tag */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "rgba(29, 185, 84, 0.1)",
              border: "1px solid var(--cancha-borde)",
              borderRadius: 30,
              color: "var(--cancha)",
              fontWeight: 700,
              fontSize: "0.85rem",
              width: "fit-content"
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cancha)", boxShadow: "0 0 10px var(--cancha)" }} />
              MUNDIAL 2026 • PRONÓSTICOS EN VIVO
            </div>

            {/* Titular Principal */}
            <h1 style={{
              margin: 0,
              fontSize: "clamp(3rem, 6vw, 6rem)",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-1px",
              color: "rgba(255,255,255,0.2)", // Color apagado para la primera linea
              textTransform: "uppercase"
            }}>
              Demuestra que
              <br/>
              <span style={{ 
                color: "var(--cancha)", 
                textShadow: "0 0 40px rgba(29, 185, 84, 0.4)",
                display: "block",
                marginTop: 10
              }}>
                Sabes de fútbol
              </span>
            </h1>

            {/* Subtítulo */}
            <p style={{
              fontSize: "1.2rem",
              color: "var(--tiza)",
              lineHeight: 1.5,
              maxWidth: 500,
              margin: 0
            }}>
              Crea tu <strong>polla</strong> y compite <strong>en vivo</strong> con amigos, oficina o familia.
              <br/>¡Gratis!
            </p>

            {/* Botones de acción */}
            <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
              <Link href="/registro" style={{
                padding: "16px 32px",
                background: "var(--cancha)",
                color: "#000",
                fontWeight: 800,
                fontSize: "1.1rem",
                borderRadius: 12,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 0 25px rgba(29, 185, 84, 0.4)",
                transition: "transform 0.2s"
              }}>
                ⚽ JUGAR GRATIS
              </Link>
              <Link href="/dashboard" style={{
                padding: "16px 32px",
                background: "#7c3aed", /* Morado estilo imagen */
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.1rem",
                borderRadius: 12,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 0 25px rgba(124, 58, 237, 0.4)",
                transition: "transform 0.2s"
              }}>
                🏆 CREAR MI LIGA
              </Link>
            </div>

            {/* Countdown removido según petición */}
          </div>

          {/* LADO DERECHO: IMAGEN HERO */}
          <div style={{ 
            flex: "1 1 50%", 
            minWidth: "300px",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "2rem"
          }}>
            {/* Glow detrás del personaje */}
            <div style={{
              position: "absolute",
              width: "80%",
              height: "80%",
              background: "var(--cancha)",
              filter: "blur(120px)",
              opacity: 0.15,
              borderRadius: "50%",
              zIndex: 0
            }} />
            
            <img 
              src="/images/chilena_3d.png" 
              alt="Personaje"
              style={{
                width: "100%",
                maxWidth: 600,
                height: "auto",
                position: "relative",
                zIndex: 10,
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))"
              }}
              onError={(e) => {
                e.currentTarget.src = "/images/balon_3d.png"; // Fallback si no está la chilena
              }}
            />
          </div>

        </div>

        {/* Partículas de fondo (simuladas con CSS) */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(circle at 70% 30%, rgba(29, 185, 84, 0.05) 0%, transparent 50%)",
          zIndex: 1,
          pointerEvents: "none"
        }} />
      </section>
      
      {/* Añadir media query simple global para ocultar links en móvil */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .nav-links { display: none !important; }
        }
      `}} />
    </div>
  );
}

