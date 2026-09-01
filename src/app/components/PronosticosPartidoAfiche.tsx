import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toPng } from "html-to-image";

interface Equipo {
  id: number;
  nombre: string;
  escudo_url: string;
}

interface Partido {
  id: number;
  equipo_local: Equipo;
  equipo_visitante: Equipo;
  fecha_hora_partido: string;
  estado: string;
  goles_local?: number;
  goles_visitante?: number;
}

interface Pronostico {
  usuario: {
    nombre_completo: string;
  };
  goles_local_predicho: string | number;
  goles_visitante_predicho: string | number;
  jugador_goleador?: {
    nombre: string;
  };
}

interface PronosticosPartidoAficheProps {
  partido: Partido;
  pronosticos: Pronostico[];
  obtenerNombreGoleador: (p: any) => string;
}

export default function PronosticosPartidoAfiche({
  partido,
  pronosticos,
  obtenerNombreGoleador,
}: PronosticosPartidoAficheProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [generandoImagen, setGenerandoImagen] = useState(false);

  const handleDescargarImagen = async () => {
    if (!printRef.current) return;
    try {
      setGenerandoImagen(true);
      const dataUrl = await toPng(printRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement("a");
      const local = partido.equipo_local.nombre.replace(/\s+/g, "");
      const visitante = partido.equipo_visitante.nombre.replace(/\s+/g, "");
      link.download = `Pronosticos_${local}_vs_${visitante}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al generar la imagen del afiche:", err);
      alert("No se pudo generar la imagen. Intenta desde un computador si estás en móvil.");
    } finally {
      setGenerandoImagen(false);
    }
  };

  function formatearFechaPartido(iso: string) {
    if (!iso) return "";
    const [y, m, d] = iso.split("T")[0].split("-");
    const dObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dObj.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });
  }

  function formatearHoraPartido(iso: string) {
    if (!iso) return "";
    const t = iso.split("T")[1];
    if (!t) return "";
    const [h, min] = t.split(":");
    const dObj = new Date();
    dObj.setHours(Number(h));
    dObj.setMinutes(Number(min));
    return dObj.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={{ margin: "20px 0" }}>
      {/* BARRA DE ACCIONES DE DESCARGA */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          background: "#0f172a",
          padding: "12px 20px",
          borderRadius: "12px",
          border: "1px solid #1e293b",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h4 style={{ color: "#f8fafc", margin: 0, fontSize: "1rem" }}>
            🏆 Afiche Oficial de Pronósticos
          </h4>
          <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
            Diseño optimizado para imagen PNG
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
              backgroundColor: "#10b981",
              color: "#ffffff",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: generandoImagen ? "not-allowed" : "pointer",
              fontSize: "0.85rem",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            <Camera size={16} /> {generandoImagen ? "Generando Imagen..." : "📸 Descargar Imagen (.png)"}
          </button>
        </div>
      </div>

      {/* CONTENEDOR AFICHE LIGA BETPLAY */}
      <div style={{ overflowX: "auto" }}>
      <div
        ref={printRef}
        className="afiche-container"
        style={{
          minWidth: "800px",
          backgroundColor: "#06101e",
          color: "#ffffff",
          fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          border: "2px solid #0f2942",
        }}
      >
        {/* CABECERA CON CURVAS Y TROFEO BETPLAY */}
        <div
          style={{
            position: "relative",
            background: "linear-gradient(135deg, #0b1e36 0%, #153b66 60%, #0d2747 100%)",
            padding: "24px 32px 24px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "4px solid #f5b000",
          }}
        >
          {/* LOGO CLUB 90 MINUTOS A LA IZQUIERDA */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "#0b1e36",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                border: "3px solid #f5b000",
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

          {/* TÍTULO PRINCIPAL VS (EQUIPOS) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 48, height: 48, objectFit: "contain" }} crossOrigin="anonymous" />
              <div
                style={{
                  color: "#f5b000",
                  fontWeight: 900,
                  fontSize: "3.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  fontFamily: "'Brush Script MT', 'Caveat', cursive",
                  textShadow: "3px 3px 6px rgba(0,0,0,0.8)",
                  lineHeight: 1
                }}
              >
                VS
              </div>
              <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 48, height: 48, objectFit: "contain" }} crossOrigin="anonymous" />
            </div>
            
            <h2
              style={{
                margin: "12px 0 0 0",
                fontSize: "1.4rem",
                fontWeight: 900,
                color: "#ffffff",
                textTransform: "uppercase",
                lineHeight: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                letterSpacing: "1px",
                textAlign: "center"
              }}
            >
              {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
            </h2>
            <div style={{ color: "#a5b4fc", fontSize: "0.95rem", fontWeight: 700, marginTop: 8 }}>
               📅 {formatearFechaPartido(partido.fecha_hora_partido)} · 🕒 {formatearHoraPartido(partido.fecha_hora_partido)}
            </div>
          </div>

          {/* LIGA BETPLAY A LA DERECHA */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", background: "rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>
                Torneo Oficial
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f5b000", fontStyle: "italic", lineHeight: 1 }}>
                Liga BetPlay
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <span style={{ background: "#1e3a8a", color: "#fff", padding: "3px 10px", fontSize: "0.8rem", fontWeight: 800, borderRadius: 6, letterSpacing: "0.5px" }}>DIMAYOR</span>
                <span style={{ background: "#16a34a", color: "#fff", padding: "3px 10px", fontSize: "0.8rem", fontWeight: 800, borderRadius: 6 }}>2026-II</span>
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
              <tr style={{ backgroundColor: "#0b1e36", color: "#ffffff" }}>
                <th
                  colSpan={4}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.9rem",
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    backgroundColor: "#102a45",
                    color: "#60a5fa",
                    borderBottom: "2px solid #38bdf8",
                    textAlign: "center"
                  }}
                >
                  Pronósticos Registrados de los Participantes
                </th>
              </tr>

              {/* FILA DE CABECERA DE COLUMNAS */}
              <tr style={{ fontWeight: 800, fontSize: "0.85rem", textAlign: "center", backgroundColor: "#1c2b39", color: "#f5b000" }}>
                <th style={{ padding: "12px 16px", borderRight: "1px solid #334155", textAlign: "left" }}>Participante</th>
                <th style={{ padding: "12px 16px", borderRight: "1px solid #334155" }}>Marcador Exacto</th>
                <th style={{ padding: "12px 16px", borderRight: "1px solid #334155" }}>Ganador Predicho</th>
                <th style={{ padding: "12px 16px" }}>Goleador Apostado</th>
              </tr>
            </thead>

            <tbody>
              {pronosticos.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 30, color: "#64748b", textAlign: "center", fontSize: "1rem" }}>
                    Nadie envió pronóstico para este partido.
                  </td>
                </tr>
              ) : (
                pronosticos.map((p, idx) => {
                  const esPar = idx % 2 === 0;
                  const gL = Number(p.goles_local_predicho);
                  const gV = Number(p.goles_visitante_predicho);
                  let ganadorTexto = "Empate";
                  if (!isNaN(gL) && !isNaN(gV)) {
                    if (gL > gV) ganadorTexto = `Gana ${partido.equipo_local.nombre}`;
                    else if (gV > gL) ganadorTexto = `Gana ${partido.equipo_visitante.nombre}`;
                  }
                  
                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: esPar ? "transparent" : "rgba(255, 255, 255, 0.03)",
                        borderBottom: "1px solid #1e293b",
                        fontSize: "0.92rem",
                        fontWeight: 600,
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: "#ffffff", borderRight: "1px solid #334155" }}>
                        {p.usuario?.nombre_completo}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 900, color: "#34d399", fontSize: "1.1rem", borderRight: "1px solid #334155" }}>
                        {p.goles_local_predicho} - {p.goles_visitante_predicho}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", borderRight: "1px solid #334155" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 10, background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 800, fontSize: "0.85rem" }}>
                          {ganadorTexto}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#f5b000", fontWeight: 700, textAlign: "center" }}>
                        {obtenerNombreGoleador(p)}
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
            backgroundColor: "#06101e",
            color: "#ffffff",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "3px solid #f5b000",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.3rem" }}>⚽</span>
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: 900,
                color: "#ffffff",
                fontStyle: "italic",
                letterSpacing: "0.5px",
              }}
            >
              ¡ESTO ES FÚTBOL CON ESTEROIDES!{" "}
              <span style={{ color: "#f5b000" }}>
                ¿QUIÉN ACERTARÁ LA PREDICCIÓN?
              </span>
            </span>
          </div>

          <div
            style={{
              fontSize: "0.8rem",
              color: "#94a3b8",
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
          <div style={{ flex: 1, backgroundColor: "#15803d" }}></div>
          <div style={{ flex: 1, backgroundColor: "#0b1e36" }}></div>
          <div style={{ flex: 1, backgroundColor: "#f5b000" }}></div>
          <div style={{ flex: 1, backgroundColor: "#b91c1c" }}></div>
        </div>
      </div>
      </div>
    </div>
  );
}
