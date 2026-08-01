import React, { useRef, useState } from "react";
import { Printer, Trophy, Award, Users, Flame, CheckSquare, Target, UserCheck, Star, Camera } from "lucide-react";
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
                    <React.Fragment key={row.usuario_id}>
                      <tr
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

                      {/* ACCIÓN VER PRONÓSTICOS */}
                      <td style={{ padding: "8px 6px", textAlign: "center", borderLeft: "1px solid #cbd5e1" }}>
                        <button
                          type="button"
                          onClick={() => setUsuariosDesplegados(prev => ({ ...prev, [row.usuario_id]: !usuariosDesplegados[row.usuario_id] }))}
                          style={{
                            background: usuariosDesplegados[row.usuario_id]
                              ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                              : "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 12px",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {usuariosDesplegados[row.usuario_id] ? "❌ Cerrar" : "👁️ Ver Pronósticos"}
                        </button>
                      </td>
                    </tr>

                    {/* PANEL EXPANDIBLE DE PRONÓSTICOS DE ESTE JUGADOR */}
                    {usuariosDesplegados[row.usuario_id] && (
                      <tr key={`desplegado-${row.usuario_id}`} style={{ backgroundColor: "#0b192c" }}>
                        <td colSpan={11} style={{ padding: "16px 20px", color: "#ffffff", textAlign: "left" }}>
                          <div
                            style={{
                              background: "#0f233a",
                              border: "2px solid #38bdf8",
                              borderRadius: 12,
                              padding: 20,
                              boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px dashed rgba(255,255,255,0.15)", paddingBottom: 10, flexWrap: "wrap", gap: 8 }}>
                              <div>
                                <h4 style={{ margin: 0, color: "#38bdf8", fontSize: "1.1rem", fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
                                  📋 Pronósticos Registrados de {row.nombre_completo}
                                </h4>
                                <span style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
                                  {row.correo}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setUsuariosDesplegados(prev => ({ ...prev, [row.usuario_id]: false }))}
                                style={{
                                  background: "rgba(255, 255, 255, 0.08)",
                                  border: "1px solid #94a3b8",
                                  color: "#ffffff",
                                  padding: "4px 10px",
                                  borderRadius: 6,
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                ✕ Cerrar Vista
                              </button>
                            </div>

                            {/* PRONÓSTICO INICIAL TORNEO */}
                            {(() => {
                              const pi = prediccionesIniciales.find((p: any) => p.usuario_id === row.usuario_id || p.usuario?.correo === row.correo);
                              return (
                                <div style={{ background: "rgba(255, 255, 255, 0.04)", borderRadius: 10, padding: 14, marginBottom: 16, border: "1px solid rgba(245, 176, 0, 0.3)" }}>
                                  <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#f5b000", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                                    🏆 PRONÓSTICO INICIAL DEL TORNEO
                                  </div>
                                  {pi ? (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, fontSize: "0.85rem" }}>
                                      <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <span style={{ color: "#94a3b8", display: "block", fontSize: "0.75rem", fontWeight: 700 }}>🥇 CAMPEÓN PREDICHO</span>
                                        <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>{pi.campeon?.nombre || "No seleccionado"}</strong>
                                      </div>
                                      <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <span style={{ color: "#94a3b8", display: "block", fontSize: "0.75rem", fontWeight: 700 }}>🥈 FINALISTA 1</span>
                                        <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>{pi.finalista_1?.nombre || "No seleccionado"}</strong>
                                      </div>
                                      <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <span style={{ color: "#94a3b8", display: "block", fontSize: "0.75rem", fontWeight: 700 }}>🥈 FINALISTA 2</span>
                                        <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>{pi.finalista_2?.nombre || "No seleccionado"}</strong>
                                      </div>
                                      <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <span style={{ color: "#94a3b8", display: "block", fontSize: "0.75rem", fontWeight: 700 }}>👟 GOLEADOR DEL TORNEO</span>
                                        <strong style={{ color: "#34d399", fontSize: "0.95rem" }}>{pi.goleador_torneo?.nombre || "No seleccionado"}</strong>
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontStyle: "italic" }}>
                                      Sin pronóstico de torneo registrado.
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* PRONÓSTICOS FECHA 2 (PARTIDOS) */}
                            <div>
                              <div style={{ fontSize: "0.88rem", fontWeight: 900, color: "#34d399", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                                ⚽ PRONÓSTICOS DE PARTIDOS (FECHA 2)
                              </div>

                              {(() => {
                                const listaMatch = prediccionesPartidos.filter((p: any) => p.usuario_id === row.usuario_id || p.usuario?.correo === row.correo);
                                if (listaMatch.length === 0) {
                                  return (
                                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic", background: "rgba(0,0,0,0.3)", padding: 14, borderRadius: 8, textAlign: "center" }}>
                                      No hay pronósticos de partidos guardados para este participante aún.
                                    </div>
                                  );
                                }

                                return (
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                                    {listaMatch.map((pm: any) => {
                                      const local = pm.partido?.equipo_local?.nombre || "Local";
                                      const visitante = pm.partido?.equipo_visitante?.nombre || "Visitante";
                                      const marcador = `${pm.goles_local_predicho} - ${pm.goles_visitante_predicho}`;
                                      const goleador = pm.jugador_goleador?.nombre || "Sin goleador (0 - 0)";

                                      return (
                                        <div
                                          key={pm.id || pm.partido_id}
                                          style={{
                                            background: "rgba(0,0,0,0.4)",
                                            border: "1px solid rgba(56, 189, 248, 0.3)",
                                            borderRadius: 8,
                                            padding: 14,
                                            fontSize: "0.85rem",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                          }}
                                        >
                                          <div style={{ fontWeight: 800, color: "#ffffff", marginBottom: 8, borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: 6, fontSize: "0.9rem" }}>
                                            🏟️ {local} vs {visitante}
                                          </div>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                            <span style={{ color: "#94a3b8" }}>Marcador Predicho:</span>
                                            <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)", padding: "2px 10px", borderRadius: 6, fontWeight: 900, fontSize: "0.95rem" }}>
                                              {marcador}
                                            </span>
                                          </div>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ color: "#94a3b8" }}>Goleador Predicho:</span>
                                            <span style={{ color: "#38bdf8", fontWeight: 700, textAlign: "right" }}>{goleador}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
