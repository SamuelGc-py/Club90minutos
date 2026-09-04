"use client";

import { useEffect, useState } from "react";

// Controla el atributo data-design en <html> para alternar entre el diseño
// actual ("current", valor por defecto) y el rediseño ("redesign") en vivo,
// sin tocar el servidor. Deliberadamente NO lee cookies ni corre en un
// Server Component: forzar renderizado dinámico por request ya tumbó el
// proceso de Node en Hostinger una vez (ver .agents/NOTA_FIX_SITIO_CAIDO.md).
// Todo pasa después de la hidratación, así que no afecta el HTML estático.

const STORAGE_KEY = "club90_design_version";

export default function DesignToggle() {
  const [version, setVersion] = useState<"current" | "redesign" | null>(null);

  useEffect(() => {
    let inicial: "current" | "redesign" = "current";
    try {
      const params = new URLSearchParams(window.location.search);
      const deUrl = params.get("design");
      if (deUrl === "redesign" || deUrl === "current") {
        inicial = deUrl;
        localStorage.setItem(STORAGE_KEY, deUrl);
      } else {
        const guardado = localStorage.getItem(STORAGE_KEY);
        if (guardado === "redesign" || guardado === "current") {
          inicial = guardado;
        }
      }
    } catch {
      // localStorage puede fallar (modo privado, storage bloqueado) — se queda en "current".
    }
    setVersion(inicial);
    document.documentElement.setAttribute("data-design", inicial);
  }, []);

  const cambiar = (nuevo: "current" | "redesign") => {
    try {
      localStorage.setItem(STORAGE_KEY, nuevo);
    } catch {
      // ignorar si localStorage no está disponible
    }
    document.documentElement.setAttribute("data-design", nuevo);
    setVersion(nuevo);
  };

  // Antes de montar (SSR/primer render) no se sabe la preferencia guardada —
  // no mostrar nada todavía para evitar un parpadeo del control mismo.
  if (version === null) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(4, 6, 10, 0.92)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 999,
        padding: "6px 10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        fontFamily: "system-ui, sans-serif",
        fontSize: "0.75rem",
      }}
    >
      {version === "redesign" && (
        <span style={{ color: "#EFCC36", fontWeight: 700 }}>Vista previa</span>
      )}
      <button
        type="button"
        onClick={() => cambiar(version === "redesign" ? "current" : "redesign")}
        style={{
          background: version === "redesign" ? "#74CC10" : "rgba(255,255,255,0.12)",
          color: version === "redesign" ? "#04060A" : "#fff",
          border: "none",
          borderRadius: 999,
          padding: "6px 12px",
          fontWeight: 700,
          fontSize: "0.75rem",
          cursor: "pointer",
        }}
      >
        {version === "redesign" ? "Diseño nuevo (beta)" : "Diseño actual"}
      </button>
    </div>
  );
}
