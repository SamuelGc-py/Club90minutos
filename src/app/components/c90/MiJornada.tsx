"use client";

/*
 * Inicio con sesión: "Mi jornada".
 * Responde "¿qué tengo que hacer hoy?": pendientes, posición, próximos partidos,
 * último resultado y mini ranking. La trivia queda como módulo secundario.
 * Solo lee datos que el dashboard ya carga (más /api/historial-puntos, existente).
 */

import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Brain, Trophy } from "lucide-react";
import s from "./MiJornada.module.css";
import { MatchDayList, MatchRow, Escudo } from "./MatchRow";
import Countdown from "./Countdown";
import Leaderboard from "./Leaderboard";
import { rankingGeneral, FilaRanking, ganadorUltimaFechaCerrada } from "./ranking";
import { textoProvisional, type Provisional } from "./provisional";
import { horaCierre, primerNombre, tiempoRestante, unirNombres } from "./formato";

interface PartidoJornada {
  id: number;
  jornada: number;
  jornada_original?: number | null;
  fecha_hora_partido: string;
  estado?: string;
  equipo_local: { nombre: string; escudo_url?: string | null };
  equipo_visitante: { nombre: string; escudo_url?: string | null };
}

interface UltimoResultado {
  partido_id: number;
  equipo_local: string;
  equipo_visitante: string;
  escudo_local?: string | null;
  escudo_visitante?: string | null;
  marcador_real: string;
  pronosticado: boolean;
  marcador_predicho: string | null;
  puntos_total: number;
  puntos_resultado_exacto: number;
  puntos_ganador_partido: number;
  puntos_goleador: number;
}

export interface MiJornadaProps {
  usuarioId: number;
  nombre: string;
  fecha: number;
  /** Partidos de la fecha activa que aún no terminan (mismo filtro de la pestaña Pronósticos). */
  partidosActivos: PartidoJornada[];
  /** Todos los partidos (para ubicar puntajes por fecha). */
  partidos: PartidoJornada[];
  /** Marcadores guardados del usuario por partido. */
  marcadores: Record<number, { local: string; visitante: string }>;
  tabla: FilaRanking[] | null;
  puntajes: any[];
  onPronosticar: (partidoId?: number) => void;
  onVerRanking: () => void;
  onVerResultados: () => void;
  onTrivia: () => void;
  /** Marcador en vivo y puntos provisionales de un partido (null si no está en juego). */
  enVivoDe?: (p: PartidoJornada) => { marcador: string; reloj: string; prov: Provisional | null } | null;
}

