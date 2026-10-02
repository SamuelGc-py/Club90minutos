"use client";

/*
 * Formulario de pronóstico de un partido.
 * Solo presentación: recibe el estado del marcador y los manejadores del dashboard
 * (mismas reglas de validación y guardado que antes).
 */

import React from "react";
import { AlertTriangle, CheckCircle2, Minus, Plus } from "lucide-react";
import s from "./PredictionForm.module.css";
import { Escudo } from "./MatchRow";

type Ganador = "local" | "empate" | "visitante" | "";

export interface MarcadorForm {
  local: string;
  visitante: string;
  ganador: Ganador;
  goleador_id: string;
}

interface JugadorForm {
  id: number | string;
  nombre: string;
}

interface EquipoForm {
  nombre: string;
  escudo_url?: string | null;
  jugadores?: JugadorForm[];
}

export interface PredictionFormProps {
  local: EquipoForm;
  visitante: EquipoForm;
  m: MarcadorForm;
  cerrado: boolean;
  inconsistencia: string | null;
  resultadoOficial?: { goles_local_real: number; goles_visitante_real: number; goleadores?: any[] } | null;
  guardando: boolean;
  guardadoOk: boolean;
  onMarcador: (campo: "local" | "visitante", valor: string) => void;
  onGanador: (g: "local" | "empate" | "visitante") => void;
  onGoleador: (jugadorId: string) => void;
  onGuardar: () => void;
}

function Stepper({
  valor,
  onCambio,
  disabled,
  etiqueta,
}: {
  valor: string;
  onCambio: (v: string) => void;
  disabled: boolean;
  etiqueta: string;
}) {
  const n = valor === "" ? null : Number(valor);
  const bajar = () => onCambio(String(Math.max(0, (n ?? 0) - 1)));
  const subir = () => onCambio(String(Math.min(20, (n ?? -1) + 1)));
  return (
    <div className={s.stepper}>
      <button type="button" className={s.stepBtn} onClick={bajar} disabled={disabled || !n} aria-label={`Restar gol a ${etiqueta}`}>
        <Minus size={16} />
      </button>
      <input
        className={s.goles}
        type="number"
        inputMode="numeric"
        min={0}
        max={20}
        value={valor}
        placeholder="–"
        onChange={(e) => onCambio(e.target.value)}
        disabled={disabled}
        aria-label={`Goles de ${etiqueta}`}
      />
      <button type="button" className={s.stepBtn} onClick={subir} disabled={disabled || (n ?? 0) >= 20} aria-label={`Sumar gol a ${etiqueta}`}>
        <Plus size={16} />
      </button>
    </div>
  );
}

