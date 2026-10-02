"use client";

/*
 * Pestaña "Estadísticas": rendimiento individual del participante.
 * Efectividad por equipo, rachas y tipo de pronosticador. Solo lectura: usa
 * /api/historial-puntos (propio) y los pronósticos que ya entrega /api/consolidados.
 */

import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import s from "./Estadisticas.module.css";
import { efectividadPorEquipo, PartidoHistorial, perfil, rachas, resumen, tipoPronosticador } from "./estadisticas";

interface PrediccionLite {
  usuario_id: number;
  goles_local_predicho: number;
  goles_visitante_predicho: number;
}

function Metrica({ titulo, yo, grupo, max, unidad = "%" }: { titulo: string; yo: number; grupo: number; max: number; unidad?: string }) {
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`;
  return (
    <div className={s.metrica}>
      <div className={s.metricaCabeza}>
        <span>{titulo}</span>
        <span className="num">
          {yo}
          {unidad} <span style={{ color: "var(--text-muted)" }}>· grupo {grupo}{unidad}</span>
        </span>
      </div>
      <div className={s.barra} aria-hidden="true">
        <div className={s.relleno} style={{ width: pct(yo) }} />
        <div className={s.marcaGrupo} style={{ left: pct(grupo) }} title="Promedio del grupo" />
      </div>
    </div>
  );
}

export default function EstadisticasView({ usuarioId, predicciones }: { usuarioId: number; predicciones: PrediccionLite[] }) {
  const [partidos, setPartidos] = useState<PartidoHistorial[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vivo = true;
    setError(null);
    fetch(`/api/historial-puntos?usuario_id=${usuarioId}`, { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "No se pudo cargar el historial");
        if (vivo) setPartidos(d.partidos || []);
      })
      .catch((e) => vivo && setError(e.message));
    return () => {
      vivo = false;
    };
  }, [usuarioId, recarga]);

  const datos = useMemo(() => {
    if (!partidos) return null;
    const r = resumen(partidos);
    const ra = rachas(partidos);
    const equipos = efectividadPorEquipo(partidos);
    const mias = predicciones.filter((p) => p.usuario_id === usuarioId);
    const yo = perfil(mias);
    const grupo = perfil(predicciones);
    const tipo = tipoPronosticador(yo, grupo, r.efectividad);
    // Destacados: solo equipos con al menos 2 partidos; "mejor" exige 50 % o más y "peor", menos de 50 %.
    const conMuestra = equipos.filter((e) => e.partidos >= 2);
    const mejor = conMuestra.find((e) => e.porcentaje >= 50);
    const peor = [...conMuestra].sort((a, b) => a.porcentaje - b.porcentaje || b.partidos - a.partidos).find((e) => e.porcentaje < 50);
    return { r, ra, equipos, yo, grupo, tipo, mejor, peor };
  }, [partidos, predicciones, usuarioId]);

  return (
    <div className={s.pagina}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--s-3)" }}>
        <div>
          <span className="eyebrow">Tu rendimiento</span>
          <h2 className="titulo-seccion" style={{ marginTop: 4 }}>Estadísticas</h2>
          <p className="caption" style={{ margin: "var(--s-1) 0 0" }}>Calculadas con los partidos ya liquidados que pronosticaste.</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRecarga((n) => n + 1)}>
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {error && <div className="empty-state">{error}</div>}
      {!error && !datos && <div className="empty-state">Cargando estadísticas…</div>}

      {datos && datos.r.pronosticados === 0 && (
        <div className="empty-state">Todavía no tienes partidos liquidados con pronóstico. Tus estadísticas aparecerán después de la primera fecha que juegues.</div>
      )}

      {datos && datos.r.pronosticados > 0 && (
        <>
          <div className={s.cifras}>
            <div className={s.cifra}>
              <span className={s.valor}>{datos.r.efectividad}%</span>
              <span className={s.etiqueta}>Efectividad ({datos.r.conPuntos} de {datos.r.pronosticados} con puntos)</span>
            </div>
            <div className={s.cifra}>
              <span className={s.valor}>{datos.r.aciertosGanador}</span>
              <span className={s.etiqueta}>Ganadores o empates acertados</span>
            </div>
            <div className={s.cifra}>
              <span className={s.valor}>{datos.r.exactos}</span>
              <span className={s.etiqueta}>Marcadores exactos</span>
            </div>
            <div className={s.cifra}>
              <span className={s.valor}>{datos.r.promedio}</span>
              <span className={s.etiqueta}>Puntos por partido</span>
            </div>
          </div>

          <div className={s.grid}>
            <section className={s.panel} aria-labelledby="est-tipo">
              <h3 id="est-tipo">Tipo de pronosticador</h3>
              <div>
                <div className={s.tipo}>{datos.tipo.nombre}</div>
                <p className="caption" style={{ margin: "var(--s-2) 0 0", fontSize: "0.9375rem" }}>{datos.tipo.descripcion}</p>
              </div>
              {datos.yo.muestra > 0 && (
                <>
                  <Metrica titulo="Goles por partido" yo={datos.yo.golesPorPartido} grupo={datos.grupo.golesPorPartido} max={6} unidad="" />
                  <Metrica titulo="Pronosticas empate" yo={datos.yo.pctEmpates} grupo={datos.grupo.pctEmpates} max={100} />
                  <Metrica titulo="Gana el local" yo={datos.yo.pctLocal} grupo={datos.grupo.pctLocal} max={100} />
                  <Metrica titulo="Gana el visitante" yo={datos.yo.pctVisitante} grupo={datos.grupo.pctVisitante} max={100} />
                  <p className="caption" style={{ margin: 0 }}>Basado en tus {datos.yo.muestra} pronósticos. La línea blanca es el promedio del grupo.</p>
                </>
              )}
            </section>

            <section className={s.panel} aria-labelledby="est-racha">
              <h3 id="est-racha">Rachas</h3>
              <div className={s.rachaFila}>
                <div className={s.cifra} style={{ padding: 0 }}>
                  <span className={s.valor} style={{ color: datos.ra.actual > 0 ? "var(--state-ok)" : undefined }}>{datos.ra.actual}</span>
                  <span className={s.etiqueta}>Racha actual sumando puntos</span>
                </div>
                <div className={s.cifra} style={{ padding: 0 }}>
                  <span className={s.valor}>{datos.ra.mejor}</span>
                  <span className={s.etiqueta}>Tu mejor racha</span>
                </div>
              </div>
              <div>
                <p className="caption" style={{ margin: "0 0 var(--s-2)" }}>Tus últimos {datos.ra.ultimos.length} pronósticos (puntos):</p>
                <div className={s.puntos}>
                  {datos.ra.ultimos.map((u, i) => (
                    <span key={i} className={`${s.punto} ${u.puntos > 0 ? s.puntoSi : s.puntoNo}`} title={`${u.partido}: ${u.puntos} pts`}>
                      {u.puntos > 0 ? `+${u.puntos}` : "0"}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section className={s.panel} aria-labelledby="est-equipos">
            <h3 id="est-equipos">Efectividad por equipo</h3>
            {(datos.mejor || datos.peor) && (
              <div className={s.destacados}>
                {datos.mejor && (
                  <p className={s.destacado} style={{ margin: 0 }}>
                    Aciertas el <strong style={{ color: "var(--state-ok)" }}>{datos.mejor.porcentaje} %</strong> con {datos.mejor.equipo}{" "}
                    <span className="caption">({datos.mejor.aciertos} de {datos.mejor.partidos})</span>
                  </p>
                )}
                {datos.peor && datos.peor.equipo !== datos.mejor?.equipo && (
                  <p className={s.destacado} style={{ margin: 0 }}>
                    Te cuesta con {datos.peor.equipo}: <strong style={{ color: "var(--state-error)" }}>{datos.peor.porcentaje} %</strong>{" "}
                    <span className="caption">({datos.peor.aciertos} de {datos.peor.partidos})</span>
                  </p>
                )}
              </div>
            )}
            <div className={s.equipos} role="table" aria-label="Efectividad por equipo">
              <div className={`${s.equipo} ${s.equipoEncabezado}`} role="row">
                <span role="columnheader" />
                <span role="columnheader">Equipo</span>
                <span role="columnheader" className={s.ocultarMovil}>Aciertos</span>
                <span role="columnheader" className={s.num}>%</span>
                <span role="columnheader" className={s.num}>Pts</span>
              </div>
              {datos.equipos.map((e) => (
                <div key={e.equipo} className={s.equipo} role="row">
                  <span role="cell">{e.escudo ? <img src={e.escudo} alt="" className={s.escudo} loading="lazy" /> : null}</span>
                  <span role="cell" className={s.nombreEquipo} title={e.equipo}>{e.equipo}</span>
                  <span role="cell" className={s.ocultarMovil}>
                    <div className={s.barra}>
                      <div className={s.relleno} style={{ width: `${e.porcentaje}%` }} />
                    </div>
                  </span>
                  <span role="cell" className={s.num}>{e.porcentaje}</span>
                  <span role="cell" className={s.num}>{e.puntos}</span>
                </div>
              ))}
            </div>
            <p className="caption" style={{ margin: 0 }}>
              Acierto = adivinaste quién ganaba o el empate en un partido de ese equipo. Los destacados exigen al menos 2 partidos con ese equipo.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