export default function MiJornada({
  usuarioId,
  nombre,
  fecha,
  partidosActivos,
  partidos,
  marcadores,
  tabla,
  puntajes,
  onPronosticar,
  onVerRanking,
  onVerResultados,
  onTrivia,
  enVivoDe,
}: MiJornadaProps) {
  const [ahora, setAhora] = useState(() => Date.now());
  const [ultimo, setUltimo] = useState<UltimoResultado | null | undefined>(undefined);

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let vivo = true;
    fetch(`/api/historial-puntos?usuario_id=${usuarioId}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!vivo) return;
        const lista: UltimoResultado[] = d?.partidos || [];
        setUltimo(lista[0] ?? null);
      })
      .catch(() => vivo && setUltimo(null));
    return () => {
      vivo = false;
    };
  }, [usuarioId]);

  const pronosticado = (id: number) => {
    const m = marcadores[id];
    return !!m && m.local !== "" && m.visitante !== "";
  };

  const abiertos = partidosActivos.filter((p) => p.estado !== "aplazado" && horaCierre(p.fecha_hora_partido) > ahora);
  const pendientes = abiertos
    .filter((p) => !pronosticado(p.id))
    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());
  const primero = pendientes[0];

  const ranking = useMemo(() => (tabla ? rankingGeneral(tabla, puntajes, partidos) : []), [tabla, puntajes, partidos]);
  const yo = ranking.find((f) => f.usuario_id === usuarioId);
  const ganadorFecha = useMemo(() => (tabla ? ganadorUltimaFechaCerrada(tabla, puntajes, partidos as any) : null), [tabla, puntajes, partidos]);
  const soyGanador = !!ganadorFecha?.usuarioIds.includes(usuarioId);
  const enJuego = enVivoDe
    ? partidosActivos.map((p) => ({ p, v: enVivoDe(p) })).filter((x): x is { p: PartidoJornada; v: NonNullable<ReturnType<NonNullable<typeof enVivoDe>>> } => !!x.v)
    : [];

  const proximos = [...partidosActivos]
    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime())
    .slice(0, 6);

  return (
    <div className={s.pagina}>
      <div className={s.encabezado}>
        <div>
          <span className="eyebrow">Fecha {fecha} · Liga BetPlay 2026-II</span>
          <h1>Mi jornada</h1>
        </div>
        <span className="caption">Hola, {primerNombre(nombre)}</span>
      </div>

      {/* A · Aviso de pendientes */}
      {primero ? (
        <div className={s.aviso} role="status">
          <div className={s.avisoTexto}>
            <span className={s.avisoTitulo}>
              Te {pendientes.length === 1 ? "falta 1 pronóstico" : `faltan ${pendientes.length} pronósticos`}
            </span>
            <span className="caption">
              El primero ({primero.equipo_local.nombre} vs {primero.equipo_visitante.nombre}) cierra en{" "}
              <span className="num" style={{ color: "var(--state-warn)" }}>{tiempoRestante(horaCierre(primero.fecha_hora_partido) - ahora)}</span>
            </span>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => onPronosticar(primero.id)}>
            Pronosticar <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className={`${s.aviso} ${s.avisoOk}`} role="status">
          <div className={s.avisoTexto}>
            <span className={s.avisoTitulo}>Estás al día</span>
            <span className="caption">
              {abiertos.length > 0 ? "Ya pronosticaste todos los partidos abiertos de la fecha." : "No hay partidos abiertos para pronosticar en este momento."}
            </span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => onPronosticar()}>
            Ver mis pronósticos
          </button>
        </div>
      )}

      {/* Ganador de la última fecha cerrada */}
      {ganadorFecha && (
        <div className={`${s.aviso} ${s.avisoOk}`} role="status">
          <div className={s.avisoTexto}>
            <span className={s.avisoTitulo} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Trophy size={18} style={{ color: "var(--color-amarillo-energia)" }} aria-hidden="true" />
              {soyGanador
                ? `¡Ganaste la Fecha ${ganadorFecha.fecha}!`
                : `${ganadorFecha.nombres.length > 1 ? "Ganadores" : "Ganador"} de la Fecha ${ganadorFecha.fecha}: ${unirNombres(ganadorFecha.nombres)}`}
            </span>
            <span className="caption">
              {ganadorFecha.nombres.length > 1 ? "Empataron" : "Sumó"} <span className="num" style={{ color: "var(--state-ok)" }}>{ganadorFecha.pts} pts</span> en la fecha.
              {soyGanador && ganadorFecha.nombres.length > 1 ? ` Compartes el primer lugar con ${ganadorFecha.nombres.length - 1} más.` : ""}
            </span>
          </div>
          <button type="button" className="btn btn-text btn-sm" onClick={onVerRanking}>
            Ver ranking de la fecha
          </button>
        </div>
      )}

      {/* En vivo ahora: marcador y puntos provisionales */}
      {enJuego.length > 0 && (
        <section className={s.seccion} aria-labelledby="mj-vivo">
          <div className={s.seccionCabeza}>
            <h3 id="mj-vivo">En vivo ahora</h3>
          </div>
          <div className={s.lista}>
            {enJuego.map(({ p, v }) => (
              <div key={p.id} className={s.vivo}>
                <div className={s.vivoPartido}>
                  <span>{p.equipo_local.nombre}</span>
                  <span className={s.marcador}>{v.marcador}</span>
                  <span>{p.equipo_visitante.nombre}</span>
                  <span className="badge badge-live">{v.reloj}</span>
                </div>
                <div className={s.vivoPuntos}>
                  {v.prov ? (
                    <>
                      <span className={s.vivoPts} style={{ color: v.prov.total > 0 ? "var(--state-ok)" : "var(--text-muted)" }}>+{v.prov.total}</span>
                      <span className="caption">{textoProvisional(v.prov)}. Tu pronóstico: <span className="num">{marcadores[p.id].local} – {marcadores[p.id].visitante}</span></span>
                    </>
                  ) : (
                    <span className="caption">No pronosticaste este partido.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={s.grid}>
        <div className={s.columna}>
          {/* C · Próximos partidos */}
          <section className={s.seccion} aria-labelledby="mj-proximos">
            <div className={s.seccionCabeza}>
              <h3 id="mj-proximos">Próximos partidos</h3>
              <button type="button" className="btn btn-text btn-sm" onClick={() => onPronosticar()}>
                Ver todos
              </button>
            </div>
            <MatchDayList
              items={proximos}
              fecha={(p) => p.fecha_hora_partido}
              vacio={<div className="empty-state">No hay partidos pendientes en esta fecha.</div>}
              render={(p) => (
                <MatchRow
                  key={p.id}
                  fechaHora={p.fecha_hora_partido}
                  local={p.equipo_local}
                  visitante={p.equipo_visitante}
                  marcador={pronosticado(p.id) ? `${marcadores[p.id].local} – ${marcadores[p.id].visitante}` : null}
                  onToggle={() => onPronosticar(p.id)}
                  etiquetaAccion="Pronosticar"
                  estado={
                    <>
                      {/* Un solo badge: pronosticado, o el reloj de cierre (pendiente) */}
                      {pronosticado(p.id) ? (
                        <span className="badge badge-ok">Pronosticado</span>
                      ) : (
                        <Countdown fechaHoraPartido={p.fecha_hora_partido} estado={p.estado} compacto />
                      )}
                    </>
                  }
                />
              )}
            />
          </section>

          {/* D · Último resultado liquidado */}
          {ultimo && (
            <section className={s.seccion} aria-labelledby="mj-ultimo">
              <div className={s.seccionCabeza}>
                <h3 id="mj-ultimo">Último resultado</h3>
                <button type="button" className="btn btn-text btn-sm" onClick={onVerResultados}>
                  Mis resultados
                </button>
              </div>
              <div className={`${s.panel} ${s.resultado}`}>
                <div className={s.resultadoPartido}>
                  <span>
                    <span>{ultimo.equipo_local}</span>
                    <Escudo equipo={{ nombre: ultimo.equipo_local, escudo_url: ultimo.escudo_local }} />
                  </span>
                  <span className={s.marcador}>{ultimo.marcador_real.replace("-", " – ")}</span>
                  <span>
                    <Escudo equipo={{ nombre: ultimo.equipo_visitante, escudo_url: ultimo.escudo_visitante }} />
                    <span>{ultimo.equipo_visitante}</span>
                  </span>
                </div>
                <dl className={s.lineas}>
                  <dt>Tu pronóstico</dt>
                  <dd>{ultimo.pronosticado && ultimo.marcador_predicho ? ultimo.marcador_predicho.replace("-", " – ") : "Sin pronóstico"}</dd>
                  {ultimo.puntos_resultado_exacto > 0 && (<><dt>Marcador exacto</dt><dd>+{ultimo.puntos_resultado_exacto}</dd></>)}
                  {ultimo.puntos_ganador_partido > 0 && (<><dt>Ganador o empate</dt><dd>+{ultimo.puntos_ganador_partido}</dd></>)}
                  {ultimo.puntos_goleador > 0 && (<><dt>Goleador</dt><dd>+{ultimo.puntos_goleador}</dd></>)}
                  <dt style={{ color: "var(--text)", fontWeight: 600 }}>Sumaste</dt>
                  <dd style={{ color: ultimo.puntos_total > 0 ? "var(--state-ok)" : "var(--text-muted)", fontWeight: 600 }}>
                    {ultimo.puntos_total > 0 ? `+${ultimo.puntos_total} pts` : "0 pts"}
                  </dd>
                </dl>
              </div>
            </section>
          )}
        </div>

        <div className={s.columna}>
          {/* B · Tu posición */}
          <section className={s.seccion} aria-labelledby="mj-posicion">
            <div className={s.seccionCabeza}>
              <h3 id="mj-posicion">Tu posición</h3>
            </div>
            <div className={`${s.panel} ${s.cifras}`}>
              <div className={s.cifra}>
                <span className={s.cifraValor}>{yo ? `${yo.posicion}°` : "–"}</span>
                <span className={s.cifraEtiqueta}>
                  {yo?.movimiento ? (
                    <span className={yo.movimiento > 0 ? s.sube : s.baja}>
                      {yo.movimiento > 0 ? `▲${yo.movimiento}` : `▼${-yo.movimiento}`}
                    </span>
                  ) : (
                    "Puesto"
                  )}
                  {yo?.movimiento ? " vs. fecha anterior" : ""}
                </span>
              </div>
              <div className={s.cifra}>
                <span className={s.cifraValor}>{yo ? yo.pts_total : "–"}</span>
                <span className={s.cifraEtiqueta}>Puntos</span>
              </div>
              <div className={s.cifra}>
                <span className={s.cifraValor}>{yo ? (yo.distanciaLider === 0 ? (yo.posicion === 1 ? "Líder" : "0") : `−${yo.distanciaLider}`) : "–"}</span>
                <span className={s.cifraEtiqueta}>
                  {yo?.distanciaLider === 0 ? (yo.posicion === 1 ? "Vas primero" : "Igualado con el líder (desempate)") : "Al líder"}
                </span>
              </div>
            </div>
          </section>

          {/* E · Mini ranking */}
          <section className={s.seccion} aria-labelledby="mj-ranking">
            <div className={s.seccionCabeza}>
              <h3 id="mj-ranking">Ranking</h3>
              <button type="button" className="btn btn-text btn-sm" onClick={onVerRanking}>
                Ver completo
              </button>
            </div>
            {tabla ? (
              <Leaderboard tabla={tabla} puntajes={puntajes} partidos={partidos} usuarioId={usuarioId} compacto />
            ) : (
              <div className="empty-state">Cargando ranking…</div>
            )}
          </section>

          {/* Trivia: módulo secundario */}
          <section className={`${s.panel} ${s.trivia}`} aria-labelledby="mj-trivia">
            <div>
              <h3 id="mj-trivia" style={{ margin: 0, fontSize: "1rem" }}>Trivia 90 Minutos</h3>
              <span className="caption">Preguntas rápidas de fútbol mientras esperas el pitazo.</span>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onTrivia}>
              <Brain size={16} /> Jugar
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
