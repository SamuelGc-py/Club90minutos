"use client";

import React, { useMemo, useState } from "react";
import s from "./Leaderboard.module.css";
import DateNavigator from "./DateNavigator";
import { FilaConMovimiento, FilaRanking, fechasConPuntos, rankingDeFecha, rankingGeneral } from "./ranking";

const CATEGORIAS: { k: keyof FilaRanking; t: string }[] = [
  { k: "pts_resultado_exacto", t: "Exacto" },
  { k: "pts_ganador_partido", t: "Ganador" },
  { k: "pts_goleador_partido", t: "Goleador" },
  { k: "pts_campeon", t: "Campeón" },
  { k: "pts_finalistas", t: "Finalistas" },
  { k: "pts_clasificados", t: "Clasif." },
  { k: "pts_goleador_torneo", t: "Gol. torneo" },
];

function Movimiento({ n }: { n: number | null }) {
  if (n === null) return <span className={`${s.mov} ${s.igual}`} aria-hidden="true" />;
  if (n > 0) return <span className={`${s.mov} ${s.sube}`} aria-label={`Subió ${n}`}>▲{n}</span>;
  if (n < 0) return <span className={`${s.mov} ${s.baja}`} aria-label={`Bajó ${-n}`}>▼{-n}</span>;
  return <span className={`${s.mov} ${s.igual}`} aria-label="Sin cambio">=</span>;
}

export interface LeaderboardProps {
  tabla: FilaRanking[];
  puntajes: any[];
  partidos: { id: number; jornada: number; jornada_original?: number | null }[];
  usuarioId: number;
  /** Vista corta para el inicio: top 5 + tu fila. */
  compacto?: boolean;
}

export default function Leaderboard({ tabla, puntajes, partidos, usuarioId, compacto = false }: LeaderboardProps) {
  const fechas = useMemo(() => fechasConPuntos(puntajes, partidos), [puntajes, partidos]);
  const [modo, setModo] = useState<"general" | "fecha">("general");
  const [fecha, setFecha] = useState<number | null>(null);
  const fechaSel = fecha ?? fechas[fechas.length - 1] ?? null;

  const filas: FilaConMovimiento[] = useMemo(() => {
    if (modo === "fecha" && fechaSel != null) return rankingDeFecha(tabla, puntajes, partidos, fechaSel);
    return rankingGeneral(tabla, puntajes, partidos);
  }, [modo, fechaSel, tabla, puntajes, partidos]);

  // Solo columnas con puntos: las categorías del torneo aparecen cuando se activan.
  const categorias = compacto ? [] : CATEGORIAS.filter((c) => filas.some((f) => Number(f[c.k]) > 0));
  const estiloCols = { ["--cols-cat" as any]: categorias.map(() => "80px").join(" ") } as React.CSSProperties;

  const miIndice = filas.findIndex((f) => f.usuario_id === usuarioId);
  const visibles = compacto
    ? filas.filter((f, i) => i < 5 || f.usuario_id === usuarioId)
    : filas;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
      {!compacto && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--s-3)" }}>
          <div className="tabs" role="tablist" aria-label="Tipo de ranking">
            <button type="button" role="tab" className="tab" aria-selected={modo === "general"} onClick={() => setModo("general")}>
              General
            </button>
            <button
              type="button"
              role="tab"
              className="tab"
              aria-selected={modo === "fecha"}
              onClick={() => setModo("fecha")}
              disabled={fechas.length === 0}
            >
              Por fecha
            </button>
          </div>
          {modo === "fecha" && fechaSel != null && (
            <DateNavigator valor={fechaSel} opciones={fechas} onCambio={setFecha} />
          )}
        </div>
      )}

      <div className={s.tabla} style={estiloCols} role="table" aria-label={modo === "fecha" ? `Ranking de la fecha ${fechaSel}` : "Ranking general"}>
        <div className={`${s.fila} ${s.encabezado}`} role="row">
          <span role="columnheader">#</span>
          <span role="columnheader" title="Movimiento frente a la fecha anterior">±</span>
          <span role="columnheader">Participante</span>
          {categorias.map((c) => (
            <span key={c.k} role="columnheader" className={s.cat}>{c.t}</span>
          ))}
          <span role="columnheader" style={{ textAlign: "right" }}>Pts</span>
          <span role="columnheader" style={{ textAlign: "right" }} title="Distancia al líder">Dif</span>
        </div>
        {visibles.map((f, i) => {
          const esYo = f.usuario_id === usuarioId;
          const saltoAntes = compacto && esYo && miIndice > 5 && i === visibles.length - 1;
          return (
            <React.Fragment key={f.usuario_id}>
              {saltoAntes && <span className={s.separador} aria-hidden="true">···</span>}
              <div className={`${s.fila} ${esYo ? s.yo : ""}`} role="row" aria-current={esYo ? "true" : undefined}>
                <span className={s.pos} role="cell">{f.posicion}</span>
                <span role="cell"><Movimiento n={f.movimiento} /></span>
                <span className={s.nombre} role="cell" title={f.nombre_completo}>
                  {esYo ? `${f.nombre_completo} (tú)` : f.nombre_completo}
                </span>
                {categorias.map((c) => (
                  <span key={c.k} className={s.cat} role="cell">{Number(f[c.k]) || "·"}</span>
                ))}
                <span className={s.pts} role="cell">{f.pts_total}</span>
                <span className={s.dif} role="cell">{f.distanciaLider === 0 ? "—" : `−${f.distanciaLider}`}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {!compacto && fechas.length > 1 && modo === "general" && (
        <p className="caption" style={{ margin: 0 }}>
          ▲▼ compara con la tabla antes de la fecha {fechas[fechas.length - 1]}. Dif: puntos que te separan del líder.
        </p>
      )}
    </div>
  );
}
