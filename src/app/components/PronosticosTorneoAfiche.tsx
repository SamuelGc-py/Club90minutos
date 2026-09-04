import React from "react";
import { useAfichePng } from "./afiche/useAfichePng";
import { AFICHE } from "./afiche/afichePaleta";
import { BarraDescargaAfiche, LogoClub90, BadgeTorneo, PieAfiche } from "./afiche/AfichePartes";

interface PronosticosTorneoAficheProps {
  predicciones: any[];
}

export default function PronosticosTorneoAfiche({ predicciones }: PronosticosTorneoAficheProps) {
  const { printRef, generandoImagen, descargarImagen } = useAfichePng("Predicciones_Torneo_Club90Minutos.png");

  return (
    <div style={{ margin: "20px 0" }}>
      <BarraDescargaAfiche
        titulo="Afiche de predicciones del torneo"
        subtitulo="Resumen general para descargar"
        generando={generandoImagen}
        onDescargar={descargarImagen}
      />

      <div style={{ overflowX: "auto" }}>
        <div
          ref={printRef}
          className="afiche-container"
          style={{
            minWidth: "850px",
            backgroundColor: AFICHE.negroEstadio,
            color: AFICHE.blanco,
            fontFamily: AFICHE.fuenteBody,
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${AFICHE.grisOscuro}`,
          }}
        >
          {/* ENCABEZADO */}
          <div
            style={{
              background: AFICHE.negroEstadio,
              padding: "24px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `2px solid ${AFICHE.grisOscuro}`,
              gap: 20,
            }}
          >
            <LogoClub90 tamano={64} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
              <div
                style={{
                  color: AFICHE.verdeClub,
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  fontFamily: AFICHE.fuenteMono,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Predicciones de oro
              </div>
              <h2
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: AFICHE.blanco,
                  fontFamily: AFICHE.fuenteDisplay,
                  lineHeight: 1.2,
                  textAlign: "center",
                }}
              >
                Resumen final del campeonato
              </h2>
            </div>

            <BadgeTorneo />
          </div>

          {/* TABLA DE PREDICCIONES */}
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontFamily: AFICHE.fuenteBody }}>
            <thead>
              <tr>
                <th
                  colSpan={4}
                  style={{
                    padding: "10px 16px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    backgroundColor: AFICHE.grisOscuro,
                    color: AFICHE.azulElectrico,
                    textAlign: "center",
                  }}
                >
                  Pronósticos registrados
                </th>
              </tr>
              <tr style={{ fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em", backgroundColor: "#12161c", color: AFICHE.grisClaro }}>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Participante</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Campeón</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Subcampeón</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Goleador del torneo</th>
              </tr>
            </thead>
            <tbody>
              {(!predicciones || predicciones.length === 0) ? (
                <tr>
                  <td colSpan={4} style={{ padding: 30, color: AFICHE.grisMedio, textAlign: "center", fontSize: "0.95rem" }}>
                    Nadie envió pronóstico para el torneo.
                  </td>
                </tr>
              ) : (
                predicciones.map((p: any, idx: number) => {
                  const esPar = idx % 2 === 0;
                  const subcampeon = p.campeon?.nombre === p.finalista_1?.nombre ? p.finalista_2?.nombre : p.finalista_1?.nombre;

                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: esPar ? "transparent" : "rgba(255, 255, 255, 0.03)",
                        borderBottom: `1px solid ${AFICHE.grisOscuro}`,
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: AFICHE.blanco }}>{p.usuario?.nombre_completo || "-"}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800, color: AFICHE.amarilloEnergia, fontSize: "0.95rem" }}>
                        {p.campeon?.nombre || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", color: AFICHE.grisClaro }}>{subcampeon || "-"}</td>
                      <td style={{ padding: "12px 16px", color: AFICHE.verdeClub, fontWeight: 700, textAlign: "center" }}>
                        {p.goleador_torneo?.nombre || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <PieAfiche mensaje="¿Quién se llevará la gloria?" />
        </div>
      </div>
    </div>
  );
}
