"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { TerminosCompletos } from "../components/TerminosCompletos";

export default function TerminosPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#04060A", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <header style={{ 
        position: "sticky", top: 0, zIndex: 100, 
        background: "rgba(4, 6, 10, 0.8)", backdropFilter: "blur(12px)", 
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
            <picture>
              <source srcSet="/marca/logo-club90-escudo-transparente.webp" type="image/webp" />
              <img 
                src="/marca/logo-club90-escudo-transparente.png" 
                alt="Logo Club 90 Minutos" 
                style={{ height: 40, width: "auto" }}
              />
            </picture>
            <span style={{ fontFamily: "var(--font-display, 'Orbitron', sans-serif)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.5px", color: "var(--color-blanco)" }}>
              CLUB<span style={{ color: "var(--color-verde-club)" }}>90</span>MINUTOS
            </span>
          </Link>
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{ 
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", background: "transparent", color: "#FFFFFF", 
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", 
            fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s"
          }}>
            <ArrowLeft size={16} /> Volver
          </button>
        </Link>
      </header>

      {/* CONTENT */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "60px 20px" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <ShieldCheck size={48} color="#74CC10" />
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "2.5rem", fontWeight: 900, margin: 0 }}>
            TÉRMINOS Y CONDICIONES
          </h1>
        </div>

        <div style={{ 
          background: "#1A1F26", borderRadius: 16, padding: "40px", border: "1px solid rgba(255,255,255,0.05)",
          color: "#E5E7EB", lineHeight: 1.7, fontSize: "1rem"
        }}>
          <TerminosCompletos />
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ 
        borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 20px", 
        textAlign: "center", color: "#6B7280", fontSize: "0.85rem", background: "#04060A"
      }}>
        &copy; {new Date().getFullYear()} Club 90 Minutos. Todos los derechos reservados.
      </footer>
    </div>
  );
}
