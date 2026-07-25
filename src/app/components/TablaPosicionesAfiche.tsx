"use client";

import React, { useRef } from "react";
import { Printer, Trophy, Award, Users, Flame, CheckSquare, Target, UserCheck, Star, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

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
  nombrePolla?: string;
  onDescargarExcelPronosticos?: () => void;
}

export default function TablaPosicionesAfiche({
  tabla,
  nombrePolla = "Polla Liga BetPlay Dimayor",
  onDescargarExcelPronosticos,
}: TablaPosicionesAficheProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    if (onDescargarExcelPronosticos) {
      onDescargarExcelPronosticos();
      return;
    }
    const rowsHtml = tabla
      .map(
        (row) => `
        <tr style="background-color: ${
          row.posicion === 1
            ? "#fffbeb"
            : row.posicion === 2
            ? "#f8fafc"
            : row.posicion === 3
            ? "#fff7ed"
            : "#ffffff"
        }; border-bottom: 1px solid #cbd5e1;">
          <td style="font-weight: bold; text-align: center;">${row.posicion}</td>
          <td style="text-align: left; font-weight: bold;">${
            row.posicion === 1 ? "🥇 " : row.posicion === 2 ? "🥈 " : row.posicion === 3 ? "🥉 " : ""
          }${row.nombre_completo}</td>
          <td style="text-align: center;">${row.pts_campeon}</td>
          <td style="text-align: center;">${row.pts_finalistas}</td>
          <td style="text-align: center;">${row.pts_clasificados}</td>
          <td style="text-align: center;">${row.pts_goleador_torneo}</td>
          <td style="text-align: center;">${row.pts_resultado_exacto}</td>
          <td style="text-align: center;">${row.pts_ganador_partido}</td>
          <td style="text-align: center;">${row.pts_goleador_partido}</td>
          <td style="text-align: center; font-weight: bold; background-color: #fef3c7; color: #0b1e36; font-size: 14px;">${row.pts_total}</td>
        </tr>
      `
      )
      .join("");

    const htmlTable = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Tabla de Posiciones</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th, td { border: 1px solid #cbd5e1; padding: 10px; font-family: Arial, sans-serif; font-size: 12px; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <th colspan="10" style="background-color: #0b1e36; color: #ffffff; font-size: 20px; font-weight: bold; text-align: center; padding: 16px;">
              TABLA DE POSICIONES
            </th>
          </tr>
          <tr>
            <th colspan="10" style="background-color: #f5b000; color: #0b1e36; font-size: 13px; font-weight: bold; text-align: center; padding: 6px;">
              ${nombrePolla.toUpperCase()}
            </th>
          </tr>
          <tr><td colspan="10" style="border:none; height:12px;"></td></tr>
          <tr>
            <th colspan="2" style="background-color: #0b1e36; border: 1px solid #0b1e36;"></th>
            <th colspan="7" style="background-color: #102a45; color: #60a5fa; font-size: 12px; font-weight: bold; text-align: center; padding: 8px;">
              PUNTOS GANADOS POR CATEGORÍA
            </th>
            <th style="background-color: #0b1e36; border: 1px solid #0b1e36;"></th>
          </tr>
          <tr style="font-weight: bold; color: #ffffff;">
            <th style="background-color: #0b1e36; width: 50px; text-align: center;">Pos.</th>
            <th style="background-color: #0b1e36; width: 200px; text-align: left;">Jugador / Participante</th>
            <th style="background-color: #d97706; width: 90px; text-align: center;">🏆 Campeón</th>
            <th style="background-color: #64748b; width: 90px; text-align: center;">🥈 Finalistas</th>
            <th style="background-color: #166534; width: 120px; text-align: center;">👥 Clas. Cuadrangulares</th>
            <th style="background-color: #15803d; width: 110px; text-align: center;">👟 Goleador Torneo</th>
            <th style="background-color: #b91c1c; width: 110px; text-align: center;">📋 Marcador Exacto</th>
            <th style="background-color: #c2410c; width: 110px; text-align: center;">⚽ Ganador Partido</th>
            <th style="background-color: #6b21a8; width: 110px; text-align: center;">⚽ Goleador Partido</th>
            <th style="background-color: #0b1e36; color: #ffd700; width: 110px; text-align: center; font-size: 13px;">⭐ Total Puntos</th>
          </tr>
          ${rowsHtml}
          <tr><td colspan="10" style="border:none; height:12px;"></td></tr>
          <tr>
            <th colspan="10" style="background-color: #0b1e36; color: #ffffff; font-size: 12px; font-weight: bold; text-align: center; padding: 10px;">
              U N I D O S &nbsp; P O R &nbsp; E L &nbsp; F Ú T B O L ™ &nbsp; — &nbsp; LIGA BETPLAY DIMAYOR
            </th>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlTable], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Tabla_de_Posiciones_Liga_BetPlay.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
            Diseño optimizado para vista, capturas de pantalla, Excel e impresión
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {onDescargarExcelPronosticos && (
            <button
              onClick={handleDownloadExcel}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#16a34a",
                color: "#ffffff",
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              <FileSpreadsheet size={16} /> Descargar Excel (.xlsx)
            </button>
          )}
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
          <div style={{ textAlign: "right" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "2.2rem",
                fontWeight: 900,
                letterSpacing: "1px",
                color: "#ffffff",
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              TABLA DE POSICIONES
            </h1>
            <div
              style={{
                display: "inline-block",
                marginTop: 4,
                padding: "2px 14px",
                backgroundColor: "#f5b000",
                color: "#0b1e36",
                fontWeight: 900,
                fontSize: "0.95rem",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {nombrePolla}
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
                    backgroundColor: "#0b1e36",
                    color: "#ffffff",
                    borderRight: "1px solid #1e3a8a",
                  }}
                >
                  Pos.
                </th>

                {/* JUGADOR */}
                <th
                  style={{
                    minWidth: "160px",
                    padding: "10px 14px",
                    backgroundColor: "#0b1e36",
                    color: "#ffffff",
                    textAlign: "left",
                    borderRight: "2px solid #0f2942",
                  }}
                >
                  Jugador / Participante
                </th>

                {/* CAMPEÓN (DORADO) */}
                <th
                  style={{
                    width: "90px",
                    padding: "8px 4px",
                    backgroundColor: "#1e3a5f",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#d97706",
                      borderRadius: "6px",
                      padding: "4px",
                      margin: "0 auto 4px",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <Trophy size={16} />
                  </div>
                  Campeón (30P)
                </th>

                {/* FINALISTAS (PLATA) */}
                <th
                  style={{
                    width: "90px",
                    padding: "8px 4px",
                    backgroundColor: "#1e3a5f",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#64748b",
                      borderRadius: "6px",
                      padding: "4px",
                      margin: "0 auto 4px",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <Award size={16} />
                  </div>
                  Finalistas (25P)
                </th>

                {/* CLASIFICADOS CUADRANGULARES (VERDE) */}
                <th
                  style={{
                    width: "110px",
                    padding: "8px 4px",
                    backgroundColor: "#166534",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#22c55e",
                      borderRadius: "6px",
                      padding: "4px",
                      margin: "0 auto 4px",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#052e16",
                    }}
                  >
                    <Users size={16} />
                  </div>
                  Clas. Cuadrangulares (20P)
                </th>

                {/* GOLEADOR TORNEO (VERDE CLARO) */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#15803d",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#84cc16",
                      borderRadius: "6px",
                      padding: "4px",
                      margin: "0 auto 4px",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#1a2e05",
                    }}
                  >
                    <Flame size={16} />
                  </div>
                  Goleador Torneo (15P)
                </th>

                {/* RESULTADOS EXACTOS (ROJO) */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#b91c1c",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#ef4444",
                      borderRadius: "6px",
                      padding: "4px",
                      margin: "0 auto 4px",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <CheckSquare size={16} />
                  </div>
                  Marcador Exacto (5P)
                </th>

                {/* GANADOR PARTIDO (NARANJA) */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#c2410c",
                    color: "#ffffff",
                    borderRight: "1px solid #334155",
                  }}
                >
                  <div
                    style={{
                      background: "#f97316",
                      borderRadius: "6px",
                      padding: "4px",
                      margin: "0 auto 4px",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <Target size={16} />
                  </div>
                  Ganador Partido (3P)
                </th>

                {/* GOLEADOR PARTIDO (MORADO) */}
                <th
                  style={{
                    width: "100px",
                    padding: "8px 4px",
                    backgroundColor: "#6b21a8",
                    color: "#ffffff",
                    borderRight: "2px solid #0f2942",
                  }}
                >
                  <div
                    style={{
                      background: "#a855f7",
                      borderRadius: "6px",
                      padding: "4px",
                      margin: "0 auto 4px",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <UserCheck size={16} />
                  </div>
                  Goleador Partido (2P)
                </th>

                {/* TOTAL PUNTOS (AZUL MARINO / DORADO) */}
                <th
                  style={{
                    width: "110px",
                    padding: "10px 6px",
                    backgroundColor: "#0b1e36",
                    color: "#ffd700",
                    fontWeight: 900,
                    fontSize: "0.85rem",
                  }}
                >
                  <div
                    style={{
                      background: "#f5b000",
                      borderRadius: "6px",
                      padding: "4px",
                      margin: "0 auto 4px",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0b1e36",
                    }}
                  >
                    <Star size={16} />
                  </div>
                  Total Puntos
                </th>
              </tr>
            </thead>

            <tbody>
              {tabla.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: 30, color: "#64748b" }}>
                    No hay registros de puntajes aún.
                  </td>
                </tr>
              ) : (
                tabla.map((row, idx) => {
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
                          color: esPrimero
                            ? "#b45309"
                            : esSegundo
                            ? "#475569"
                            : esTercero
                            ? "#c2410c"
                            : "#0f172a",
                          borderRight: "1px solid #cbd5e1",
                        }}
                      >
                        {row.posicion}
                      </td>

                      {/* NOMBRE COMPLETO */}
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          color: "#0f172a",
                          borderRight: "2px solid #cbd5e1",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {esPrimero && <span>🥇</span>}
                          {esSegundo && <span>🥈</span>}
                          {esTercero && <span>🥉</span>}
                          <span>{row.nombre_completo}</span>
                        </div>
                      </td>

                      {/* PTS CAMPEÓN */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #e2e8f0" }}>
                        {row.pts_campeon}
                      </td>

                      {/* PTS FINALISTAS */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #e2e8f0" }}>
                        {row.pts_finalistas}
                      </td>

                      {/* PTS CLASIFICADOS */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #e2e8f0" }}>
                        {row.pts_clasificados}
                      </td>

                      {/* PTS GOLEADOR TORNEO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #e2e8f0" }}>
                        {row.pts_goleador_torneo}
                      </td>

                      {/* PTS RESULTADO EXACTO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #e2e8f0" }}>
                        {row.pts_resultado_exacto}
                      </td>

                      {/* PTS GANADOR PARTIDO */}
                      <td style={{ padding: "10px 4px", borderRight: "1px solid #e2e8f0" }}>
                        {row.pts_ganador_partido}
                      </td>

                      {/* PTS GOLEADOR PARTIDO */}
                      <td style={{ padding: "10px 4px", borderRight: "2px solid #cbd5e1" }}>
                        {row.pts_goleador_partido}
                      </td>

                      {/* TOTAL PUNTOS */}
                      <td
                        style={{
                          padding: "10px 6px",
                          fontWeight: 900,
                          fontSize: "1rem",
                          color: "#0f172a",
                          backgroundColor: esPrimero ? "#fef3c7" : "#f1f5f9",
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
