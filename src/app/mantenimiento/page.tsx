"use client";

import React from "react";
import { Wrench } from "lucide-react";

export default function MantenimientoPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#04060A",
        color: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <header
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <picture>
          <source
            srcSet="/marca/logo-club90-escudo-transparente.webp"
            type="image/webp"
          />
          <img
            src="/marca/logo-club90-escudo-transparente.png"
            alt="Logo Club 90 Minutos"
            style={{ height: 44, width: "auto" }}
          />
        </picture>
        <span
          style={{
            fontFamily: "var(--font-display, 'Orbitron', sans-serif)",
            fontWeight: 800,
            fontSize: "1.2rem",
            letterSpacing: "0.5px",
          }}
        >
          CLUB<span style={{ color: "#74CC10" }}>90</span>MINUTOS
        </span>
      </header>

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 520,
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            background: "rgba(116, 204, 16, 0.12)",
            color: "#74CC10",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            border: "1px solid rgba(116, 204, 16, 0.3)",
            boxShadow: "none",
          }}
        >
          <Wrench size={44} />
        </div>

        <h1
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "2.2rem",
            fontWeight: 900,
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          Sitio en <span style={{ color: "#74CC10" }}>Mantenimiento</span>
        </h1>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "1.05rem",
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Estamos realizando una optimización programada en la base de datos para mejorar la velocidad y estabilidad del sitio.
          <br /><br />
          <strong style={{ color: "#E5E7EB" }}>Estaremos de vuelta en unos minutos.</strong> ¡Gracias por tu paciencia!
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            fontSize: "0.88rem",
            color: "#6B7280",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#EFCC36",
              display: "inline-block",
            }}
          />
          Actualización de Servidor en Proceso
        </div>
      </main>
    </div>
  );
}
