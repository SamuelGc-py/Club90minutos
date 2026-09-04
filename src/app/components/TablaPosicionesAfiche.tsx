import React from "react";
import { Printer, Trophy, Award, Flame, Users, Target, CheckCircle2, Star } from "lucide-react";
import { useAfichePng } from "./afiche/useAfichePng";
import { AFICHE } from "./afiche/afichePaleta";
import { BarraDescargaAfiche, LogoClub90, BadgeTorneo, PieAfiche } from "./afiche/AfichePartes";

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

const COLUMNAS: { key: keyof FilaTablaPosiciones; etiqueta: string; icono: React.ReactNode }[] = [
  { key: "pts_campeon", etiqueta: "Campeón", icono: <Trophy size={14} /> },
  { key: "pts_finalistas", etiqueta: "Finalistas", icono: <Award size={14} /> },
  { key: "pts_goleador_torneo", etiqueta: "Goleador Torneo", icono: <Flame size={14} /> },
  { key: "pts_clasificados", etiqueta: "8 Clasificados", icono: <Users size={14} /> },
  { key: "pts_resultado_exacto", etiqueta: "Marcador Exacto", icono: <CheckCircle2 size={14} /> },
  { key: "pts_ganador_partido", etiqueta: "Ganador Partido", icono: <Target size={14} /> },
  { key: "pts_goleador_partido", etiqueta: "Goleadores", icono: <Star size={14} /> },
];

// Colores del podio (1º/2º/3º) usando la paleta de marca en vez de las
// convenciones oro/plata/bronce genéricas, que no forman parte del manual.
const ACENTO_PODIO: Record<number, string> = {
  1: AFICHE.verdeClub,
  2: AFICHE.grisClaro,
  3: AFICHE.amarilloEnergia,
};

