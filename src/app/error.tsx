"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client error caught by Next.js Error Boundary:", error);
    
    // Si el error es por desacople de chunks (nueva versión desplegada), recargar automáticamente una vez
    const isChunkError =
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("ChunkLoadError") ||
      error?.name === "ChunkLoadError";

    if (isChunkError) {
      const hasReloaded = sessionStorage.getItem("chunk_reload");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload", "true");
        window.location.reload();
      }
    }
  }, [error]);

  const handleReset = () => {
    try {
      sessionStorage.clear();
    } catch (_) {}
    window.location.href = "/";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#04060A",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: "#1A1F26",
          border: "1px solid var(--line-strong)",
          borderRadius: "16px",
          padding: "32px 24px",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "none",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}></div>
        <h2 style={{ color: "#438AFF", fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }}>
          Club 90 Minutos
        </h2>
        <h3 style={{ color: "#FFFFFF", fontSize: "1.1rem", fontWeight: 700, marginBottom: "12px" }}>
          Nueva Versión Disponible
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "24px" }}>
          Se ha actualizado el sistema de pronósticos. Haz clic en el botón de abajo para sincronizar tu aplicación.
        </p>

        <button
          type="button"
          onClick={handleReset}
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "#74CC10",
            color: "#04060A",
            border: "1px solid #74CC10",
            borderRadius: "10px",
            fontSize: "1rem",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "none",
          }}
        >
          Actualizar y Entrar
        </button>
      </div>
    </div>
  );
}
