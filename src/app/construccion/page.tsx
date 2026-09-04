"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";

export default function ConstruccionPage() {
  return (
    <div data-design="redesign" style={{
      minHeight: "100vh", background: "#04060A", color: "#FFFFFF",
      fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column"
    }}>
      <header style={{ 
        padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <picture>
            <source srcSet="/marca/logo-club90-escudo-transparente.webp" type="image/webp" />
            <img 
              src="/marca/logo-club90-escudo-transparente.png" 
              alt="Logo Club 90 Minutos" 
              style={{ height: 40, width: "auto" }}
            />
          </picture>
          <span style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.5px" }}>
            CLUB<span style={{ color: "var(--color-verde-club)" }}>90</span>MINUTOS
          </span>
        </div>
      </header>

      <main style={{ 
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "20px", textAlign: "center"
      }}>
        <div style={{ 
          width: 80, height: 80, background: "rgba(239, 204, 54, 0.1)", color: "#EFCC36", 
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24
        }}>
          <Hammer size={40} />
        </div>
        
        <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "2.5rem", fontWeight: 900, marginBottom: 16 }}>
          Página en <span style={{ color: "#EFCC36" }}>Construcción</span>
        </h1>
        
        <p style={{ color: "#E5E7EB", fontSize: "1.1rem", maxWidth: 500, lineHeight: 1.6, marginBottom: 40 }}>
          Estamos trabajando duro para traer la polla de la Champions League. ¡Pronto estará disponible para que demuestres cuánto sabes del fútbol europeo!
        </p>
        
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{ 
            display: "flex", alignItems: "center", gap: 8,
            padding: "14px 24px", background: "transparent", color: "#FFFFFF", 
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", 
            fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "all 0.2s"
          }}>
            <ArrowLeft size={18} /> Volver al Inicio
          </button>
        </Link>
      </main>
    </div>
  );
}
