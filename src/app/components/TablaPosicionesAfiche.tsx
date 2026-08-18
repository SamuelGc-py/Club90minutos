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
  nombrePolla = "Polla Liga BetPlay Dimayor",
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
      alert("No se pudo generar la imagen. Puedes usar la opción Imprimir / Exportar PDF.");
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
            🏆 Afiche Oficial de Posiciones
          </h4>
          <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
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

          <button
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#f5b000",
              color: "#0f172a",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            <Printer size={16} /> Imprimir / Exportar PDF
          </button>
        </div>
      </div>

      {/* CONTENEDOR AFICHE LIGA BETPLAY */}
      <div
        ref={printRef}
        className="afiche-container"
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          color: "#1e293b",
          fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          border: "2px solid #0f2942",
        }}
      >
        {/* PODIO: TOP 3 DESTACADO ARRIBA DE LA TABLA */}
        {tablaFinal.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: "20px 24px 4px",
              background: "linear-gradient(135deg, #0b1e36 0%, #153b66 100%)",
              flexWrap: "wrap",
            }}
          >
            {tablaFinal.slice(0, 3).map((row) => {
              const medalla = row.posicion === 1 ? "🥇" : row.posicion === 2 ? "🥈" : "🥉";
              const acento = row.posicion === 1 ? "#f5b000" : row.posicion === 2 ? "#cbd5e1" : "#c2410c";
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
                    <div style={{ color: "#ffffff", fontWeight: 800, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
            background: "linear-gradient(135deg, #0b1e36 0%, #153b66 60%, #0d2747 100%)",
            padding: "24px 32px 18px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "4px solid #f5b000",
          }}
        >
          {/* LOGO / COPA LIGA BETPLAY SVG CUSTOM */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "radial-gradient(circle, #fdba74 0%, #ea580c 60%, #9a3412 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(245, 176, 0, 0.4)",
                border: "2px solid #ffd700",
                flexShrink: 0,
              }}
            >
              {/* TROFEO BETPLAY SVG */}
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 3H18V7C18 10.3137 15.3137 13 12 13C8.68629 13 6 10.3137 6 7V3Z" fill="#FFD700" stroke="#78350F" strokeWidth="1.5" />
                <path d="M4 4C4 4 2 5 2 8C2 10.5 4 11 6 10" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 4C20 4 22 5 22 8C22 10.5 20 11 18 10" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 13V18" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
                <path d="M7 21H17L15 18H9L7 21Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
                <circle cx="12" cy="7" r="1.5" fill="#FFFFFF" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  letterSpacing: "2px",
                  color: "#38bdf8",
                  textTransform: "uppercase",
                }}
              >
                Liga BetPlay Dimayor
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#cbd5e1",
                  fontWeight: 600,
                }}
              >
                Clasificación Oficial
              </div>
            </div>
          </div>

          {/* TÍTULO PRINCIPAL ESTILO BANNER */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "2.5rem",
                fontWeight: 900,
                color: "#ffffff",
                textTransform: "uppercase",
                lineHeight: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                fontStyle: "italic",
                letterSpacing: "-1px"
              }}
            >
              TABLA DE POSICIONES
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "-5px" }}>
              <div
                style={{
                  color: "#f5b000",
                  fontWeight: 900,
                  fontSize: "4.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontFamily: "'Brush Script MT', 'Caveat', cursive",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  transform: "rotate(-5deg)",
                  lineHeight: 0.8
                }}
              >
                POLLA
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", background: "#0b1e36", padding: "5px 15px", borderRadius: "8px", border: "2px solid #ffffff" }}>
                 <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#f5b000", fontStyle: "italic", lineHeight: 1 }}>Liga BetPlay</div>
                 <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                   <span style={{ background: "#1e3a8a", color: "#fff", padding: "2px 8px", fontSize: "0.85rem", fontWeight: 800, borderRadius: 4 }}>DIMAYOR</span>
                   <span style={{ background: "#16a34a", color: "#fff", padding: "2px 8px", fontSize: "0.85rem", fontWeight: 800, borderRadius: 4 }}>2026-II</span>
                 </div>
              </div>
            </div>
          </div>
          
          {/* BALON DERECHA */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 100, height: 100, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "3px solid #f5b000" }}>
               <img src="/logo_principal_recortado.webp" alt="Balon" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
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
              <tr style={{ backgroundColor: "#0b1e36", color: "#ffffff" }}>
                <th
                  colSpan={2}
                  style={{
                    padding: "10px",
                    borderRight: "2px solid #1e3a8a",
                    borderBottom: "1px solid #1e3a8a",
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
                    backgroundColor: "#102a45",
                    color: "#60a5fa",
                    borderBottom: "2px solid #38bdf8",
                  }}
                >
                  Puntos Ganados Por Categoría
                </th>
                <th
                  style={{
                    backgroundColor: "#0b1e36",
                    borderLeft: "2px solid #1e3a8a",
                    borderBottom: "1px solid #1e3a8a",
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
                    backgroundColor: "#1c2b39",
                    color: "#f5b000",
                    borderRight: "1px solid #334155",
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
                    backgroundColor: "#1c2b39",
                    color: "#ffffff",
                    textAlign: "center",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#2563eb",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      border: "2px solid #60a5fa"
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  Jugador
                </th>

                {/* CAMPEÓN */}
                <th
                  style={{
                    width: "90px",
                    padding: "8px 4px",
                    backgroundColor: "#1c2b39",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#2563eb",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f5b000",
                      border: "2px solid #60a5fa"
                    }}
                  >
                    <Trophy size={20} fill="#f5b000" />
                  </div>
                  Campeón
                </th>

                {/* FINALISTAS */}
                <th
                  style={{
                    width: "90px",
                    padding: "8px 4px",
                    backgroundColor: "#1c2b39",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#2563eb",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#cbd5e1",
                      border: "2px solid #60a5fa"
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#cbd5e1" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                  </div>
                  Finalistas
                </th>

                {/* GOLEADOR DEL TORNEO */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#1c2b39",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#2563eb",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f5b000",
                      border: "2px solid #60a5fa"
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#f5b000"/></svg>
                  </div>
                  Goleador<br/>del Torneo
                </th>

                {/* 8 CLASIFICADOS */}
                <th
                  style={{
                    width: "110px",
                    padding: "8px 4px",
                    backgroundColor: "#1c2b39",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#2563eb",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#22c55e",
                      border: "2px solid #60a5fa"
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  8 Clasificados
                </th>

                {/* RESULTADOS CORRECTOS */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#1c2b39",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#2563eb",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      border: "2px solid #60a5fa"
                    }}
                  >
                    <div style={{ background: "#000", border: "1px solid #fff", borderRadius: 4, padding: "2px 4px", fontWeight: 900, fontSize: "0.75rem" }}>2-1</div>
                  </div>
                  Resultados<br/>Correctos
                </th>

                {/* GANADOR PARTIDO */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#1c2b39",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#2563eb",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#22c55e",
                      border: "2px solid #60a5fa"
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  Ganador<br/>Partido
                </th>

                {/* GOLEADORES */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#1c2b39",
                    color: "#ffffff",
                    borderRight: "2px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#2563eb",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      border: "2px solid #60a5fa"
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="12 4 15 9 20 10 16 14 17 20 12 17 7 20 8 14 4 10 9 9 12 4"/></svg>
                  </div>
                  Goleadores
                </th>

                {/* TOTAL PUNTOS */}
                <th
                  style={{
                    width: "110px",
                    padding: "10px 6px",
                    backgroundColor: "#14532d",
                    color: "#f5b000",
                    fontWeight: 900,
                    fontSize: "0.95rem",
                  }}
                >
                  <div
                    style={{
                      background: "#f5b000",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#000",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#000" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  </div>
                  Total<br/>Puntos
                </th>
              </tr>
            </thead>

            <tbody>
              {tablaFinal.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: 30, color: "#64748b" }}>
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
                          ? "#fffbeb"
                          : esSegundo
                          ? "#f8fafc"
                          : esTercero
                          ? "#fff7ed"
                          : esPar
                          ? "#ffffff"
                          : "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: "0.88rem",
                        fontWeight: esPrimero || esSegundo || esTercero ? 700 : 500,
                      }}
                    >
                      {/* POSICIÓN */}
                      <td
                        style={{
                          padding: "10px 4px",
                          fontWeight: 900,
                          color: "#f5b000",
                          backgroundColor: "#1c2b39",
                          borderRight: "1px solid #334155",
                          borderBottom: "1px solid #334155"
                        }}
                      >
                        {row.posicion}
                      </td>

                      {/* NOMBRE COMPLETO */}
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          color: "#000",
                          borderRight: "1px solid #cbd5e1",
                          borderBottom: "1px solid #cbd5e1",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{row.nombre_completo}</span>
                        </div>
                      </td>

                      {/* PTS CAMPEÓN */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", color: "#000" }}>
                        {row.pts_campeon}
                      </td>

                      {/* PTS FINALISTAS */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", color: "#000" }}>
                        {row.pts_finalistas}
                      </td>

                      {/* PTS CLASIFICADOS */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", color: "#000" }}>
                        {row.pts_clasificados}
                      </td>

                      {/* PTS GOLEADOR TORNEO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", color: "#000" }}>
                        {row.pts_goleador_torneo}
                      </td>

                      {/* PTS RESULTADO EXACTO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", color: "#000" }}>
                        {row.pts_resultado_exacto}
                      </td>

                      {/* PTS GANADOR PARTIDO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", color: "#000" }}>
                        {row.pts_ganador_partido}
                      </td>

                      {/* PTS GOLEADOR PARTIDO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", color: "#000" }}>
                        {row.pts_goleador_partido}
                      </td>

                      {/* TOTAL PUNTOS */}
                      <td
                        style={{
                          padding: "10px 6px",
                          fontWeight: 900,
                          fontSize: "1.05rem",
                          color: "#000",
                          backgroundColor: row.posicion >= 8 ? "#fecaca" : "#dcfce7",
                          borderBottom: "1px solid #cbd5e1"
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

        {/* PIE DE PÁGINA DEL AFICHE CON FRANJA MULTICOLOR LIGA BETPLAY */}
        <div
          style={{
            position: "relative",
            backgroundColor: "#0b1e36",
            color: "#ffffff",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "3px solid #f5b000",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 800,
              letterSpacing: "3px",
              color: "#e2e8f0",
              textTransform: "uppercase",
            }}
          >
            U N I D O S &nbsp; P O R &nbsp; E L &nbsp; F Ú T B O L ™
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
              fontWeight: 600,
            }}
          >
            Polla Express • Liga BetPlay Dimayor 2026
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
  );
}