export default function TablaPosicionesAfiche({
  tabla,
  nombrePolla = "Club 90 Minutos Dimayor",
}: TablaPosicionesAficheProps) {
  const fecha = new Date().toISOString().split("T")[0];
  const { printRef, generandoImagen, descargarImagen } = useAfichePng(`Tabla_de_Posiciones_${fecha}.png`);
  const tablaFinal: FilaTablaPosiciones[] = tabla || [];

  const handlePrint = () => window.print();

  return (
    <div style={{ margin: "20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <BarraDescargaAfiche
            titulo="Afiche de la tabla de posiciones"
            subtitulo={nombrePolla}
            generando={generandoImagen}
            onDescargar={descargarImagen}
          />
        </div>
        <button
          onClick={handlePrint}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "transparent",
            color: AFICHE.grisClaro,
            fontWeight: 700,
            fontFamily: AFICHE.fuenteBody,
            padding: "8px 16px",
            borderRadius: 999,
            border: `1px solid ${AFICHE.grisMedio}66`,
            cursor: "pointer",
            fontSize: "0.85rem",
            height: "fit-content",
          }}
        >
          <Printer size={16} /> Imprimir / PDF
        </button>
      </div>

      <div
        ref={printRef}
        className="afiche-container"
        style={{
          width: "100%",
          backgroundColor: AFICHE.negroEstadio,
          color: AFICHE.blanco,
          fontFamily: AFICHE.fuenteBody,
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${AFICHE.grisOscuro}`,
        }}
      >
        {/* PODIO: TOP 3 */}
        {tablaFinal.length > 0 && (
          <div style={{ display: "flex", gap: 12, padding: "20px 24px 4px", flexWrap: "wrap" }}>
            {tablaFinal.slice(0, 3).map((row) => {
              const acento = ACENTO_PODIO[row.posicion] ?? AFICHE.grisMedio;
              return (
                <div
                  key={row.usuario_id}
                  style={{
                    flex: "1 1 160px",
                    minWidth: 160,
                    background: AFICHE.grisOscuro,
                    borderLeft: `3px solid ${acento}`,
                    borderRadius: 6,
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ fontFamily: AFICHE.fuenteMono, fontSize: "1.3rem", fontWeight: 700, color: acento, minWidth: 20 }}>
                    {row.posicion}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: AFICHE.blanco, fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: AFICHE.fuenteBody }}>
                      {row.nombre_completo}
                    </div>
                    <div style={{ color: acento, fontWeight: 800, fontSize: "1.15rem", fontFamily: AFICHE.fuenteMono }}>
                      {row.pts_total} pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ENCABEZADO */}
        <div
          style={{
            padding: "24px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${AFICHE.grisOscuro}`,
            gap: 20,
          }}
        >
          <LogoClub90 tamano={64} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "1.6rem",
                fontWeight: 800,
                color: AFICHE.blanco,
                fontFamily: AFICHE.fuenteDisplay,
                lineHeight: 1.1,
                textAlign: "center",
              }}
            >
              Tabla de posiciones
            </h1>
            <div
              style={{
                color: AFICHE.verdeClub,
                fontWeight: 700,
                fontSize: "1rem",
                fontFamily: AFICHE.fuenteMono,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Polla
            </div>
          </div>
          <BadgeTorneo />
        </div>

        {/* TABLA */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "0.85rem", fontFamily: AFICHE.fuenteBody }}>
            <thead>
              <tr>
                <th colSpan={2} style={{ backgroundColor: AFICHE.grisOscuro, borderBottom: `1px solid ${AFICHE.grisMedio}33` }}></th>
                <th
                  colSpan={COLUMNAS.length}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    backgroundColor: AFICHE.grisOscuro,
                    color: AFICHE.azulElectrico,
                    borderBottom: `1px solid ${AFICHE.grisMedio}33`,
                  }}
                >
                  Puntos por categoría
                </th>
                <th style={{ backgroundColor: AFICHE.grisOscuro, borderBottom: `1px solid ${AFICHE.grisMedio}33` }}></th>
              </tr>

              <tr style={{ fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                <th style={{ width: 44, padding: "10px 6px", backgroundColor: "#12161c", color: AFICHE.grisClaro }}>Pos.</th>
                <th style={{ minWidth: 150, padding: "10px 14px", backgroundColor: "#12161c", color: AFICHE.grisClaro, textAlign: "left" }}>Jugador</th>
                {COLUMNAS.map((col) => (
                  <th key={col.key} style={{ padding: "10px 6px", backgroundColor: "#12161c", color: AFICHE.grisMedio }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: AFICHE.grisClaro }}>
                      {col.icono}
                      <span>{col.etiqueta}</span>
                    </div>
                  </th>
                ))}
                <th style={{ width: 90, padding: "10px 6px", backgroundColor: AFICHE.grisOscuro, color: AFICHE.verdeClub, borderLeft: `2px solid ${AFICHE.verdeClub}66` }}>
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {tablaFinal.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: 30, color: AFICHE.grisMedio }}>
                    No hay registros de puntajes aún.
                  </td>
                </tr>
              ) : (
                tablaFinal.map((row, idx) => {
                  const esPar = idx % 2 === 0;
                  const acentoPodio = ACENTO_PODIO[row.posicion];

                  return (
                    <tr
                      key={row.usuario_id}
                      style={{
                        backgroundColor: acentoPodio ? `${acentoPodio}14` : esPar ? "transparent" : "rgba(255,255,255,0.02)",
                        borderBottom: `1px solid ${AFICHE.grisOscuro}`,
                        fontWeight: acentoPodio ? 700 : 500,
                      }}
                    >
                      <td style={{ padding: "10px 6px", fontWeight: 700, fontFamily: AFICHE.fuenteMono, color: acentoPodio ?? AFICHE.grisMedio }}>
                        {row.posicion}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "left", color: AFICHE.blanco }}>{row.nombre_completo}</td>
                      {COLUMNAS.map((col) => (
                        <td key={col.key} style={{ padding: "10px 6px", color: AFICHE.grisClaro, fontFamily: AFICHE.fuenteMono }}>
                          {row[col.key] as number}
                        </td>
                      ))}
                      <td
                        style={{
                          padding: "10px 6px",
                          fontWeight: 800,
                          fontSize: "1rem",
                          color: AFICHE.verdeClub,
                          fontFamily: AFICHE.fuenteMono,
                          borderLeft: `2px solid ${AFICHE.verdeClub}66`,
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

        <PieAfiche mensaje="¡Pon a prueba tu conocimiento y compite por la gran premiación!" />
      </div>
    </div>
  );
}
