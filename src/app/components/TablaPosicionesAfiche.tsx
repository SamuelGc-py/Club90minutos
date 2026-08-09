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

// TABLA FIJA — actualizada manualmente por el dueño de la polla (Samuel).
// NINGÚN AGENTE debe recalcular ni sobrescribir estos valores automáticamente.
// Ver regla 13 en .agents/AGENTS.md.
// Se exporta para que otras vistas (ej. panel admin) muestren al líder real
// sin mantener una copia separada de estos números.
// Fecha 4 liquidada: Santa Fe 2-0 Boyaca Chico (gol de Hugo Rodallega; el segundo gol fue autogol y no cuenta para goleador).
// Fecha 5 liquidada: Fortaleza 2-0 Cucuta Deportivo (goleador correcto: Richardson Rivas; Harold Berdugo lo acerto).
// Fecha 6 liquidada: Deportes Tolima 2-1 Internacional de Bogota (goles de Ever Valencia y Adrian Parra; descuento de Sanguinetti; nadie predijo a ninguno de los 3).
// Fecha 6 liquidada: Deportivo Cali 2-0 Deportivo Pasto (goles de Steven Rodriguez y Eduard Bello; nadie predijo a Eduard Bello).
export const TABLA_POSICIONES_FIJA: FilaTablaPosiciones[] = [
  { posicion: 1, usuario_id: 2, nombre_completo: "Pedro Cantero", correo: "pedrocanterojr@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 30, pts_ganador_partido: 42, pts_goleador_partido: 22, pts_total: 94 },
  { posicion: 2, usuario_id: 1, nombre_completo: "Nelson Berdugo", correo: "nelson.berdugo05@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 25, pts_ganador_partido: 51, pts_goleador_partido: 14, pts_total: 90 },
  { posicion: 3, usuario_id: 3, nombre_completo: "Juan Hernandez", correo: "juanhermon24@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 25, pts_ganador_partido: 45, pts_goleador_partido: 16, pts_total: 86 },
  { posicion: 4, usuario_id: 6, nombre_completo: "Rene Osorio", correo: "rene26203@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 20, pts_ganador_partido: 42, pts_goleador_partido: 16, pts_total: 78 },
  { posicion: 5, usuario_id: 4, nombre_completo: "Hernando Davila", correo: "nandorafa@hotmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 20, pts_ganador_partido: 39, pts_goleador_partido: 10, pts_total: 69 },
  { posicion: 6, usuario_id: 5, nombre_completo: "Lucas Saavedra", correo: "moisessaavedra496@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 15, pts_ganador_partido: 39, pts_goleador_partido: 12, pts_total: 66 },
  { posicion: 7, usuario_id: 7, nombre_completo: "Romario Gomez", correo: "gomezromario24@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 10, pts_ganador_partido: 33, pts_goleador_partido: 18, pts_total: 61 },
  { posicion: 8, usuario_id: 9, nombre_completo: "Harold Berdugo", correo: "hberdugodelosreyes0@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 20, pts_ganador_partido: 24, pts_goleador_partido: 12, pts_total: 56 },
  { posicion: 9, usuario_id: 8, nombre_completo: "Ricardo Vanegas", correo: "ricardo101228@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 15, pts_ganador_partido: 30, pts_goleador_partido: 8, pts_total: 53 },
  { posicion: 10, usuario_id: 10, nombre_completo: "Ricardo Soto", correo: "ricardosotogom@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 5, pts_ganador_partido: 27, pts_goleador_partido: 12, pts_total: 44 },
  { posicion: 11, usuario_id: 14, nombre_completo: "Luis Betancourt", correo: "luismibetara15@hotmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 5, pts_ganador_partido: 24, pts_goleador_partido: 14, pts_total: 43 },
  { posicion: 12, usuario_id: 11, nombre_completo: "Samuel Gutierrez", correo: "samucobaggg@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 5, pts_ganador_partido: 30, pts_goleador_partido: 8, pts_total: 43 },
  { posicion: 13, usuario_id: 15, nombre_completo: "Ignacio Barrios", correo: "iangelbarrios16@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 10, pts_ganador_partido: 24, pts_goleador_partido: 8, pts_total: 42 },
  { posicion: 14, usuario_id: 13, nombre_completo: "Erick Andrade", correo: "andradeferrer@hotmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 0, pts_ganador_partido: 30, pts_goleador_partido: 12, pts_total: 42 },
  { posicion: 15, usuario_id: 12, nombre_completo: "Andres Del Toro", correo: "pipedeltoro@hotmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 10, pts_ganador_partido: 21, pts_goleador_partido: 4, pts_total: 35 },
  { posicion: 16, usuario_id: 16, nombre_completo: "Manuel Cabarcas", correo: "stherton@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 0, pts_ganador_partido: 18, pts_goleador_partido: 2, pts_total: 20 },
];

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

  const tablaFinal: FilaTablaPosiciones[] = TABLA_POSICIONES_FIJA;

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
