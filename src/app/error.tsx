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
        background: "#0b1520",
        color: "#ffffff",
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
          background: "#132030",
          border: "1px solid #1e3145",
          borderRadius: "16px",
          padding: "32px 24px",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚽</div>
        <h2 style={{ color: "#38bdf8", fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }}>
          Polla Liga BetPlay
        </h2>
        <h3 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700, marginBottom: "12px" }}>
          Nueva Versión Disponible
        </h3>
        <p style={{ color: "#8ba3b4", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "24px" }}>
          Se ha actualizado el sistema de pronósticos. Haz clic en el botón de abajo para sincronizar tu aplicación.
        </p>

        <button
          type="button"
          onClick={handleReset}
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            border: "1px solid #34d399",
            borderRadius: "10px",
            fontSize: "1rem",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
          }}
        >
          🔄 Actualizar y Entrar
        </button>
      </div>
    </div>
  );
}
