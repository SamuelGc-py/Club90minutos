import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toPng } from "html-to-image";

interface PronosticosTorneoAficheProps {
  predicciones: any[];
}

export default function PronosticosTorneoAfiche({
  predicciones,
}: PronosticosTorneoAficheProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [generandoImagen, setGenerandoImagen] = useState(false);

  const handleDescargarImagen = async () => {
    if (!printRef.current) return;
    try {
      setGenerandoImagen(true);
      const dataUrl = await toPng(printRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement("a");
      link.download = `Predicciones_Torneo_Club90Minutos.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al generar la imagen del afiche:", err);
      alert("No se pudo generar la imagen. Intenta desde un computador si estás en móvil.");
    } finally {
      setGenerandoImagen(false);
    }
  };

  return (
    <div style={{ margin: "20px 0" }}>
      {/* BARRA DE ACCIONES DE DESCARGA */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          background: "#04060A",
          padding: "12px 20px",
          borderRadius: "12px",
          border: "1px solid #1A1F26",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h4 style={{ color: "#FFFFFF", margin: 0, fontSize: "1rem" }}>
            Afiche Oficial de Predicciones del Torneo
          </h4>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Resumen general de apuestas para descargar
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleDescargarImagen}
            disabled={generandoImagen}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#74CC10",
              color: "#04060A",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: generandoImagen ? "not-allowed" : "pointer",
              fontSize: "0.85rem",
              boxShadow: "none",
            }}
          >
            <Camera size={16} /> {generandoImagen ? "Generando imagen…" : "Descargar imagen (.png)"}
          </button>
        </div>
      </div>

      {/* CONTENEDOR AFICHE LIGA BETPLAY */}
      <div style={{ overflowX: "auto" }}>
      <div
        ref={printRef}
        className="afiche-container"
        style={{
          minWidth: "850px",
          backgroundColor: "#04060A",
          color: "#FFFFFF",
          fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "none",
          border: "2px solid #1A1F26",
        }}
      >
        {/* CABECERA CON CURVAS Y TROFEO BETPLAY */}
        <div
          style={{
            position: "relative",
            background: "#1A1F26",
            padding: "24px 32px 24px",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "4px solid #EFCC36",
          }}
        >
          {/* LOGO CLUB 90 MINUTOS A LA IZQUIERDA */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "#1A1F26",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "none",
                border: "3px solid #EFCC36",
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
          </div>

          {/* TÍTULO PRINCIPAL */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
            <div
              style={{
                color: "#EFCC36",
                fontWeight: 900,
                fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontFamily: "var(--font-display)",
                textShadow: "none",
                lineHeight: 1,
                textAlign: "center"
              }}
            >
              Predicciones de Oro
            </div>
            
            <h2
              style={{
                margin: "12px 0 0 0",
                fontSize: "1.2rem",
                fontWeight: 900,
                color: "#FFFFFF",
                textTransform: "uppercase",
                lineHeight: 1,
                textShadow: "none",
                letterSpacing: "1px",
                textAlign: "center"
              }}
            >
              Resumen Final del Campeonato
            </h2>
          </div>

          {/* LIGA BETPLAY A LA DERECHA */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", background: "rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "none"}}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#E5E7EB", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>
                Torneo Oficial
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#EFCC36", lineHeight: 1 }}>
                Liga BetPlay
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <span style={{ background: "#1A1F26", color: "#FFFFFF", padding: "3px 10px", fontSize: "0.8rem", fontWeight: 800, borderRadius: 6, letterSpacing: "0.5px" }}>DIMAYOR</span>
                <span style={{ background: "#74CC10", color: "#04060A", padding: "3px 10px", fontSize: "0.8rem", fontWeight: 800, borderRadius: 6 }}>2026-II</span>
              </div>
            </div>
          </div>
        </div>

        {/* ESTRUCTURA DE TABLA CON PREDICCIONES */}
        <div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              {/* FILA SUPERIOR: SUPER BANNER */}
              <tr style={{ backgroundColor: "#1A1F26", color: "#FFFFFF" }}>
                <th
                  colSpan={4}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.9rem",
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    backgroundColor: "#1A1F26",
                    color: "#438AFF",
                    borderBottom: "2px solid #438AFF",
                    textAlign: "center"
                  }}
                >
                  Pronósticos Registrados de los Participantes
                </th>
              </tr>

              {/* FILA DE CABECERA DE COLUMNAS */}
              <tr style={{ fontWeight: 800, fontSize: "0.85rem", textAlign: "center", backgroundColor: "#1A1F26", color: "#EFCC36" }}>
                <th style={{ padding: "12px 16px", borderRight: "1px solid var(--line-strong)", textAlign: "left" }}>Participante</th>
                <th style={{ padding: "12px 16px", borderRight: "1px solid var(--line-strong)" }}>Campeón</th>
                <th style={{ padding: "12px 16px", borderRight: "1px solid var(--line-strong)" }}>Subcampeón</th>
                <th style={{ padding: "12px 16px" }}>Goleador del Torneo</th>
              </tr>
            </thead>

            <tbody>
              {(!predicciones || predicciones.length === 0) ? (
                <tr>
                  <td colSpan={4} style={{ padding: 30, color: "var(--text-muted)", textAlign: "center", fontSize: "1rem" }}>
                    Nadie envió pronóstico para el torneo.
                  </td>
                </tr>
              ) : (
                predicciones.map((p: any, idx: number) => {
                  const esPar = idx % 2 === 0;
                  const subcampeon = p.campeon?.nombre === p.finalista_1?.nombre 
                    ? p.finalista_2?.nombre 
                    : p.finalista_1?.nombre;
                  
                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: esPar ? "transparent" : "rgba(255, 255, 255, 0.03)",
                        borderBottom: "1px solid #1A1F26",
                        fontSize: "0.92rem",
                        fontWeight: 600,
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: "#FFFFFF", borderRight: "1px solid var(--line-strong)", display: "flex", alignItems: "center", gap: 10 }}>
                        {p.usuario?.nombre_completo || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 900, color: "#EFCC36", fontSize: "1rem", borderRight: "1px solid var(--line-strong)" }}>
                        {p.campeon?.nombre || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", borderRight: "1px solid var(--line-strong)", color: "#E5E7EB" }}>
                        {subcampeon || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#74CC10", fontWeight: 800, textAlign: "center" }}>
                        {p.goleador_torneo?.nombre || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PIE DE PÁGINA DEL AFICHE ESTILO LIGA BETPLAY */}
        <div
          style={{
            position: "relative",
            backgroundColor: "#04060A",
            color: "#FFFFFF",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "3px solid #EFCC36",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.3rem" }}></span>
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: 900,
                color: "#FFFFFF",
                fontStyle: "italic",
                letterSpacing: "0.5px",
              }}
            >
              ¡ESTO ES FÚTBOL CON ESTEROIDES!{" "}
              <span style={{ color: "#EFCC36" }}>
                ¿QUIÉN SE LLEVARÁ LA GLORIA?
              </span>
            </span>
          </div>

          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Club 90 Minutos • Liga BetPlay Dimayor 2026-II
          </div>
        </div>

        {/* TIRA DE BORDES MULTICOLOR BOTTOM */}
        <div style={{ display: "flex", height: "6px", width: "100%" }}>
          <div style={{ flex: 1, backgroundColor: "#74CC10" }}></div>
          <div style={{ flex: 1, backgroundColor: "#1A1F26" }}></div>
          <div style={{ flex: 1, backgroundColor: "#EFCC36" }}></div>
          <div style={{ flex: 1, backgroundColor: "#EA3D35" }}></div>
        </div>
      </div>
      </div>
    </div>
  );
}
