import React from "react";
import { Download } from "lucide-react";
import { AFICHE } from "./afichePaleta";

// Piezas visuales compartidas por los 3 componentes "Afiche". Antes cada
// componente reimplementaba esta barra de descarga, el logo circular y el
// pie de página por separado, cada uno con su propia combinación de hex.

export function BarraDescargaAfiche({
  titulo,
  subtitulo,
  generando,
  onDescargar,
}: {
  titulo: string;
  subtitulo: string;
  generando: boolean;
  onDescargar: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        background: AFICHE.grisOscuro,
        padding: "12px 20px",
        borderRadius: 8,
        border: `1px solid ${AFICHE.grisMedio}33`,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <h4 style={{ color: AFICHE.blanco, margin: 0, fontSize: "0.95rem", fontFamily: AFICHE.fuenteBody, fontWeight: 700 }}>
          {titulo}
        </h4>
        <span style={{ color: AFICHE.grisMedio, fontSize: "0.8rem", fontFamily: AFICHE.fuenteBody }}>{subtitulo}</span>
      </div>
      <button
        onClick={onDescargar}
        disabled={generando}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: AFICHE.verdeClub,
          color: AFICHE.negroEstadio,
          fontWeight: 700,
          fontFamily: AFICHE.fuenteBody,
          padding: "8px 16px",
          borderRadius: 999,
          border: "none",
          cursor: generando ? "not-allowed" : "pointer",
          fontSize: "0.85rem",
          opacity: generando ? 0.6 : 1,
        }}
      >
        <Download size={16} /> {generando ? "Generando…" : "Descargar imagen"}
      </button>
    </div>
  );
}

export function LogoClub90({ tamano = 56 }: { tamano?: number }) {
  return (
    <div
      style={{
        width: tamano,
        height: tamano,
        borderRadius: "50%",
        background: AFICHE.negroEstadio,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${AFICHE.verdeClub}`,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <img
        src="/marca/logo-club90-circular-transparente.webp"
        alt="Club 90 Minutos"
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
        crossOrigin="anonymous"
      />
    </div>
  );
}

export function BadgeTorneo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        background: AFICHE.grisOscuro,
        padding: "8px 16px",
        borderRadius: 8,
        border: `1px solid ${AFICHE.grisMedio}33`,
      }}
    >
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: AFICHE.grisMedio, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: AFICHE.fuenteBody, marginBottom: 2 }}>
        Torneo oficial
      </div>
      <div style={{ fontSize: "1.15rem", fontWeight: 800, color: AFICHE.blanco, fontFamily: AFICHE.fuenteDisplay, lineHeight: 1 }}>
        Liga BetPlay
      </div>
      <div style={{ fontSize: "0.7rem", color: AFICHE.verdeClub, fontFamily: AFICHE.fuenteMono, marginTop: 4, letterSpacing: "0.04em" }}>
        DIMAYOR · 2026-II
      </div>
    </div>
  );
}

export function PieAfiche({ mensaje }: { mensaje: string }) {
  return (
    <div
      style={{
        backgroundColor: AFICHE.negroEstadio,
        color: AFICHE.blanco,
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: `2px solid ${AFICHE.verdeClub}`,
        flexWrap: "wrap",
        gap: 12,
        fontFamily: AFICHE.fuenteBody,
      }}
    >
      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: AFICHE.grisClaro }}>{mensaje}</span>
      <span style={{ fontSize: "0.75rem", color: AFICHE.grisMedio, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Club 90 Minutos · Liga BetPlay Dimayor 2026-II
      </span>
    </div>
  );
}
