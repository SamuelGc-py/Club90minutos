import React from "react";
import { useAfichePng } from "./afiche/useAfichePng";
import { AFICHE } from "./afiche/afichePaleta";
import { BarraDescargaAfiche, LogoClub90, BadgeTorneo, PieAfiche } from "./afiche/AfichePartes";

interface PronosticosPartidoAficheProps {
  partido: any;
  pronosticos: any[];
  obtenerNombreGoleador: (p: any) => string;
}

export default function PronosticosPartidoAfiche({
  partido,
  pronosticos,
  obtenerNombreGoleador,
}: PronosticosPartidoAficheProps) {
  const nombreArchivo = `Pronosticos_${partido.equipo_local.nombre.replace(/\s+/g, "")}_vs_${partido.equipo_visitante.nombre.replace(/\s+/g, "")}.png`;
  const { printRef, generandoImagen, descargarImagen } = useAfichePng(nombreArchivo);

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
      <BarraDescargaAfiche
        titulo="Afiche de pronósticos"
        subtitulo="Imagen para descargar y compartir"
        generando={generandoImagen}
        onDescargar={descargarImagen}
      />

      <div style={{ overflowX: "auto" }}>
        <div
          ref={printRef}
          className="afiche-container"
          style={{
            minWidth: "800px",
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

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 44, height: 44, objectFit: "contain" }} crossOrigin="anonymous" />
                <div
                  style={{
                    color: AFICHE.verdeClub,
                    fontWeight: 800,
                    fontSize: "1.6rem",
                    fontFamily: AFICHE.fuenteDisplay,
                    lineHeight: 1,
                  }}
                >
                  VS
                </div>
                <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 44, height: 44, objectFit: "contain" }} crossOrigin="anonymous" />
              </div>

              <h2
                style={{
                  margin: "14px 0 0 0",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: AFICHE.blanco,
                  fontFamily: AFICHE.fuenteDisplay,
                  lineHeight: 1.2,
                  textAlign: "center",
                }}
              >
                {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
              </h2>
              <div style={{ color: AFICHE.grisMedio, fontSize: "0.85rem", fontWeight: 600, marginTop: 6, fontFamily: AFICHE.fuenteMono }}>
                {formatearFechaPartido(partido.fecha_hora_partido)} · {formatearHoraPartido(partido.fecha_hora_partido)}
              </div>
            </div>

            <BadgeTorneo />
          </div>

          {/* TABLA DE PRONÓSTICOS */}
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
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Marcador</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Ganador</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Goleador</th>
              </tr>
            </thead>
            <tbody>
              {pronosticos.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 30, color: AFICHE.grisMedio, textAlign: "center", fontSize: "0.95rem" }}>
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
                        borderBottom: `1px solid ${AFICHE.grisOscuro}`,
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: AFICHE.blanco }}>{p.usuario?.nombre_completo}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800, color: AFICHE.verdeClub, fontSize: "1rem", fontFamily: AFICHE.fuenteMono }}>
                        {p.goles_local_predicho} - {p.goles_visitante_predicho}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 999, background: `${AFICHE.azulElectrico}1a`, color: AFICHE.azulElectrico, fontWeight: 700, fontSize: "0.8rem" }}>
                          {ganadorTexto}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: AFICHE.amarilloEnergia, fontWeight: 700, textAlign: "center" }}>
                        {obtenerNombreGoleador(p)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <PieAfiche mensaje="¿Quién acertará la predicción?" />
        </div>
      </div>
    </div>
  );
}