export default function PredictionForm({
  local,
  visitante,
  m,
  cerrado,
  inconsistencia,
  resultadoOficial,
  guardando,
  guardadoOk,
  onMarcador,
  onGanador,
  onGoleador,
  onGuardar,
}: PredictionFormProps) {
  const golesL = m.local !== "" ? Number(m.local) : null;
  const golesV = m.visitante !== "" ? Number(m.visitante) : null;
  const esCeroCero = golesL === 0 && golesV === 0;
  const jugadoresLocal = local.jugadores || [];
  const jugadoresVisitante = visitante.jugadores || [];
  const deshabilitarLocal = cerrado || golesL === 0;
  const deshabilitarVisitante = cerrado || golesV === 0;
  const goleadorEsLocal = jugadoresLocal.some((j) => String(j.id) === String(m.goleador_id));
  const goleadorEsVisitante = jugadoresVisitante.some((j) => String(j.id) === String(m.goleador_id));

  const ganadorEfectivo: Ganador =
    m.ganador ||
    (golesL !== null && golesV !== null ? (golesL > golesV ? "local" : golesV > golesL ? "visitante" : "empate") : "");

  const goleadoresOficiales = (() => {
    const nombres = (resultadoOficial?.goleadores || []).map((g: any) => g.jugador?.nombre).filter(Boolean) as string[];
    if (nombres.length === 0) return null;
    const conteo: Record<string, number> = {};
    nombres.forEach((n) => (conteo[n] = (conteo[n] || 0) + 1));
    return Object.entries(conteo).map(([n, c]) => (c > 1 ? `${n} (x${c})` : n)).join(", ");
  })();

  const opciones: { k: "local" | "empate" | "visitante"; t: string }[] = [
    { k: "local", t: local.nombre },
    { k: "empate", t: "Empate" },
    { k: "visitante", t: visitante.nombre },
  ];

  return (
    <div className={s.form}>
      {resultadoOficial && (
        <div className={s.oficial}>
          <span>
            Marcador oficial <strong>{resultadoOficial.goles_local_real} – {resultadoOficial.goles_visitante_real}</strong>
          </span>
          {goleadoresOficiales && <span className="caption">Goles: {goleadoresOficiales}</span>}
        </div>
      )}

      <div className={s.bloque}>
        <div className={s.bloqueTitulo}>
          <span>Marcador exacto</span>
          <span className={s.pts}>+5 pts</span>
        </div>
        <div className={s.marcadorGrid}>
          <div className={s.lado}>
            <Escudo equipo={local} size={36} />
            <span>{local.nombre}</span>
            <Stepper valor={m.local} onCambio={(v) => onMarcador("local", v)} disabled={cerrado} etiqueta={local.nombre} />
          </div>
          <span className={s.separador}>vs</span>
          <div className={s.lado}>
            <Escudo equipo={visitante} size={36} />
            <span>{visitante.nombre}</span>
            <Stepper valor={m.visitante} onCambio={(v) => onMarcador("visitante", v)} disabled={cerrado} etiqueta={visitante.nombre} />
          </div>
        </div>
      </div>

      <div className={s.bloque}>
        <div className={s.bloqueTitulo}>
          <span>Ganador o empate</span>
          <span className={s.pts}>+3 pts</span>
        </div>
        <div className={s.segmentado} role="radiogroup" aria-label="Ganador del partido">
          {opciones.map((o) => (
            <button
              key={o.k}
              type="button"
              role="radio"
              aria-checked={ganadorEfectivo === o.k}
              className={`${s.opcion} ${ganadorEfectivo === o.k ? s.opcionActiva : ""}`}
              onClick={() => !cerrado && onGanador(o.k)}
              disabled={cerrado}
              title={o.t}
            >
              {o.t}
            </button>
          ))}
        </div>
      </div>

      <div className={s.bloque}>
        <div className={s.bloqueTitulo}>
          <span>Goleador del partido</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {m.goleador_id && !esCeroCero && !cerrado && (
              <button type="button" className="btn btn-text btn-sm" onClick={() => onGoleador("")}>
                Quitar goleador
              </button>
            )}
            <span className={s.pts}>+2 pts</span>
          </span>
        </div>
        <div className={s.goleadores}>
          <div className={s.goleadorEquipo}>
            <label htmlFor={`gol-l-${local.nombre}`}>{local.nombre}</label>
            <select
              id={`gol-l-${local.nombre}`}
              className={`${s.select} ${goleadorEsLocal ? s.selectActivo : ""}`}
              value={golesL === 0 ? "" : goleadorEsLocal ? String(m.goleador_id) : ""}
              onChange={(e) => onGoleador(e.target.value)}
              disabled={deshabilitarLocal}
            >
              <option value="">Seleccionar jugador</option>
              {jugadoresLocal.map((j) => (
                <option key={j.id} value={String(j.id)}>{j.nombre}</option>
              ))}
            </select>
          </div>
          <div className={s.goleadorEquipo}>
            <label htmlFor={`gol-v-${visitante.nombre}`}>{visitante.nombre}</label>
            <select
              id={`gol-v-${visitante.nombre}`}
              className={`${s.select} ${goleadorEsVisitante ? s.selectActivo : ""}`}
              value={golesV === 0 ? "" : goleadorEsVisitante ? String(m.goleador_id) : ""}
              onChange={(e) => onGoleador(e.target.value)}
              disabled={deshabilitarVisitante}
            >
              <option value="">Seleccionar jugador</option>
              {jugadoresVisitante.map((j) => (
                <option key={j.id} value={String(j.id)}>{j.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        {esCeroCero && <p className={s.nota} style={{ margin: 0 }}>Con 0 – 0 no hay goleador: solo suma si el partido termina sin goles.</p>}
      </div>

      {!cerrado && inconsistencia && (
        <div className={s.error} role="alert">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} /> {inconsistencia}
        </div>
      )}

      {!cerrado && (
        <div className={s.acciones}>
          {guardadoOk && (
            <span className={s.ok} role="status">
              <CheckCircle2 size={14} /> Guardado
            </span>
          )}
          <button
            type="button"
            className="btn btn-primary"
            disabled={guardando || Boolean(inconsistencia)}
            onClick={onGuardar}
          >
            {guardando ? "Guardando…" : "Guardar pronóstico"}
          </button>
        </div>
      )}
    </div>
  );
}
