import React, { useRef, useState } from "react";
import { Printer, Trophy, Camera } from "lucide-react";
import { toPng } from "html-to-image";

export interface FilaTablaPosiciones {
  posicion: number;
  usuario_id: number;
  nombre_completo: string;
  correo: string;
  pts_campeon: number;
  pts_finalistas: number;
  pts_clasificados: number;
  pts_goleador_torneo: number;
  pts_resultado_exacto: number;
  pts_ganador_partido: number;
  pts_goleador_partido: number;
  pts_total: number;
}

interface TablaPosicionesAficheProps {
  tabla: FilaTablaPosiciones[];
  prediccionesPartidos?: any[];
  prediccionesIniciales?: any[];
  nombrePolla?: string;
  onDescargarExcelPronosticos?: () => void;
}

// La tabla fija ha sido movida a @/lib/tablaFija.ts para evitar errores de importación en componentes de servidor.

export default function TablaPosicionesAfiche({
  tabla,
  prediccionesPartidos = [],
  prediccionesIniciales = [],
  nombrePolla = "Club 90 Minutos Dimayor",
}: TablaPosicionesAficheProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [generandoImagen, setGenerandoImagen] = useState(false);
  const [usuariosDesplegados, setUsuariosDesplegados] = useState<Record<number, boolean>>({});

  const handlePrint = () => {
    window.print();
  };

  const handleDescargarImagen = async () => {
    if (!printRef.current) return;
    try {
      setGenerandoImagen(true);
      const dataUrl = await toPng(printRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement("a");
      const fecha = new Date().toISOString().split("T")[0];
      link.download = `Tabla_de_Posiciones_Polla_BetPlay_${fecha}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al generar la imagen de la tabla:", err);
      alert("No se pudo generar la imagen. Puedes usar la opción Imprimir o exportar PDF.");
    } finally {
      setGenerandoImagen(false);
    }
  };

  const tablaFinal: FilaTablaPosiciones[] = tabla || [];

  return (
    <div style={{ margin: "20px 0" }}>
      {/* BARRA DE ACCIONES DE IMPRESIÓN / DESCARGA */}
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
            Afiche Oficial de Posiciones
          </h4>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Diseño optimizado para afiche, vista, imagen PNG e impresión
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

          <button
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#EFCC36",
              color: "#04060A",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            <Printer size={16} /> Imprimir o exportar PDF
          </button>
        </div>
      </div>

      {/* CONTENEDOR AFICHE LIGA BETPLAY */}
      <div
        ref={printRef}
        className="afiche-container"
        style={{
          width: "100%",
          backgroundColor: "#04060A",
          color: "#FFFFFF",
          fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "none",
          border: "2px solid #1A1F26",
        }}
      >
        {/* PODIO: TOP 3 DESTACADO ARRIBA DE LA TABLA */}
        {tablaFinal.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: "20px 24px 4px",
              background: "#1A1F26",
              flexWrap: "wrap",
            }}
          >
            {tablaFinal.slice(0, 3).map((row) => {
              const medalla = row.posicion === 1 ? "" : row.posicion === 2 ? "" : "";
              const acento = row.posicion === 1 ? "#EFCC36" : row.posicion === 2 ? "#E5E7EB" : "#EA3D35";
              return (
                <div
                  key={row.usuario_id}
                  style={{
                    flex: "1 1 160px",
                    minWidth: 160,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${acento}66`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: "1.8rem" }}>{medalla}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.nombre_completo}
                    </div>
                    <div style={{ color: acento, fontWeight: 900, fontSize: "1.2rem" }}>
                      {row.pts_total} pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CABECERA CON CURVAS Y TROFEO BETPLAY */}
        <div
          style={{
            position: "relative",
            background: "#1A1F26",
            padding: "24px 32px 18px",
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
                marginTop: 2,
              }}
            >
              <img
                src="/marca/logo-club90-circular-transparente.webp"
                alt="Club 90 Minutos"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            </div>
          </div>

          {/* TÍTULO PRINCIPAL ESTILO BANNER */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "2.2rem",
                fontWeight: 900,
                color: "#FFFFFF",
                textTransform: "uppercase",
                lineHeight: 1,
                textShadow: "none",
                letterSpacing: "1px"
              }}
            >
              TABLA DE POSICIONES
            </h1>
            <div
              style={{
                color: "#EFCC36",
                fontWeight: 900,
                fontSize: "2.5rem",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontFamily: "var(--font-display)",
                textShadow: "none",
                marginTop: "-5px",
                lineHeight: 1
              }}
            >
              POLLA
            </div>
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

        {/* ESTRUCTURA DE TABLA CON BANNER DE CATEGORÍAS */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              {/* FILA SUPERIOR: SUPER BANNER PUNTOS GANADOS POR CATEGORÍA */}
              <tr style={{ backgroundColor: "#1A1F26", color: "#FFFFFF" }}>
                <th
                  colSpan={2}
                  style={{
                    padding: "10px",
                    borderRight: "2px solid #1A1F26",
                    borderBottom: "1px solid #1A1F26",
                  }}
                ></th>
                <th
                  colSpan={7}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.85rem",
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    backgroundColor: "#1A1F26",
                    color: "#438AFF",
                    borderBottom: "2px solid #438AFF",
                  }}
                >
                  Puntos Ganados Por Categoría
                </th>
                <th
                  style={{
                    backgroundColor: "#1A1F26",
                    borderLeft: "2px solid #1A1F26",
                    borderBottom: "1px solid #1A1F26",
                  }}
                ></th>
              </tr>

              {/* FILA DE CABECERA DE COLUMNAS CON ICONOS Y COLORES AFICHE */}
              <tr style={{ fontWeight: 800, fontSize: "0.78rem" }}>
                {/* POSICIÓN */}
                <th
                  style={{
                    width: "48px",
                    padding: "10px 6px",
                    backgroundColor: "#1A1F26",
                    color: "#EFCC36",
                    borderRight: "1px solid var(--line-strong)",
                    fontSize: "1rem"
                  }}
                >
                  Pos.
                </th>

                {/* JUGADOR */}
                <th
                  style={{
                    minWidth: "160px",
                    padding: "10px 14px",
                    backgroundColor: "#1A1F26",
                    color: "#FFFFFF",
                    textAlign: "center",
                    borderRight: "1px solid var(--line-strong)",
                  }}
                >
                  <div
                    style={{
                      background: "#438AFF",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#04060A",
                      border: "2px solid #438AFF"
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                  Jugador
                </th>

                {/* CAMPEÓN */}
                <th
                  style={{
                    width: "90px",
                    padding: "8px 4px",
                    backgroundColor: "#1A1F26",
                    color: "#FFFFFF",
                    borderRight: "1px solid var(--line-strong)",
                  }}
                >
                  <div
                    style={{
                      background: "#438AFF",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#EFCC36",
                      border: "2px solid #438AFF"
                    }}
                  >
                    <Trophy size={20} fill="#EFCC36" />
                  </div>
                  Campeón
                </th>

                {/* FINALISTAS */}
                <th
                  style={{
                    width: "90px",
                    padding: "8px 4px",
                    backgroundColor: "#1A1F26",
                    color: "#FFFFFF",
                    borderRight: "1px solid var(--line-strong)",
                  }}
                >
                  <div
                    style={{
                      background: "#438AFF",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#E5E7EB",
                      border: "2px solid #438AFF"
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#E5E7EB" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                  </div>
                  Finalistas
                </th>

                {/* GOLEADOR DEL TORNEO */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#1A1F26",
                    color: "#FFFFFF",
                    borderRight: "1px solid var(--line-strong)",
                  }}
                >
                  <div
                    style={{
                      background: "#438AFF",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#EFCC36",
                      border: "2px solid #438AFF"
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#EFCC36" /></svg>
                  </div>
                  Goleador<br />del Torneo
                </th>

                {/* 8 CLASIFICADOS */}
                <th
                  style={{
                    width: "110px",
                    padding: "8px 4px",
                    backgroundColor: "#1A1F26",
                    color: "#FFFFFF",
                    borderRight: "1px solid var(--line-strong)",
                  }}
                >
                  <div
                    style={{
                      background: "#438AFF",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#74CC10",
                      border: "2px solid #438AFF"
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  8 Clasificados
                </th>

                {/* RESULTADOS CORRECTOS */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#1A1F26",
                    color: "#FFFFFF",
                    borderRight: "1px solid var(--line-strong)",
                  }}
                >
                  <div
                    style={{
                      background: "#438AFF",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#04060A",
                      border: "2px solid #438AFF"
                    }}
                  >
                    <div style={{ background: "#04060A", border: "1px solid #FFFFFF", borderRadius: 4, padding: "2px 4px", fontWeight: 900, fontSize: "0.75rem" }}>2-1</div>
                  </div>
                  Resultados<br />Correctos
                </th>

                {/* GANADOR PARTIDO */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#1A1F26",
                    color: "#FFFFFF",
                    borderRight: "1px solid var(--line-strong)",
                  }}
                >
                  <div
                    style={{
                      background: "#438AFF",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#74CC10",
                      border: "2px solid #438AFF"
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  Ganador<br />Partido
                </th>

                {/* GOLEADORES */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#1A1F26",
                    color: "#FFFFFF",
                    borderRight: "2px solid var(--line-strong)",
                  }}
                >
                  <div
                    style={{
                      background: "#438AFF",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#04060A",
                      border: "2px solid #438AFF"
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="12 4 15 9 20 10 16 14 17 20 12 17 7 20 8 14 4 10 9 9 12 4" /></svg>
                  </div>
                  Goleadores
                </th>

                {/* TOTAL PUNTOS */}
                <th
                  style={{
                    width: "110px",
                    padding: "10px 6px",
                    backgroundColor: "#1A1F26",
                    color: "#EFCC36",
                    fontWeight: 900,
                    fontSize: "0.95rem",
                  }}
                >
                  <div
                    style={{
                      background: "#EFCC36",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#04060A",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#04060A" stroke="#04060A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                  </div>
                  Total<br />Puntos
                </th>
              </tr>
            </thead>

            <tbody>
              {tablaFinal.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: 30, color: "var(--text-muted)" }}>
                    No hay registros de puntajes aún.
                  </td>
                </tr>
              ) : (
                tablaFinal.map((row, idx) => {
                  const esPar = idx % 2 === 0;
                  const esPrimero = row.posicion === 1;
                  const esSegundo = row.posicion === 2;
                  const esTercero = row.posicion === 3;

                  return (
                    <tr
                      key={row.usuario_id}
                      style={{
                        backgroundColor: esPrimero
                          ? "rgba(239, 204, 54, 0.15)" // Oro
                          : esSegundo
                            ? "rgba(229, 231, 235, 0.1)" // Plata
                            : esTercero
                              ? "rgba(234, 61, 53, 0.1)" // Bronce
                              : esPar
                                ? "transparent"
                                : "rgba(255, 255, 255, 0.02)",
                        borderBottom: "1px solid #1A1F26",
                        fontSize: "0.88rem",
                        fontWeight: esPrimero || esSegundo || esTercero ? 700 : 500,
                      }}
                    >
                      {/* POSICIÓN */}
                      <td
                        style={{
                          padding: "10px 4px",
                          fontWeight: 900,
                          color: "#EFCC36",
                          backgroundColor: "#1A1F26",
                          borderRight: "1px solid var(--line-strong)",
                          borderBottom: "1px solid var(--line-strong)"
                        }}
                      >
                        {row.posicion}
                      </td>

                      {/* NOMBRE COMPLETO */}
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          color: "#FFFFFF",
                          borderRight: "1px solid var(--line-strong)",
                          borderBottom: "1px solid var(--line-strong)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{row.nombre_completo}</span>
                        </div>
                      </td>

                      {/* PTS CAMPEÓN */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)", color: "#FFFFFF" }}>
                        {row.pts_campeon}
                      </td>

                      {/* PTS FINALISTAS */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)", color: "#FFFFFF" }}>
                        {row.pts_finalistas}
                      </td>

                      {/* PTS GOLEADOR TORNEO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)", color: "#FFFFFF" }}>
                        {row.pts_goleador_torneo}
                      </td>

                      {/* PTS CLASIFICADOS */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)", color: "#FFFFFF" }}>
                        {row.pts_clasificados}
                      </td>

                      {/* PTS RESULTADO EXACTO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)", color: "#FFFFFF" }}>
                        {row.pts_resultado_exacto}
                      </td>

                      {/* PTS GANADOR PARTIDO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)", color: "#FFFFFF" }}>
                        {row.pts_ganador_partido}
                      </td>

                      {/* PTS GOLEADOR PARTIDO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)", color: "#FFFFFF" }}>
                        {row.pts_goleador_partido}
                      </td>

                      {/* TOTAL PUNTOS */}
                      <td
                        style={{
                          padding: "10px 6px",
                          fontWeight: 900,
                          fontSize: "1.05rem",
                          color: "#FFFFFF",
                          backgroundColor: "transparent",
                          borderBottom: "1px solid var(--line-strong)"
                        }}
                      >
                        {row.pts_total}
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
              ¡PON A PRUEBA TU CONOCIMIENTO{" "}
              <span style={{ color: "#EFCC36" }}>
                Y COMPITE POR LA GRAN PREMIACIÓN!
              </span>
            </span>
            <span style={{ fontSize: "1.2rem" }}></span>
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
  );
}
