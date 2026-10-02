"use client";

/*
 * MatchRow y MatchDayList
 * Estructura de fila (local alineado a la derecha · marcador al centro · visitante a la
 * izquierda) adaptada de scoreboardsweb · components/matchs/MatchCard.tsx
 * Copyright (c) 2026 Alex Mboutchouang — MIT License.
 * Estilos propios sobre los tokens del Manual de Marca Club 90.
 */

import React from "react";
import { ChevronDown } from "lucide-react";
import s from "./MatchRow.module.css";
import { claveDia, etiquetaDia, horaCorta } from "./formato";

export interface EquipoFila {
  nombre: string;
  escudo_url?: string | null;
}

export function Escudo({ equipo, size = 24 }: { equipo: EquipoFila; size?: number }) {
  if (equipo.escudo_url) {
    return (
      <img
        src={equipo.escudo_url}
        alt=""
        className={s.escudo}
        style={size !== 24 ? { width: size, height: size } : undefined}
        loading="lazy"
      />
    );
  }
  return <span className={s.escudoVacio} style={size !== 24 ? { width: size, height: size } : undefined} aria-hidden="true" />;
}

export interface MatchRowProps {
  fechaHora: string;
  local: EquipoFila;
  visitante: EquipoFila;
  /** Marcador a mostrar ("2 – 1"). Si no hay, se muestra "vs". */
  marcador?: string | null;
  /** Badges de estado a la derecha (pronóstico, reloj, en vivo). */
  estado?: React.ReactNode;
  /** Si se pasa, la fila es un botón que despliega `children`. */
  onToggle?: () => void;
  abierto?: boolean;
  children?: React.ReactNode;
  etiquetaAccion?: string;
}

export function MatchRow({ fechaHora, local, visitante, marcador, estado, onToggle, abierto, children, etiquetaAccion }: MatchRowProps) {
  const contenido = (
    <>
      <span className={s.hora}>{horaCorta(fechaHora)}</span>
      <span className={`${s.equipo} ${s.local}`}>
        <span>{local.nombre}</span>
        <Escudo equipo={local} />
      </span>
      {marcador ? <span className={s.marcador}>{marcador}</span> : <span className={s.vs}>vs</span>}
      <span className={s.equipo}>
        <Escudo equipo={visitante} />
        <span>{visitante.nombre}</span>
      </span>
      <span className={s.estado}>
        {estado}
        {onToggle && <ChevronDown size={16} className={`${s.chevron} ${abierto ? s.chevronAbierto : ""}`} aria-hidden="true" />}
      </span>
    </>
  );

  return (
    <div className={`${s.item} ${abierto ? s.itemAbierto : ""}`}>
      {onToggle ? (
        <button
          type="button"
          className={s.fila}
          onClick={onToggle}
          aria-expanded={!!abierto}
          aria-label={etiquetaAccion ? `${etiquetaAccion}: ${local.nombre} vs ${visitante.nombre}` : undefined}
        >
          {contenido}
        </button>
      ) : (
        <div className={s.fila}>{contenido}</div>
      )}
      {abierto && children && <div className={s.detalle}>{children}</div>}
    </div>
  );
}

/** Agrupa elementos con fecha por día (hora de Bogotá) dentro de un contenedor de lista. */
export function MatchDayList<T>({
  items,
  fecha,
  render,
  vacio,
}: {
  items: T[];
  fecha: (item: T) => string;
  render: (item: T) => React.ReactNode;
  vacio?: React.ReactNode;
}) {
  if (items.length === 0) return <>{vacio ?? null}</>;
  const grupos: { clave: string; etiqueta: string; items: T[] }[] = [];
  for (const it of items) {
    const iso = fecha(it);
    const clave = claveDia(iso);
    let g = grupos.find((x) => x.clave === clave);
    if (!g) {
      g = { clave, etiqueta: etiquetaDia(iso), items: [] };
      grupos.push(g);
    }
    g.items.push(it);
  }
  return (
    <div className={s.lista}>
      {grupos.map((g) => (
        <React.Fragment key={g.clave}>
          <div className={s.dia}>{g.etiqueta}</div>
          {g.items.map((it) => render(it))}
        </React.Fragment>
      ))}
    </div>
  );
}

export default MatchRow;
