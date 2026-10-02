"use client";

import React from "react";
import { LogOut, type LucideIcon } from "lucide-react";
import s from "./AppTopBar.module.css";
import { Logotipo } from "./Brand";

export interface ItemNav {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

/**
 * Barra superior: isotipo a la izquierda (manual 05: 26–32 px), navegación con iconos
 * de línea y usuario a la derecha. En celular la navegación baja a una fila desplazable.
 */
export default function AppTopBar({
  items,
  activo,
  onInicio,
  nombreUsuario,
  onSalir,
}: {
  items: ItemNav[];
  activo: string;
  onInicio: () => void;
  nombreUsuario: string;
  onSalir: () => void;
}) {
  return (
    <header className={s.barra}>
      <div className={s.fila}>
        <button type="button" className={s.marca} onClick={onInicio} aria-label="Ir a Mi jornada">
          <Logotipo size={28} />
        </button>
        <div className={s.usuario}>
          <span className={s.avatar} aria-hidden="true">{(nombreUsuario || "?").charAt(0).toUpperCase()}</span>
          <span className={s.nombre}>{nombreUsuario}</span>
          <button type="button" className={`icon-btn ${s.salir}`} onClick={onSalir} aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </div>
      <nav className={s.nav} aria-label="Secciones">
          {items.map((it) => {
            const Icono = it.icon;
            const esActivo = activo === it.key;
            return (
              <button
                key={it.key}
                type="button"
                className={`${s.item} ${esActivo ? s.activo : ""}`}
                onClick={it.onClick}
                aria-current={esActivo ? "page" : undefined}
              >
                <Icono size={16} aria-hidden="true" />
                {it.label}
              </button>
            );
          })}
      </nav>
    </header>
  );
}
