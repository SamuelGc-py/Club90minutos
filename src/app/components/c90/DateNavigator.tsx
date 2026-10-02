"use client";

/*
 * Selector de fecha (jornada) con flechas.
 * Patrón de navegación anterior / actual / siguiente adaptado de
 * scoreboardsweb · components/DateNavigator.tsx
 * Copyright (c) 2026 Alex Mboutchouang — MIT License.
 */

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DateNavigator({
  valor,
  opciones,
  onCambio,
  etiqueta = (n: number) => `Fecha ${n}`,
}: {
  valor: number;
  /** Fechas disponibles, en orden. */
  opciones: number[];
  onCambio: (n: number) => void;
  etiqueta?: (n: number) => string;
}) {
  const i = opciones.indexOf(valor);
  const anterior = i > 0 ? opciones[i - 1] : null;
  const siguiente = i >= 0 && i < opciones.length - 1 ? opciones[i + 1] : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--s-2)" }} role="group" aria-label="Seleccionar fecha">
      <button
        type="button"
        className="icon-btn"
        onClick={() => anterior !== null && onCambio(anterior)}
        disabled={anterior === null}
        aria-label={anterior !== null ? `Ir a ${etiqueta(anterior)}` : "Sin fecha anterior"}
        style={{ opacity: anterior === null ? 0.35 : 1 }}
      >
        <ChevronLeft size={18} />
      </button>
      <select
        className="input"
        value={valor}
        onChange={(e) => onCambio(Number(e.target.value))}
        aria-label="Fecha"
        style={{ width: "auto", minWidth: 128, textAlign: "center", fontWeight: 600, borderRadius: "var(--r-pill)" }}
      >
        {opciones.map((n) => (
          <option key={n} value={n}>{etiqueta(n)}</option>
        ))}
      </select>
      <button
        type="button"
        className="icon-btn"
        onClick={() => siguiente !== null && onCambio(siguiente)}
        disabled={siguiente === null}
        aria-label={siguiente !== null ? `Ir a ${etiqueta(siguiente)}` : "Sin fecha siguiente"}
        style={{ opacity: siguiente === null ? 0.35 : 1 }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
