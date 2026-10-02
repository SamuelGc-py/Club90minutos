"use client";

import { useEffect, useState } from "react";
import { Clock, Lock } from "lucide-react";
import { horaCierre, tiempoRestante } from "./formato";

type Tipo = "programado" | "por_cerrar" | "cerrado" | "en_vivo" | "descanso" | "finalizado" | "aplazado";

interface Estado {
  tipo: Tipo;
  texto: string;
}

// Mismos cortes que el reloj original: cierre 30 min antes; 1T hasta el 45',
// descanso hasta el 60', 2T hasta el 110' (estimado cuando no hay dato de ESPN).
function calcular(fechaHoraPartido: string, estado?: string): Estado {
  if (estado === "aplazado") return { tipo: "aplazado", texto: "Aplazado" };
  if (estado === "resultado_cargado" || estado === "puntaje_calculado") return { tipo: "finalizado", texto: "Finalizado" };

  const ahora = Date.now();
  const inicio = new Date(fechaHoraPartido).getTime();
  const restante = horaCierre(fechaHoraPartido) - ahora;
  const transcurrido = ahora - inicio;

  if (restante > 0) {
    const porCerrar = restante < 2 * 60 * 60 * 1000;
    return { tipo: porCerrar ? "por_cerrar" : "programado", texto: tiempoRestante(restante) };
  }
  if (transcurrido < 0) return { tipo: "cerrado", texto: "Cerrado" };

  const min = Math.floor(transcurrido / 60000);
  if (min <= 45) return { tipo: "en_vivo", texto: `${min}'` };
  if (min <= 60) return { tipo: "descanso", texto: "Descanso" };
  if (min <= 110) return { tipo: "en_vivo", texto: `${min - 15}'` };
  return { tipo: "finalizado", texto: "Finalizado" };
}

/**
 * Reloj de cierre de pronósticos. Muestra "Cierra en 3 d 4 h", "Cierra en 4 h 12 min"
 * o "Cierra en 12:09"; pasa a amarillo cuando faltan menos de 2 horas.
 */
export default function Countdown({
  fechaHoraPartido,
  estado,
  compacto = false,
}: {
  fechaHoraPartido: string;
  estado?: string;
  /** Sin el prefijo "Cierra en" (para filas densas). */
  compacto?: boolean;
}) {
  const [e, setE] = useState<Estado>(() => calcular(fechaHoraPartido, estado));

  useEffect(() => {
    setE(calcular(fechaHoraPartido, estado));
    const id = setInterval(() => setE(calcular(fechaHoraPartido, estado)), 1000);
    return () => clearInterval(id);
  }, [fechaHoraPartido, estado]);

  if (e.tipo === "programado" || e.tipo === "por_cerrar") {
    return (
      <span className={`badge ${e.tipo === "por_cerrar" ? "badge-warn" : "badge-neutral"}`} title="Cierre de pronósticos: 30 minutos antes del partido">
        <Clock size={12} aria-hidden="true" />
        {!compacto && <span>Cierra en</span>}
        <span className="num">{e.texto}</span>
      </span>
    );
  }
  if (e.tipo === "en_vivo") return <span className="badge badge-live">{e.texto}</span>;
  if (e.tipo === "descanso") return <span className="badge badge-warn">Descanso</span>;
  if (e.tipo === "aplazado") return <span className="badge badge-warn">Aplazado</span>;
  if (e.tipo === "cerrado") {
    return (
      <span className="badge badge-neutral">
        <Lock size={12} aria-hidden="true" /> Cerrado
      </span>
    );
  }
  return <span className="badge badge-neutral">Finalizado</span>;
}
