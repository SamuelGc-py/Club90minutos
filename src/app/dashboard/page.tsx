"use client";

import React, { useState, useEffect, useMemo, Component } from "react";
import { CheckCircle2, ShieldAlert, Save, RefreshCw, Trophy, Calendar, LogOut, AlertTriangle, UserCheck, Lock, Clock, Eye, List, Download, Users, Menu, X, Flame, Camera, BarChart3, ClipboardCheck, Trash2, Hourglass } from "lucide-react";
import Link from "next/link";
import { toPng } from 'html-to-image';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import TablaPosicionesAfiche, { TABLA_POSICIONES_FIJA } from "../components/TablaPosicionesAfiche";

interface Jugador {
  id: number;
  nombre: string;
  equipo_id: number;
  equipo?: Equipo;
}

interface Equipo {
  id: number;
  nombre: string;
  escudo_url?: string;
  jugadores?: Jugador[];
}

interface Partido {
  id: number;
  fase: string;
  jornada: number;
  equipo_local: Equipo;
  equipo_visitante: Equipo;
  fecha_hora_partido: string;
  estadio?: string;
  estado?: string;
  resultado_oficial?: any;
}

interface UsuarioSesion {
  id: number;
  nombre: string;
  correo: string;
  rol_id?: number;
}

// Marcador individual con ganador predicho y goleador
interface EstadoMarcador {
  local: string;
  visitante: string;
  ganador: "local" | "empate" | "visitante" | "";
  goleador_id: string;
}

function Cancha2DVisualizador({ partido }: { partido: any }) {
  const incidencias: any[] = partido.incidencias || [];
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState<any | null>(null);

  // La incidencia actual es la seleccionada o la primera más reciente del feed de ESPN
  const incActual = incidenciaSeleccionada || incidencias[0] || null;

  let textoAccion = "⚡ JUGADA EN CURSO / DISPUTA EN CENTRO DE CAMPO";
  let colorAccion = "#38bdf8";
  let posCalculada = { x: 50, y: 50 };

  if (incActual) {
    const txt = (incActual.texto || "").toLowerCase();
    const esLocal = incActual.equipo
      ? incActual.equipo.toLowerCase().includes(partido.equipoLocal.nombre.toLowerCase().split(" ")[0])
      : true;

    if (incActual.tipo === "gol" || txt.includes("goal") || txt.includes("gol")) {
      textoAccion = `⚽ ¡GOOOOOOL! ${incActual.minuto || ""} ${incActual.texto || ""}`;
      colorAccion = "#10b981";
      posCalculada = esLocal ? { x: 92, y: 50 } : { x: 8, y: 50 };
    } else if (txt.includes("shot") || txt.includes("remate") || txt.includes("tiro")) {
      textoAccion = `🔥 REMATE AL ARCO ${incActual.minuto || ""} - ${incActual.texto || ""}`;
      colorAccion = "#ef4444";
      posCalculada = esLocal ? { x: 78, y: 40 } : { x: 22, y: 60 };
    } else if (txt.includes("corner") || txt.includes("esquina")) {
      textoAccion = `🚩 CÓRNER ${incActual.minuto || ""} - ${incActual.texto || ""}`;
      colorAccion = "#f59e0b";
      posCalculada = esLocal ? { x: 96, y: 12 } : { x: 4, y: 88 };
    } else if (txt.includes("foul") || txt.includes("falta") || incActual.tipo === "amarilla" || incActual.tipo === "roja") {
      textoAccion = `🛑 FALTA / TARJETA ${incActual.minuto || ""} - ${incActual.texto || ""}`;
      colorAccion = "#eab308";
      posCalculada = esLocal ? { x: 42, y: 35 } : { x: 58, y: 65 };
    } else if (incActual.tipo === "cambio" || txt.includes("sustitucion") || txt.includes("cambio")) {
      textoAccion = `🔄 CAMBIO ${incActual.minuto || ""} - ${incActual.texto || ""}`;
      colorAccion = "#a855f7";
      posCalculada = { x: 50, y: 90 };
    } else {
      textoAccion = `⚡ ${incActual.minuto || ""} ${incActual.texto || "Jugada en vivo"}`;
      posCalculada = esLocal ? { x: 65, y: 45 } : { x: 35, y: 55 };
    }
  }

  const finalX = Math.min(94, Math.max(6, posCalculada.x));
  const finalY = Math.min(88, Math.max(12, posCalculada.y));

  return (
    <div style={{ background: "#06130b", borderRadius: 14, padding: 16, border: "1px solid #10b981", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#34d399", display: "flex", alignItems: "center", gap: 6 }}>
          🌱 CANCHA 2D EN VIVO (JUGADAS REALES DE ESPN)
        </span>
        <span style={{ background: "rgba(0,0,0,0.7)", color: colorAccion, border: `1px solid ${colorAccion}`, padding: "4px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 900, boxShadow: `0 0 10px ${colorAccion}66`, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {textoAccion}
        </span>
      </div>

      <div style={{ position: "relative", width: "100%", height: 190, background: "linear-gradient(180deg, #15803d 0%, #166534 100%)", borderRadius: 10, border: "2px solid #22c55e", boxShadow: "inset 0 0 24px rgba(0,0,0,0.6)" }}>
        <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="4 2" />
          <circle cx="50%" cy="50%" r="35" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <circle cx="50%" cy="50%" r="3" fill="rgba(255,255,255,0.9)" />

          <rect x="0" y="25%" width="16%" height="50%" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <rect x="0" y="38%" width="6%" height="24%" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />

          <rect x="84%" y="25%" width="16%" height="50%" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <rect x="94%" y="38%" width="6%" height="24%" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        </svg>

        <div style={{ position: "absolute", left: 12, top: 12, fontWeight: 900, color: "#ffffff", fontSize: "0.85rem", textShadow: "0 2px 4px rgba(0,0,0,0.9)" }}>
          🏠 {partido.equipoLocal.nombre}
        </div>
        <div style={{ position: "absolute", right: 12, top: 12, fontWeight: 900, color: "#ffffff", fontSize: "0.85rem", textShadow: "0 2px 4px rgba(0,0,0,0.9)" }}>
          ✈️ {partido.equipoVisitante.nombre}
        </div>

        <div
          style={{
            position: "absolute",
            left: `${finalX}%`,
            top: `${finalY}%`,
            transform: "translate(-50%, -50%)",
            transition: "all 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 10,
          }}
        >
          <div style={{ position: "absolute", top: -8, left: -8, width: 34, height: 34, borderRadius: "50%", background: colorAccion, opacity: 0.5, animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
          <div style={{ fontSize: "1.6rem", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))" }}>
            ⚽
          </div>
        </div>
      </div>

      {/* FEED DE JUGADAS DEL PARTIDO EN VIVO (ESPN) */}
      <div style={{ marginTop: 12, background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span>📋 JUGADAS DEL PARTIDO EN DIRECTO (TOCA CUALQUIERA PARA MOVER EL BALÓN)</span>
          {incidenciaSeleccionada && (
            <span
              onClick={() => setIncidenciaSeleccionada(null)}
              style={{ color: "#38bdf8", cursor: "pointer", textDecoration: "underline" }}
            >
              🔄 Volver al vivo
            </span>
          )}
        </div>

        {incidencias.length === 0 ? (
          <div style={{ fontSize: "0.8rem", color: "#64748b", fontStyle: "italic", textAlign: "center", padding: 8 }}>
            Sin incidencias registradas en la transmisión en vivo aún. El balón se ubica en el centro de disputas.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 130, overflowY: "auto" }}>
            {incidencias.map((item: any, idx: number) => {
              const esActiva = (incidenciaSeleccionada?.id || incidencias[0]?.id) === item.id;
              return (
                <div
                  key={item.id || idx}
                  onClick={() => setIncidenciaSeleccionada(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: esActiva ? "rgba(56, 189, 248, 0.2)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${esActiva ? "#38bdf8" : "transparent"}`,
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontWeight: 900, color: "#f5b000", minWidth: 32 }}>
                    {item.minuto || "0'"}
                  </span>
                  <span style={{ flex: 1, color: esActiva ? "#ffffff" : "#cbd5e1", fontWeight: esActiva ? 800 : 500 }}>
                    {item.texto || item.tipo}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    {item.equipo || ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BarraEstadistica({ label, valLocal, valVisitante, unit = "" }: { label: string; valLocal: string | number; valVisitante: string | number; unit?: string }) {
  const nL = parseFloat(String(valLocal).replace("%", "")) || 0;
  const nV = parseFloat(String(valVisitante).replace("%", "")) || 0;
  const total = nL + nV || 1;
  const pctL = Math.round((nL / total) * 100);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: 4, color: "#ffffff" }}>
        <span style={{ color: "#34d399" }}>{valLocal}{unit}</span>
        <span style={{ color: "#cbd5e1", fontSize: "0.78rem" }}>{label}</span>
        <span style={{ color: "#38bdf8" }}>{valVisitante}{unit}</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${pctL}%`, background: "#10b981", transition: "width 0.5s ease" }} />
        <div style={{ flex: 1, background: "#38bdf8", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function RelojCuentaRegresiva({
  fechaHoraPartido,
  estado,
}: {
  fechaHoraPartido: string;
  estado?: string;
}) {
  const [etiqueta, setEtiqueta] = useState<string>("");
  const [tipo, setTipo] = useState<"programado" | "cerrado" | "en_vivo" | "descanso" | "finalizado" | "aplazado">("programado");

  useEffect(() => {
    function calcular() {
      if (estado === "aplazado") {
        setTipo("aplazado");
        setEtiqueta("⚠️ APLAZADO");
        return;
      }

      if (estado === "resultado_cargado" || estado === "puntaje_calculado") {
        setTipo("finalizado");
        setEtiqueta("⚽ FINALIZADO");
        return;
      }

      const horaPartido = new Date(fechaHoraPartido).getTime();
      const horaCierre = horaPartido - 30 * 60 * 1000;
      const ahora = new Date().getTime();
      const difCierre = horaCierre - ahora;
      const difInicio = ahora - horaPartido;

      if (difCierre > 0) {
        setTipo("programado");
        const hrs = Math.floor(difCierre / (1000 * 60 * 60));
        const mins = Math.floor((difCierre % (1000 * 60 * 60)) / (1000 * 60));
        const segs = Math.floor((difCierre % (1000 * 60)) / 1000);
        const pad = (n: number) => String(n).padStart(2, "0");
        if (hrs > 0) {
          setEtiqueta(`⏳ Cierra en ${pad(hrs)}:${pad(mins)}:${pad(segs)} hrs`);
        } else {
          setEtiqueta(`⏳ Cierra en ${pad(mins)}:${pad(segs)} mins`);
        }
      } else if (difInicio < 0) {
        setTipo("cerrado");
        setEtiqueta("🔒 Pronósticos Cerrados");
      } else {
        const minutosTranscurridos = Math.floor(difInicio / (1000 * 60));

        if (minutosTranscurridos <= 45) {
          setTipo("en_vivo");
          setEtiqueta(`🟢 EN VIVO ${minutosTranscurridos}' (1T)`);
        } else if (minutosTranscurridos <= 60) {
          setTipo("descanso");
          setEtiqueta("🟡 EN VIVO (DESCANSO)");
        } else if (minutosTranscurridos <= 110) {
          setTipo("en_vivo");
          const min2T = minutosTranscurridos - 15;
          setEtiqueta(`🟢 EN VIVO ${min2T}' (2T)`);
        } else {
          setTipo("finalizado");
          setEtiqueta("⚽ FINALIZADO");
        }
      }
    }

    calcular();
    const interval = setInterval(calcular, 1000);
    return () => clearInterval(interval);
  }, [fechaHoraPartido, estado]);

  let styleProps = {
    background: "rgba(56, 189, 248, 0.12)",
    color: "#38bdf8",
    border: "1px solid rgba(56, 189, 248, 0.3)",
  };

  if (tipo === "cerrado") {
    styleProps = {
      background: "rgba(245, 158, 11, 0.12)",
      color: "#f59e0b",
      border: "1px solid rgba(245, 158, 11, 0.35)",
    };
  } else if (tipo === "en_vivo") {
    styleProps = {
      background: "rgba(239, 68, 68, 0.18)",
      color: "#ff4d4d",
      border: "1px solid rgba(239, 68, 68, 0.5)",
    };
  } else if (tipo === "descanso") {
    styleProps = {
      background: "rgba(245, 158, 11, 0.18)",
      color: "#fbbf24",
      border: "1px solid rgba(245, 158, 11, 0.45)",
    };
  } else if (tipo === "finalizado") {
    styleProps = {
      background: "rgba(16, 185, 129, 0.15)",
      color: "#10b981",
      border: "1px solid rgba(16, 185, 129, 0.3)",
    };
  } else if (tipo === "aplazado") {
    styleProps = {
      background: "rgba(245, 158, 11, 0.15)",
      color: "#f59e0b",
      border: "1px solid rgba(245, 158, 11, 0.3)",
    };
  }

  return (
    <span
      style={{
        fontSize: "0.82rem",
        fontWeight: 800,
        padding: "5px 12px",
        borderRadius: "20px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.3px",
        boxShadow: tipo === "en_vivo" ? "0 0 10px rgba(239, 68, 68, 0.3)" : "none",
        ...styleProps,
      }}
    >
      {tipo === "en_vivo" && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#ef4444",
            boxShadow: "0 0 8px #ef4444",
          }}
        />
      )}
      {etiqueta}
    </span>
  );
}

function normalizarNombreEquipo(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/f\.c\.|fc|d\.a\.f\.|c\.d\./gi, "")
    .trim();
}

// Empareja un partido de la BD con su evento en vivo de ESPN (mismo criterio que sincronizarMarcadoresEnVivo)
function buscarPartidoEnVivoESPN(partido: any, partidosEnVivo: any[]) {
  if (!partido?.equipo_local?.nombre || !partido?.equipo_visitante?.nombre || !partidosEnVivo?.length) return null;
  const localNorm = normalizarNombreEquipo(partido.equipo_local.nombre);
  const visitanteNorm = normalizarNombreEquipo(partido.equipo_visitante.nombre);
  return (
    partidosEnVivo.find((p) => {
      const pLocalNorm = normalizarNombreEquipo(p.equipoLocal?.nombre || "");
      const pVisitanteNorm = normalizarNombreEquipo(p.equipoVisitante?.nombre || "");
      const matchLocal = pLocalNorm.includes(localNorm) || localNorm.includes(pLocalNorm);
      const matchVisitante = pVisitanteNorm.includes(visitanteNorm) || visitanteNorm.includes(pVisitanteNorm);
      return matchLocal && matchVisitante;
    }) || null
  );
}

// Un partido solo se considera finalizado cuando la BD lo confirma (admin/cron) o ESPN reporta STATUS_FULL_TIME.
// Ya NO se usa Boolean(partido.resultado_oficial): ese registro se crea apenas arranca el partido (marcador parcial en vivo)
// y bajaba el pronóstico a "finalizado" prematuramente.
function esPartidoFinalizadoReal(partido: any, partidosEnVivo: any[]) {
  const liveMatch = buscarPartidoEnVivoESPN(partido, partidosEnVivo);
  return (
    partido.estado === "resultado_cargado" ||
    partido.estado === "puntaje_calculado" ||
    Boolean(liveMatch?.esFinalizado)
  );
}

// Formatea la hora de un partido en formato corto tipo "2:00 p.m.", siempre en hora de Bogotá
// (fija, sin importar la zona horaria del navegador/servidor que renderice esto).
function formatearHoraPartido(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Bogota" });
}

// Formatea la fecha de un partido en formato corto tipo "8 ago", siempre en hora de Bogotá.
function formatearFechaPartido(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", timeZone: "America/Bogota" });
}

// Convierte un ISO string a formato "YYYY-MM-DDTHH:mm" en hora de Bogotá (UTC-5 fijo, sin
// horario de verano) para precargar inputs datetime-local, sin depender de la zona horaria
// configurada en el navegador/SO de quien lo mire.
function aInputDatetimeLocal(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const bogota = new Date(d.getTime() - 5 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${bogota.getUTCFullYear()}-${pad(bogota.getUTCMonth() + 1)}-${pad(bogota.getUTCDate())}T${pad(bogota.getUTCHours())}:${pad(bogota.getUTCMinutes())}`;
}

function MarcadorEnVivoMini({ live }: { live: any }) {
  if (!live) return null;
  const esSuspendido = /retrasad|suspend/i.test(live.estadoDetail || "");
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: esSuspendido ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
        border: esSuspendido ? "1px solid rgba(245, 158, 11, 0.5)" : "1px solid rgba(239, 68, 68, 0.5)",
        borderRadius: 12,
        padding: "5px 12px",
        boxShadow: esSuspendido ? "none" : "0 0 10px rgba(239, 68, 68, 0.25)",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: esSuspendido ? "#f59e0b" : "#ef4444",
          boxShadow: esSuspendido ? "0 0 8px #f59e0b" : "0 0 8px #ef4444",
          flexShrink: 0,
        }}
      />
      <span style={{ fontWeight: 900, color: "#fff", fontSize: "0.82rem", fontVariantNumeric: "tabular-nums" }}>
        {live.equipoLocal.goles} - {live.equipoVisitante.goles}
      </span>
      <span style={{ fontSize: "0.75rem", color: esSuspendido ? "#fbbf24" : "#fca5a5", fontWeight: 700 }}>
        {esSuspendido ? "SUSPENDIDO" : (live.reloj || live.estadoDetail || "EN VIVO")}
      </span>
    </div>
  );
}

class GlobalErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("GlobalErrorBoundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#ffffff", background: "#0b1622", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚽</div>
          <h2 style={{ color: "#38bdf8", marginBottom: 8 }}>Actualización del Sistema en Curso</h2>
          <p style={{ color: "#94a3b8", maxWidth: 500, margin: "0 auto 20px", fontSize: "0.92rem", lineHeight: 1.5 }}>
            Se han actualizado los datos de la polla. Haz clic abajo para sincronizar la aplicación.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              try { sessionStorage.removeItem("polla_sesion"); } catch (e) { }
              window.location.href = "/";
            }}
            style={{ padding: "10px 24px", fontSize: "0.95rem", fontWeight: 800 }}
          >
            🔄 Sincronizar App Ahora
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ExpressPageContent() {
  // Estado de sesión
  const [correoInput, setCorreoInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [cargandoValidacion, setCargandoValidacion] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<{ tipo: "error" | "info" | "exito"; texto: string } | null>(null);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [sesionToken, setSesionToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // El panel admin necesita ancho completo; "main" (en globals.css) limita todo a 1000px.
  // En vez de "escapar" con trucos de 100vw (frágiles con la barra de scroll), se anula
  // el límite directamente sobre "main" vía una clase en <body>.
  useEffect(() => {
    const esAdmin = usuario?.rol_id === 2;
    document.body.classList.toggle("admin-fullscreen", esAdmin);
    return () => {
      document.body.classList.remove("admin-fullscreen");
    };
  }, [usuario]);

  // Estado de datos maestros
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargandoMaestros, setCargandoMaestros] = useState(false);

  // Estado del Formulario (Pestañas)
  const [tabActiva, setTabActiva] = useState<"inicio" | "partidos" | "aplazados" | "inicial" | "mis_pronosticos" | "admin" | "posiciones" | "en_vivo" | "finalizados">("inicio");

  // Pantalla de Inicio del participante: también ocupa toda la pantalla (igual que el admin).
  useEffect(() => {
    const esInicioParticipante = usuario?.rol_id !== 2 && tabActiva === "inicio";
    document.body.classList.toggle("inicio-fullscreen", esInicioParticipante);
    return () => {
      document.body.classList.remove("inicio-fullscreen");
    };
  }, [usuario, tabActiva]);

  // Sincronizar tabActiva con el hash de la URL para soportar el botón "Atrás" nativo de celulares
  useEffect(() => {
    if (typeof window !== "undefined" && usuario) {
      if (window.location.hash !== `#${tabActiva}`) {
        window.history.pushState(null, "", `#${tabActiva}`);
      }
    }
  }, [tabActiva, usuario]);

  useEffect(() => {
    const onPopState = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && hash !== tabActiva) {
        setTabActiva(hash as any);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [tabActiva]);

  const [partidosEnVivo, setPartidosEnVivo] = useState<any[]>([]);
  const [cargandoEnVivo, setCargandoEnVivo] = useState<boolean>(false);
  const [partidoDesplegadoId, setPartidoDesplegadoId] = useState<string | null>(null);
  const [subTabDetalle, setSubTabDetalle] = useState<Record<string, "cancha" | "stats">>({});
  const [partidosDesplegados, setPartidosDesplegados] = useState<Record<number, boolean>>({});
  const [pronosticosTablasDesplegadas, setPronosticosTablasDesplegadas] = useState<Record<number, boolean>>({});
  const nombreUsuarioDisplay = usuario?.nombre || (usuario as any)?.nombre_completo || "";
  const esSamuel = usuario ? (nombreUsuarioDisplay.toLowerCase().includes("samuel") || usuario.id === 2) : false;

  const cargarPartidosEnVivo = async () => {
    setCargandoEnVivo(true);
    try {
      const res = await fetch("/api/partidos-en-vivo", { cache: "no-store" });
      const data = await res.json();
      if (data.partidos) {
        setPartidosEnVivo(data.partidos);
        if (data.partidos.length > 0 && !partidoDesplegadoId) {
          setPartidoDesplegadoId(data.partidos[0].eventId);
        }
      }
    } catch (err) {
      console.error("Error al cargar partidos en vivo:", err);
    } finally {
      setCargandoEnVivo(false);
    }
  };

  // Solo vale la pena consultar ESPN si hay algún partido dentro de su ventana real de juego
  // (ya arrancó y no ha pasado demasiado tiempo). Evita refrescos/re-renders de fondo cada 15s
  // cuando no hay nada en vivo, que es la mayor parte del tiempo.
  const hayPartidoPotencialmenteEnVivo = useMemo(() => {
    const ahora = Date.now();
    return partidos.some((p) => {
      if (p.estado === "resultado_cargado" || p.estado === "puntaje_calculado" || p.estado === "aplazado") return false;
      const inicio = new Date(p.fecha_hora_partido).getTime();
      return ahora >= inicio && ahora <= inicio + 3 * 60 * 60 * 1000;
    });
  }, [partidos]);

  // Se sincroniza también en las pestañas de pronósticos/finalizados para saber en tiempo real
  // (vía ESPN) si un partido ya empezó, sigue en curso o realmente terminó.
  useEffect(() => {
    const enPestañaRelevante = ["en_vivo", "partidos", "finalizados", "mis_pronosticos", "inicio", "aplazados"].includes(tabActiva);
    if (enPestañaRelevante && (tabActiva === "en_vivo" || hayPartidoPotencialmenteEnVivo)) {
      cargarPartidosEnVivo();
      const interval = setInterval(cargarPartidosEnVivo, 15000);
      return () => clearInterval(interval);
    }
  }, [tabActiva, hayPartidoPotencialmenteEnVivo]);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true);
  const [campeonId, setCampeonId] = useState<number | "">("");
  const [finalista1Id, setFinalista1Id] = useState<number | "">("");
  const [finalista2Id, setFinalista2Id] = useState<number | "">("");
  const [goleadorTorneoId, setGoleadorTorneoId] = useState<number | "">("");
  const [clasificadosIds, setClasificadosIds] = useState<number[]>([]);

  // Marcadores de partidos
  const [marcadores, setMarcadores] = useState<Record<number, EstadoMarcador>>({});
  const [guardando, setGuardando] = useState(false);

  // Consolidados (Administrador)
  const [consolidados, setConsolidados] = useState<{
    usuarios: any[];
    tablaPosiciones?: any[];
    prediccionesPartidos: any[];
    prediccionesIniciales: any[];
  } | null>(null);
  const [cargandoConsolidados, setCargandoConsolidados] = useState(false);
  const [partidoAdminVer, setPartidoAdminVer] = useState<number | null>(null);
  const [guardandoPartidoId, setGuardandoPartidoId] = useState<number | null>(null);
  const [partidoGuardadoExitoId, setPartidoGuardadoExitoId] = useState<number | null>(null);

  // Filtros por Jornada / Fecha
  const [fechaParticipante, setFechaParticipante] = useState<number>(3); // Auto-determinado por progreso de la polla
  const [fechaAdmin, setFechaAdmin] = useState<number>(3); // Default Fecha 3 para admin
  const [seccionAdmin, setSeccionAdmin] = useState<"partidos" | "torneo">("partidos");
  const [seccionAdminPanel, setSeccionAdminPanel] = useState<"predicciones" | "liquidacion" | "posiciones" | "aplazados" | "editar_partidos">("predicciones");

  // Calcular automáticamente la fecha activa para participantes (primera fecha no finalizada)
  useEffect(() => {
    if (partidos && partidos.length > 0) {
      const jornadas = Array.from(new Set(partidos.map((p) => p.jornada))).sort((a, b) => a - b);
      const ahora = new Date().getTime();

      const jornadaIncompleta = jornadas.find((j) => {
        const partidosFecha = partidos.filter((p) => p.jornada === j && p.estado !== "aplazado");
        if (partidosFecha.length === 0) return false;

        const todosFinalizados = partidosFecha.every((p) => {
          const esFinalizado = esPartidoFinalizadoReal(p, partidosEnVivo);
          const hace2Horas = ahora >= new Date(p.fecha_hora_partido).getTime() + 2 * 60 * 60 * 1000;
          return esFinalizado || hace2Horas;
        });

        return !todosFinalizados;
      });

      if (jornadaIncompleta) {
        setFechaParticipante(jornadaIncompleta);
      }
    }
  }, [partidos, partidosEnVivo]);

  // Sincronizar pronósticos en vivo con localStorage de sesión
  const actualizarSesionLocalStorage = (partidoId: number, local: number, visitante: number, goleadorId: number | null) => {
    try {
      const sesionStr = sessionStorage.getItem("polla_sesion");
      if (!sesionStr) return;
      const sesionData = JSON.parse(sesionStr);
      let preds = sesionData.prediccionesGuardadas || { partidos: [], prediccionesPartidos: [], inicial: null };
      const listaBase = preds.partidos || preds.prediccionesPartidos || [];

      const idx = listaBase.findIndex((p: any) => p.partido_id === partidoId);
      const nuevoObj = {
        partido_id: partidoId,
        goles_local: local,
        goles_visitante: visitante,
        goles_local_predicho: local,
        goles_visitante_predicho: visitante,
        jugador_goleador_id: goleadorId,
        jugador_goleador_predicho_id: goleadorId,
      };
      if (idx >= 0) {
        listaBase[idx] = { ...listaBase[idx], ...nuevoObj };
      } else {
        listaBase.push(nuevoObj);
      }
      preds.partidos = listaBase;
      preds.prediccionesPartidos = listaBase;
      sesionData.prediccionesGuardadas = preds;
      sessionStorage.setItem("polla_sesion", JSON.stringify(sesionData));
      aplicarPrediccionesGuardadas(preds);
    } catch (e) {
      console.error("Error al actualizar localStorage de sesión:", e);
    }
  };

  const handleGuardarPronosticoPartido = async (partidoId: number) => {
    if (!usuario) return;
    const m = marcadores[partidoId];
    if (!m || m.local === "" || m.visitante === "") {
      setMensajeEstado({ tipo: "error", texto: "Debes ingresar ambos goles (Local y Visitante) antes de guardar este partido." });
      return;
    }

    if ((Number(m.local) > 0 || Number(m.visitante) > 0) && (!m.goleador_id || m.goleador_id === "")) {
      setMensajeEstado({ tipo: "error", texto: "❌ Inconsistencia: Ingresaste un marcador con goles pero dejaste goleador en 'Ninguno'. Si hay goles en el partido, es OBLIGATORIO elegir cuál jugador anotará gol." });
      return;
    }

    try {
      setGuardandoPartidoId(partidoId);
      setMensajeEstado({ tipo: "info", texto: "Guardando pronóstico del partido..." });

      const res = await fetch("/api/guardar-pronosticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          partidos: [
            {
              partido_id: partidoId,
              goles_local: Number(m.local),
              goles_visitante: Number(m.visitante),
              jugador_goleador_id: m.goleador_id ? Number(m.goleador_id) : null,
            },
          ],
        }),
      });

      const data = await res.json();
      const fueRechazado = Array.isArray(data.partidosRechazados) && data.partidosRechazados.includes(partidoId);
      if (!res.ok || data.error || fueRechazado) {
        setMensajeEstado({
          tipo: "error",
          texto: fueRechazado
            ? "⏱️ Ya cerró el plazo para este partido (30 min antes del inicio). No se guardó."
            : data.error || "Error al guardar el pronóstico.",
        });
      } else {
        setMensajeEstado({ tipo: "exito", texto: "¡Pronóstico guardado exitosamente para este partido!" });
        setPartidoGuardadoExitoId(partidoId);
        actualizarSesionLocalStorage(partidoId, Number(m.local), Number(m.visitante), m.goleador_id ? Number(m.goleador_id) : null);

        // Actualizar consolidados en memoria de forma instantánea sin retraso de red
        if (consolidados && usuario) {
          const newPartidos = [...(consolidados.prediccionesPartidos || [])];
          const pIdx = newPartidos.findIndex(
            (p: any) => p.partido_id === partidoId && p.usuario?.correo === usuario.correo
          );
          const partidoObj = partidos.find((p) => p.id === partidoId);
          const goleadorObj = jugadores.find((j) => String(j.id) === String(m.goleador_id));
          const newObj = {
            id: Date.now(),
            partido_id: partidoId,
            goles_local_predicho: Number(m.local),
            goles_visitante_predicho: Number(m.visitante),
            jugador_goleador_predicho_id: m.goleador_id ? Number(m.goleador_id) : null,
            usuario: { nombre_completo: usuario.nombre, correo: usuario.correo },
            partido: partidoObj ? {
              equipo_local: { nombre: partidoObj.equipo_local.nombre },
              equipo_visitante: { nombre: partidoObj.equipo_visitante.nombre },
            } : undefined,
            jugador_goleador: goleadorObj ? { nombre: goleadorObj.nombre } : null,
          };
          if (pIdx >= 0) {
            newPartidos[pIdx] = { ...newPartidos[pIdx], ...newObj };
          } else {
            newPartidos.push(newObj);
          }
          setConsolidados({ ...consolidados, prediccionesPartidos: newPartidos });
        }
        setTimeout(() => setPartidoGuardadoExitoId(null), 3000);
      }
    } catch (err: any) {
      setMensajeEstado({ tipo: "error", texto: "Error al guardar: " + err.message });
    } finally {
      setGuardandoPartidoId(null);
    }
  };

  const cargarConsolidados = async (uId?: number) => {
    const idParaUsar = uId || usuario?.id;
    if (!idParaUsar) return;
    setCargandoConsolidados(true);
    try {
      const res = await fetch(`/api/consolidados?usuario_id=${idParaUsar}`);
      const data = await res.json();
      if (res.ok) setConsolidados(data);
    } catch (err) {
      console.error("Error al cargar consolidados:", err);
    } finally {
      setCargandoConsolidados(false);
    }
  };

  // Marcadores oficiales por partido para Administrador
  const [resultadosAdminInput, setResultadosAdminInput] = useState<Record<number, { local: string; visitante: string; goleadores_ids: number[] }>>({});
  const [programacionAdminInput, setProgramacionAdminInput] = useState<Record<number, { jornada: string; fecha_hora: string; estadio: string }>>({});
  const [guardandoProgramacionId, setGuardandoProgramacionId] = useState<number | null>(null);
  const [programacionGuardadaId, setProgramacionGuardadaId] = useState<number | null>(null);
  const [guardandoInicial, setGuardandoInicial] = useState(false);

  const handleGuardarPrediccionInicial = async () => {
    if (!usuario) return;
    try {
      setGuardandoInicial(true);
      setMensajeEstado({ tipo: "info", texto: "Guardando predicciones del torneo..." });

      const res = await fetch("/api/guardar-pronosticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          campeon_equipo_id: campeonId ? Number(campeonId) : null,
          finalista_1_equipo_id: finalista1Id ? Number(finalista1Id) : null,
          finalista_2_equipo_id: finalista2Id ? Number(finalista2Id) : null,
          goleador_torneo_jugador_id: goleadorTorneoId ? Number(goleadorTorneoId) : null,
          clasificados_ids: clasificadosIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error || data.prediccionInicialRechazada) {
        const texto = data.prediccionInicialRechazada
          ? "⏱️ Ya cerró el plazo de predicciones iniciales (Fecha 5 ya inició). No se guardó."
          : data.error || "Error al guardar predicciones del torneo.";
        setMensajeEstado({ tipo: "error", texto });
        if (typeof window !== "undefined") alert("❌ " + texto);
      } else {
        setMensajeEstado({ tipo: "exito", texto: "¡Predicciones del torneo guardadas exitosamente!" });
        if (typeof window !== "undefined") alert("✅ ¡Tus predicciones del torneo han sido guardadas exitosamente!");
        sincronizarSesionBackend(usuario.correo, sesionToken);
      }
    } catch (err: any) {
      setMensajeEstado({ tipo: "error", texto: "Error al guardar: " + err.message });
      if (typeof window !== "undefined") alert("❌ Error: " + err.message);
    } finally {
      setGuardandoInicial(false);
    }
  };

  const handleDescargarExcelIniciales = () => {
    if (!usuario) return;
    window.open(`/api/consolidados/excel?usuario_id=${usuario.id}&tipo=inicial`, "_blank");
  };

  const handleResultadoAdminChange = (partidoId: number, campo: "local" | "visitante", valor: string) => {
    // Los goles nunca pueden ser negativos: se descarta el signo "-" y cualquier no-numérico.
    const valorSaneado = valor === "" ? "" : String(Math.max(0, Number(valor.replace(/[^0-9]/g, "") || 0)));
    setResultadosAdminInput((prev) => ({
      ...prev,
      [partidoId]: {
        ...(prev[partidoId] || { local: "", visitante: "", goleadores_ids: [] }),
        [campo]: valorSaneado,
      },
    }));
  };

  const handleAgregarGoleadorAdmin = (partidoId: number, jugadorIdStr: string) => {
    if (!jugadorIdStr) return;
    const jId = Number(jugadorIdStr);
    setResultadosAdminInput((prev) => {
      const actual = prev[partidoId] || { local: "", visitante: "", goleadores_ids: [] };
      return {
        ...prev,
        [partidoId]: {
          ...actual,
          goleadores_ids: [...actual.goleadores_ids, jId],
        },
      };
    });
  };

  const handleRemoverGoleadorAdmin = (partidoId: number, indexToRemove: number) => {
    setResultadosAdminInput((prev) => {
      const actual = prev[partidoId] || { local: "", visitante: "", goleadores_ids: [] };
      const nuevasIds = [...actual.goleadores_ids];
      nuevasIds.splice(indexToRemove, 1);
      return {
        ...prev,
        [partidoId]: {
          ...actual,
          goleadores_ids: nuevasIds,
        },
      };
    });
  };

  const handleCargarMarcadorPantalla = async (partidoId: number) => {
    if (!usuario || usuario.rol_id !== 2) return;
    const resInput = resultadosAdminInput[partidoId];
    if (!resInput || resInput.local === "" || resInput.visitante === "") {
      setMensajeEstado({ tipo: "error", texto: "Debes ingresar ambos goles del marcador." });
      return;
    }

    try {
      setMensajeEstado({ tipo: "info", texto: "Cargando marcador en pantalla..." });
      const res = await fetch("/api/admin/cargar-marcador-pantalla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          partido_id: partidoId,
          goles_local: Number(resInput.local),
          goles_visitante: Number(resInput.visitante),
          goleadores_ids: resInput.goleadores_ids || [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar marcador");

      setMensajeEstado({ tipo: "exito", texto: data.mensaje || "¡Marcador guardado en pantalla!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (typeof window !== "undefined") {
        alert("✅ " + (data.mensaje || "¡Marcador guardado en pantalla!"));
      }
      cargarMaestros();
      cargarConsolidados(usuario.id);
    } catch (err: any) {
      console.error(err);
      setMensajeEstado({ tipo: "error", texto: err.message || "Error al cargar marcador." });
      if (typeof window !== "undefined") {
        alert("❌ Error: " + (err.message || "Error al cargar marcador."));
      }
    }
  };

  const handleCargarResultadoOficial = async (partidoId: number) => {
    if (!usuario || usuario.rol_id !== 2) return;
    const resInput = resultadosAdminInput[partidoId];
    if (!resInput || resInput.local === "" || resInput.visitante === "") {
      setMensajeEstado({ tipo: "error", texto: "Debes ingresar ambos goles del resultado oficial." });
      return;
    }

    try {
      setMensajeEstado({ tipo: "info", texto: "Publicando resultado oficial y liquidando puntos..." });
      const res = await fetch("/api/admin/cargar-resultado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          partido_id: partidoId,
          goles_local: Number(resInput.local),
          goles_visitante: Number(resInput.visitante),
          goleadores_ids: resInput.goleadores_ids || [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar resultado");

      setMensajeEstado({ tipo: "exito", texto: data.mensaje || "¡Resultado oficial publicado y puntos calculados!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (typeof window !== "undefined") {
        alert("✅ " + (data.mensaje || "¡Resultado oficial publicado y puntos calculados!"));
      }
      cargarMaestros();
      cargarConsolidados(usuario.id);
    } catch (err: any) {
      console.error(err);
      setMensajeEstado({ tipo: "error", texto: err.message || "Error al liquidar resultado." });
      if (typeof window !== "undefined") {
        alert("❌ Error: " + (err.message || "Error al liquidar resultado."));
      }
    }
  };

  const actualizarProgramacionInput = (partido: any, campo: "jornada" | "fecha_hora" | "estadio", valor: string) => {
    setProgramacionAdminInput((prev) => ({
      ...prev,
      [partido.id]: {
        jornada: prev[partido.id]?.jornada ?? String(partido.jornada),
        fecha_hora: prev[partido.id]?.fecha_hora ?? aInputDatetimeLocal(partido.fecha_hora_partido),
        estadio: prev[partido.id]?.estadio ?? (partido.estadio || ""),
        [campo]: valor,
      },
    }));
  };

  const handleGuardarProgramacion = async (partido: any) => {
    if (!usuario || usuario.rol_id !== 2) return;
    const input = programacionAdminInput[partido.id];
    const jornada = input?.jornada ?? String(partido.jornada);
    const fechaHora = input?.fecha_hora ?? aInputDatetimeLocal(partido.fecha_hora_partido);
    const estadio = input?.estadio ?? (partido.estadio || "");

    // La hora del input no trae zona horaria: si no le pegamos el offset de Bogotá (-05:00)
    // explícitamente, el servidor la interpreta en SU propia zona horaria (normalmente UTC en
    // Hostinger), corriendo el partido 5 horas. Bogotá no tiene horario de verano, así que -05:00 es fijo.
    const fechaHoraConOffset = `${fechaHora}:00-05:00`;

    try {
      setGuardandoProgramacionId(partido.id);
      const res = await fetch("/api/admin/reprogramar-partido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          partido_id: partido.id,
          jornada,
          fecha_hora_partido: fechaHoraConOffset,
          estadio,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al reprogramar el partido");
      setMensajeEstado({ tipo: "exito", texto: data.mensaje || "Programación actualizada." });
      setProgramacionGuardadaId(partido.id);
      setTimeout(() => {
        setProgramacionGuardadaId((actual) => (actual === partido.id ? null : actual));
      }, 2500);
      cargarMaestros();
    } catch (err: any) {
      console.error(err);
      setMensajeEstado({ tipo: "error", texto: err.message || "Error al reprogramar el partido." });
      if (typeof window !== "undefined") {
        alert("❌ Error: " + (err.message || "Error al reprogramar el partido."));
      }
    } finally {
      setGuardandoProgramacionId(null);
    }
  };

  const handleToggleAplazado = async (partido: any) => {
    if (!usuario || usuario.rol_id !== 2) return;
    const nuevoEstado = partido.estado === "aplazado" ? "programado" : "aplazado";
    // Al reactivar, el partido se asigna a la fecha que está activa para los participantes
    // ahora mismo (no a su jornada vieja/original) — así no se abre de sorpresa una fecha
    // ya pasada ni se altera la fecha activa de todo el grupo.
    const jornadaDestino = nuevoEstado === "programado" ? fechaParticipante : undefined;
    try {
      setGuardandoProgramacionId(partido.id);
      const res = await fetch("/api/admin/reprogramar-partido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          partido_id: partido.id,
          estado: nuevoEstado,
          ...(jornadaDestino ? { jornada: jornadaDestino } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar el estado del partido");
      const texto = nuevoEstado === "aplazado"
        ? "Partido marcado como aplazado."
        : `Partido reactivado y asignado a la Fecha ${jornadaDestino} (la fecha activa ahora mismo).`;
      setMensajeEstado({ tipo: "exito", texto });
      if (nuevoEstado !== "aplazado" && typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        alert("✅ " + texto);
      }
      cargarMaestros();
    } catch (err: any) {
      console.error(err);
      if (typeof window !== "undefined") {
        alert("❌ Error: " + (err.message || "Error al actualizar el estado del partido."));
      }
    } finally {
      setGuardandoProgramacionId(null);
    }
  };

  const handleQuitarResultado = async (partidoId: number) => {
    if (!usuario || usuario.rol_id !== 2) return;
    if (typeof window !== "undefined" && !window.confirm("Esto eliminará el marcador oficial cargado y TODOS los puntos ya liquidados de este partido, dejándolo como recién programado. ¿Continuar?")) {
      return;
    }
    try {
      setMensajeEstado({ tipo: "info", texto: "Quitando resultado..." });
      const res = await fetch("/api/admin/quitar-resultado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: usuario.id, partido_id: partidoId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al quitar el resultado");
      setResultadosAdminInput((prev) => {
        const copia = { ...prev };
        delete copia[partidoId];
        return copia;
      });
      setMensajeEstado({ tipo: "exito", texto: data.mensaje || "Resultado eliminado." });
      if (typeof window !== "undefined") {
        alert("✅ " + (data.mensaje || "Resultado eliminado."));
      }
      cargarMaestros();
      cargarConsolidados(usuario.id);
    } catch (err: any) {
      console.error(err);
      setMensajeEstado({ tipo: "error", texto: err.message || "Error al quitar el resultado." });
      if (typeof window !== "undefined") {
        alert("❌ Error: " + (err.message || "Error al quitar el resultado."));
      }
    }
  };

  const aplicarPrediccionesGuardadas = (prediccionesGuardadas: any) => {
    if (!prediccionesGuardadas) return;
    try {
      const inicial = prediccionesGuardadas.inicial;
      const predsPartidos = prediccionesGuardadas.partidos || prediccionesGuardadas.prediccionesPartidos;
      if (inicial) {
        if (inicial.campeon_equipo_id) setCampeonId(inicial.campeon_equipo_id);
        if (inicial.finalista_1_equipo_id) setFinalista1Id(inicial.finalista_1_equipo_id);
        if (inicial.finalista_2_equipo_id) setFinalista2Id(inicial.finalista_2_equipo_id);
        if (inicial.goleador_torneo_jugador_id) setGoleadorTorneoId(inicial.goleador_torneo_jugador_id);
        if (inicial.clasificados) {
          setClasificadosIds(inicial.clasificados.map((c: any) => c.equipo_id));
        }
      }
      if (predsPartidos && Array.isArray(predsPartidos)) {
        const mapMarcadores: Record<number, EstadoMarcador> = {};
        predsPartidos.forEach((p: any) => {
          const valL = p.goles_local_predicho !== undefined && p.goles_local_predicho !== null ? p.goles_local_predicho : p.goles_local;
          const valV = p.goles_visitante_predicho !== undefined && p.goles_visitante_predicho !== null ? p.goles_visitante_predicho : p.goles_visitante;

          const gLocalStr = valL !== undefined && valL !== null ? String(valL) : "";
          const gVisitanteStr = valV !== undefined && valV !== null ? String(valV) : "";

          let ganador: "local" | "empate" | "visitante" = "empate";
          if (gLocalStr !== "" && gVisitanteStr !== "") {
            const nL = Number(gLocalStr);
            const nV = Number(gVisitanteStr);
            if (!isNaN(nL) && !isNaN(nV)) {
              if (nL > nV) ganador = "local";
              else if (nV > nL) ganador = "visitante";
              else ganador = "empate";
            }
          }

          const goleadorIdRaw = p.jugador_goleador_predicho_id || p.jugador_goleador_id || "";

          mapMarcadores[p.partido_id] = {
            local: gLocalStr,
            visitante: gVisitanteStr,
            ganador,
            goleador_id: goleadorIdRaw ? String(goleadorIdRaw) : "",
          };
        });
        setMarcadores((prev) => ({ ...prev, ...mapMarcadores }));
      }
    } catch (e) {
      console.error("Error al aplicar predicciones guardadas:", e);
    }
  };

  // Cargar datos maestros (Equipos, Jugadores, Partidos)
  const cargarMaestros = async () => {
    setCargandoMaestros(true);
    try {
      const res = await fetch("/api/datos-maestros", { cache: "no-store" });
      const data = await res.json();
      if (data.equipos) setEquipos(data.equipos);
      if (data.jugadores) setJugadores(data.jugadores);
      if (data.partidos) {
        setPartidos(data.partidos);

        // Pre-llenar permanentemente los marcadores e insumos oficiales del admin
        const initialAdminInputs: Record<number, { local: string; visitante: string; goleadores_ids: number[] }> = {};
        data.partidos.forEach((p: any) => {
          if (p.resultado_oficial) {
            initialAdminInputs[p.id] = {
              local: String(p.resultado_oficial.goles_local_real ?? ""),
              visitante: String(p.resultado_oficial.goles_visitante_real ?? ""),
              goleadores_ids: (p.resultado_oficial.goleadores || [])
                .map((g: any) => g.jugador_id || g.jugador?.id)
                .filter(Boolean),
            };
          }
        });
        setResultadosAdminInput((prev) => ({ ...initialAdminInputs, ...prev }));
      }
    } catch (err) {
      console.error("Error al cargar datos maestros:", err);
    } finally {
      setCargandoMaestros(false);
    }
  };

  const sincronizarSesionBackend = async (correo: string, tokenActual: string | null) => {
    if (!tokenActual) return; // sin token de sesión no hay nada que re-sincronizar
    try {
      const res = await fetch("/api/validar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, sesionToken: tokenActual }),
      });
      const data = await res.json();
      if (res.ok && data.usuario && data.prediccionesGuardadas) {
        const usrNorm = {
          ...data.usuario,
          nombre: data.usuario.nombre || data.usuario.nombre_completo || "",
        };
        setUsuario(usrNorm);
        sessionStorage.setItem("polla_sesion", JSON.stringify({
          usuario: usrNorm,
          prediccionesGuardadas: data.prediccionesGuardadas,
          sesionToken: tokenActual,
        }));
        aplicarPrediccionesGuardadas(data.prediccionesGuardadas);
        if (usrNorm.rol_id === 2) {
          cargarConsolidados(usrNorm.id);
        }
      } else {
        // El token dejó de ser válido (ej. la clave se reseteó en otro dispositivo): cerrar sesión local.
        setUsuario(null);
        setSesionToken(null);
        sessionStorage.removeItem("polla_sesion");
      }
    } catch (e) {
      console.error("Error al sincronizar sesión backend:", e);
    }
  };

  // Persistencia de sesión y auto-sincronización con la base de datos
  useEffect(() => {
    try {
      const sesionGuardada = sessionStorage.getItem("polla_sesion");
      if (sesionGuardada) {
        const dataParsed = JSON.parse(sesionGuardada);
        const usrRaw = dataParsed?.usuario || dataParsed;
        if (usrRaw && typeof usrRaw === "object") {
          const usr = {
            ...usrRaw,
            nombre: usrRaw.nombre || usrRaw.nombre_completo || "",
          };
          setUsuario(usr);
          const tokenGuardado = dataParsed?.sesionToken || null;
          setSesionToken(tokenGuardado);
          if (usr.rol_id === 2 && usr.id) {
            cargarConsolidados(usr.id);
          }
          if (dataParsed.prediccionesGuardadas) {
            aplicarPrediccionesGuardadas(dataParsed.prediccionesGuardadas);
          }
          if (usr.correo && tokenGuardado) {
            sincronizarSesionBackend(usr.correo, tokenGuardado);
          }
        } else {
          sessionStorage.removeItem("polla_sesion");
        }
      }
    } catch (e) {
      console.error("Error leyendo sesión", e);
      try { sessionStorage.removeItem("polla_sesion"); } catch (_) { }
    }
  }, []);

  useEffect(() => {
    cargarMaestros();
  }, []);

  // Borrar automáticamente los mensajes informativos/éxito tras 5 segundos (mantener los de error visibles)
  useEffect(() => {
    if (mensajeEstado && mensajeEstado.tipo !== "error") {
      const timer = setTimeout(() => {
        setMensajeEstado(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensajeEstado]);

  // Validar correo y contraseña en PostgreSQL
  const handleValidarCorreo = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!correoInput.trim() || !passwordInput.trim()) {
      setMensajeEstado({ tipo: "error", texto: "Por favor ingresa tanto tu correo como tu contraseña para acceder." });
      return;
    }

    setCargandoValidacion(true);
    setMensajeEstado(null);

    try {
      const res = await fetch("/api/validar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoInput, password: passwordInput }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMensajeEstado({ tipo: "error", texto: data.error || "Error al validar correo." });
        return;
      }

      if (!data.existe) {
        setMensajeEstado({ tipo: "error", texto: data.mensaje || "Este correo no se encuentra habilitado por el administrador." });
        return;
      }

      if (!data.activo) {
        setMensajeEstado({ tipo: "info", texto: data.mensaje });
        return;
      }

      // Usuario activo habilitado
      setUsuario(data.usuario);
      setSesionToken(data.sesionToken || null);
      sessionStorage.setItem("polla_sesion", JSON.stringify({
        usuario: data.usuario,
        prediccionesGuardadas: data.prediccionesGuardadas,
        sesionToken: data.sesionToken || null,
      }));
      setMensajeEstado(null);

      if (data.usuario.rol_id === 2) {
        cargarConsolidados(data.usuario.id);
      }

      // Cargar pronósticos previos si existen
      if (data.prediccionesGuardadas) {
        aplicarPrediccionesGuardadas(data.prediccionesGuardadas);
      }
    } catch (err: any) {
      setMensajeEstado({ tipo: "error", texto: "Error de conexión: " + err.message });
    } finally {
      setCargandoValidacion(false);
    }
  };

  // Toggle Selección de Clasificados (Máximo 8)
  const toggleClasificado = (equipoId: number) => {
    if (clasificadosIds.includes(equipoId)) {
      setClasificadosIds(clasificadosIds.filter((id) => id !== equipoId));
    } else {
      if (clasificadosIds.length >= 8) {
        alert("Ya has seleccionado el máximo permitido de 8 clasificados.");
        return;
      }
      setClasificadosIds([...clasificadosIds, equipoId]);
    }
  };

  // Cambio de marcador exacto con auto-sincronización del ganador
  const handleMarcadorChange = (partidoId: number, campo: "local" | "visitante", valor: string) => {
    const valLimpio = valor.replace(/\D/g, ""); // solo números
    setMarcadores((prev) => {
      const actual = prev[partidoId] || { local: "", visitante: "", ganador: "", goleador_id: "" };
      const nuevoLocal = campo === "local" ? valLimpio : actual.local;
      const nuevoVisitante = campo === "visitante" ? valLimpio : actual.visitante;

      // Auto-sincronizar ganador si ambos goles están ingresados
      let nuevoGanador = actual.ganador;
      let nuevoGoleadorId = actual.goleador_id;
      if (nuevoLocal !== "" && nuevoVisitante !== "") {
        const nL = Number(nuevoLocal);
        const nV = Number(nuevoVisitante);
        if (nL > nV) nuevoGanador = "local";
        else if (nL < nV) nuevoGanador = "visitante";
        else nuevoGanador = "empate";

        // Si es 0-0, bloquear y limpiar la selección de goleador
        if (nL === 0 && nV === 0) {
          nuevoGoleadorId = "";
        }
      }

      // Validar que no haya goleador de un equipo con 0 goles
      const partidoObj = partidos.find((p) => p.id === partidoId);
      if (partidoObj && nuevoGoleadorId) {
        const goleadorSel = jugadores.find((j) => String(j.id) === String(nuevoGoleadorId));
        if (goleadorSel) {
          if (nuevoLocal !== "" && Number(nuevoLocal) === 0 && String(goleadorSel.equipo_id) === String(partidoObj.equipo_local.id)) {
            nuevoGoleadorId = "";
          }
          if (nuevoVisitante !== "" && Number(nuevoVisitante) === 0 && String(goleadorSel.equipo_id) === String(partidoObj.equipo_visitante.id)) {
            nuevoGoleadorId = "";
          }
        }
      }

      return {
        ...prev,
        [partidoId]: {
          ...actual,
          local: nuevoLocal,
          visitante: nuevoVisitante,
          ganador: nuevoGanador,
          goleador_id: nuevoGoleadorId,
        },
      };
    });
  };

  // Cambio manual del ganador predicho (Permite deseleccionar haciendo click de nuevo)
  const handleGanadorChange = (partidoId: number, nuevoGanador: "local" | "empate" | "visitante") => {
    setMarcadores((prev) => {
      const actual: EstadoMarcador = prev[partidoId] || { local: "", visitante: "", ganador: "", goleador_id: "" };
      const esMismo = actual.ganador === nuevoGanador;
      return {
        ...prev,
        [partidoId]: {
          ...actual,
          ganador: esMismo ? ("" as any) : nuevoGanador,
        },
      };
    });
  };

  // Cambio de goleador predicho (Permite deseleccionar haciendo click de nuevo)
  const handleGoleadorChange = (partidoId: number, goleadorId: string) => {
    setMarcadores((prev) => {
      const actual: EstadoMarcador = prev[partidoId] || { local: "", visitante: "", ganador: "", goleador_id: "" };
      const esMismo = String(actual.goleador_id || "") === String(goleadorId || "");
      return {
        ...prev,
        [partidoId]: {
          ...actual,
          goleador_id: esMismo ? "" : goleadorId,
        },
      };
    });
  };

  // VALIDAR RESTRICCIÓN DE COHERENCIA ENTRE MARCADOR Y GANADOR (SOLO PARTIDOS ACTIVOS)
  const validarCoherenciaPronosticos = (): string | null => {
    for (const partido of partidos) {
      const horaCierrePartido = new Date(new Date(partido.fecha_hora_partido).getTime() - 30 * 60 * 1000);
      const esFinalizado = esPartidoFinalizadoReal(partido, partidosEnVivo);
      const estaCerrado = (new Date() >= horaCierrePartido) || esFinalizado;

      // Ignorar validación para partidos acabados o cerrados por tiempo
      if (estaCerrado) continue;

      const m = marcadores[partido.id];
      if (!m) continue;

      const { local, visitante, ganador } = m;
      if (local !== "" && visitante !== "") {
        const nL = Number(local);
        const nV = Number(visitante);

        if (!ganador) {
          return `En el partido ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}, debes seleccionar el equipo ganador o empate.`;
        }

        if (nL > nV && ganador !== "local") {
          const nombreGanador = ganador === "visitante" ? partido.equipo_visitante.nombre : "Empate";
          return `❌ Inconsistencia en ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}: Pusiste marcador de victoria local (${nL} - ${nV}), pero marcaste como ganador a "${nombreGanador}".`;
        }

        if (nV > nL && ganador !== "visitante") {
          const nombreGanador = ganador === "local" ? partido.equipo_local.nombre : "Empate";
          return `❌ Inconsistencia en ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}: Pusiste marcador de victoria visitante (${nL} - ${nV}), pero marcaste como ganador a "${nombreGanador}".`;
        }

        if (nL === nV && ganador !== "empate") {
          const nombreGanador = ganador === "local" ? partido.equipo_local.nombre : partido.equipo_visitante.nombre;
          return `❌ Inconsistencia en ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}: Pusiste marcador de empate (${nL} - ${nV}), pero seleccionaste como ganador a "${nombreGanador}".`;
        }

        if ((nL > 0 || nV > 0) && (!m.goleador_id || m.goleador_id === "")) {
          return `❌ Inconsistencia en ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}: Ingresaste marcador con goles (${nL} - ${nV}), por lo que debes seleccionar un goleador predicho. No puedes dejar "Ninguno" si hay goles.`;
        }
      }
    }
    return null;
  };

  // Helper para recuperar el nombre del goleador predicho desde la relación o maestro de jugadores
  const obtenerNombreGoleador = (p: any) => {
    if (p.jugador_goleador?.nombre) return p.jugador_goleador.nombre;
    const golId = p.jugador_goleador_predicho_id || p.jugador_goleador_id;
    if (golId) {
      const enMaestro = jugadores.find((j: any) => String(j.id) === String(golId));
      if (enMaestro) return enMaestro.nombre;
    }
    return "Sin Goleador";
  };

  const renderPartidoCard = (partido: any) => {
    if (!partido || !partido.equipo_local || !partido.equipo_visitante) return null;
    const m = marcadores[partido.id] || { local: "", visitante: "", ganador: "", goleador_id: "" };

    let inconsistencia: string | null = null;
    if (m.local !== "" && m.visitante !== "" && m.ganador) {
      const nL = Number(m.local);
      const nV = Number(m.visitante);
      if (nL > nV && m.ganador !== "local") {
        inconsistencia = `Marcador indica victoria de ${partido.equipo_local.nombre}, pero seleccionaste ${m.ganador === "visitante" ? partido.equipo_visitante.nombre : "Empate"}.`;
      } else if (nV > nL && m.ganador !== "visitante") {
        inconsistencia = `Marcador indica victoria de ${partido.equipo_visitante.nombre}, pero seleccionaste ${m.ganador === "local" ? partido.equipo_local.nombre : "Empate"}.`;
      } else if (nL === nV && m.ganador !== "empate") {
        inconsistencia = `Marcador indica Empate, pero seleccionaste a un equipo ganador.`;
      }
    }

    const jugadoresPartido = [
      ...(partido.equipo_local.jugadores || []),
      ...(partido.equipo_visitante.jugadores || []),
    ];

    const horaCierrePartido = new Date(new Date(partido.fecha_hora_partido).getTime() - 30 * 60 * 1000);
    const esAplazado = partido.estado === "aplazado";
    const liveMatch = buscarPartidoEnVivoESPN(partido, partidosEnVivo);
    const esFinalizado = esPartidoFinalizadoReal(partido, partidosEnVivo);
    const estaCerradoGeneral = esFinalizado || (typeof window !== "undefined" && new Date() >= horaCierrePartido);
    const estaCerrado = esAplazado ? false : estaCerradoGeneral;
    const deshabilitarMarcador = estaCerrado;
    const deshabilitarBotonGuardar = guardandoPartidoId === partido.id || Boolean(inconsistencia);

    const estaCardAbierta = partidosDesplegados[partido.id] ?? false;

    return (
      <div
        key={partido.id}
        className="card"
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderLeft: esAplazado
            ? "4px solid #f59e0b"
            : estaCerrado
              ? "4px solid var(--graderia)"
              : inconsistencia
                ? "4px solid var(--rojo)"
                : "4px solid #38bdf8",
          opacity: estaCerrado && !esAplazado ? 0.85 : 1,
        }}
      >
        {/* ENCABEZADO MATCH: 2 filas fijas para que todas las tarjetas se alineen igual */}
        <div style={{ marginBottom: estaCardAbierta ? 14 : 0, borderBottom: estaCardAbierta ? "1px dashed rgba(255,255,255,0.1)" : "none", paddingBottom: estaCardAbierta ? 10 : 0 }}>
          {/* FILA 1: nombre del partido + estado del pronóstico */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.95rem" }}>
              {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
            </span>
            {m.local !== "" && m.visitante !== "" ? (
              <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 800, whiteSpace: "nowrap" }}>
                ✅ Pronosticado ({m.local} - {m.visitante})
              </span>
            ) : esFinalizado ? (
              <span style={{ background: "rgba(100, 116, 139, 0.2)", color: "#94a3b8", border: "1px solid rgba(100, 116, 139, 0.4)", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 800, whiteSpace: "nowrap" }}>
                🏁 Terminado
              </span>
            ) : estaCerrado ? (
              <span style={{ background: "rgba(100, 116, 139, 0.2)", color: "#94a3b8", border: "1px solid rgba(100, 116, 139, 0.4)", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 800, whiteSpace: "nowrap" }}>
                🔒 Pronósticos Cerrados
              </span>
            ) : (
              <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                ⏳ Pendiente
              </span>
            )}
          </div>

          {/* FILA 2: fecha/hora/estadio + reloj + botón de acción */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--graderia)", fontWeight: 700 }}>
              🕒 {formatearFechaPartido(partido.fecha_hora_partido)} · {formatearHoraPartido(partido.fecha_hora_partido)}
              {partido.estadio ? ` · 🏟️ ${partido.estadio}` : ""}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {esAplazado ? (
                <span style={{ background: "#f59e0b", padding: "4px 10px", borderRadius: 6, color: "#fff", fontWeight: 800, fontSize: "0.75rem" }}>
                  ⚠️ APLAZADO
                </span>
              ) : liveMatch && liveMatch.esEnVivo && !esFinalizado ? (
                <MarcadorEnVivoMini live={liveMatch} />
              ) : (
                <RelojCuentaRegresiva fechaHoraPartido={partido.fecha_hora_partido} estado={partido.estado} />
              )}

              <button
                type="button"
                onClick={() => setPartidosDesplegados(prev => ({ ...prev, [partido.id]: !estaCardAbierta }))}
                style={{
                  background: estaCardAbierta ? "rgba(56, 189, 248, 0.25)" : "rgba(255, 255, 255, 0.08)",
                  border: estaCardAbierta ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.12)",
                  color: estaCardAbierta ? "#38bdf8" : "#ffffff",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{estaCardAbierta ? "▲ Ocultar" : (estaCerrado ? "▼ Ver" : "▼ Pronosticar")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CONTENIDO EXPANDIBLE DE PRONÓSTICO */}
        {estaCardAbierta && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--linea)" }}>
            {/* BANNER DE MARCADOR OFICIAL SI EXISTE */}
            {partido.resultado_oficial && (
              <div style={{ background: "linear-gradient(135deg, #065f46 0%, #047857 100%)", padding: "10px 14px", borderRadius: 8, textAlign: "center", marginBottom: 14, color: "#ffffff", fontWeight: 800, border: "1px solid #34d399", fontSize: "0.95rem" }}>
                <div>🏁 MARCADOR OFICIAL: {partido.resultado_oficial.goles_local_real} - {partido.resultado_oficial.goles_visitante_real}</div>
                {partido.resultado_oficial.goleadores && partido.resultado_oficial.goleadores.length > 0 && (
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, marginTop: 4, color: "#a7f3d0" }}>
                    ⚽ Goleadores oficiales: {(() => {
                      const nombres = partido.resultado_oficial.goleadores
                        .map((g: any) => g.jugador?.nombre)
                        .filter(Boolean);
                      if (nombres.length === 0) return "Sin goles anotados";
                      const counts: Record<string, number> = {};
                      nombres.forEach((n: string) => { counts[n] = (counts[n] || 0) + 1; });
                      return Object.entries(counts)
                        .map(([n, c]) => (c > 1 ? `${n} (x${c})` : n))
                        .join(", ");
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* MARCADOR EXACTO - DISEÑO RESPONSIVO MÓVIL ALINEADO 3 COLUMNAS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10, margin: "16px 0 20px" }}>
              {/* EQUIPO LOCAL */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, textAlign: "right" }}>
                <span style={{ fontWeight: 800, fontSize: "clamp(0.88rem, 3.8vw, 1.1rem)", color: "#ffffff", lineHeight: 1.2 }}>
                  {partido.equipo_local.nombre}
                </span>
                {partido.equipo_local.escudo_url ? (
                  <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 30, height: 30, objectFit: "contain", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 28, height: 28, background: "var(--linea)", borderRadius: "50%", flexShrink: 0 }} />
                )}
              </div>

              {/* INPUTS MARCADOR */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={m.local}
                  onChange={(e) => handleMarcadorChange(partido.id, "local", e.target.value)}
                  disabled={deshabilitarMarcador}
                  style={{
                    width: m.local.length > 1 ? 52 : 36,
                    height: 44,
                    textAlign: "center",
                    fontSize: "1.2rem",
                    fontWeight: 900,
                    background: "var(--noche-2)",
                    border: m.local !== "" ? "2px solid var(--cancha)" : "1px solid var(--linea)",
                    borderRadius: 8,
                    color: "#ffffff",
                    padding: 0,
                    transition: "width 0.15s ease",
                  }}
                />
                <span style={{ fontWeight: 900, fontSize: "1.2rem", color: "var(--graderia)" }}>:</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={m.visitante}
                  onChange={(e) => handleMarcadorChange(partido.id, "visitante", e.target.value)}
                  disabled={deshabilitarMarcador}
                  style={{
                    width: m.visitante.length > 1 ? 52 : 36,
                    height: 44,
                    textAlign: "center",
                    fontSize: "1.2rem",
                    fontWeight: 900,
                    background: "var(--noche-2)",
                    border: m.visitante !== "" ? "2px solid var(--cancha)" : "1px solid var(--linea)",
                    borderRadius: 8,
                    color: "#ffffff",
                    padding: 0,
                    transition: "width 0.15s ease",
                  }}
                />
              </div>

              {/* EQUIPO VISITANTE */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8, textAlign: "left" }}>
                {partido.equipo_visitante.escudo_url ? (
                  <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 30, height: 30, objectFit: "contain", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 28, height: 28, background: "var(--linea)", borderRadius: "50%", flexShrink: 0 }} />
                )}
                <span style={{ fontWeight: 800, fontSize: "clamp(0.88rem, 3.8vw, 1.1rem)", color: "#ffffff", lineHeight: 1.2 }}>
                  {partido.equipo_visitante.nombre}
                </span>
              </div>
            </div>

            {/* GANADOR PREDICHO - BOTONES DE BOTÓN MÓVIL PERFECTOS */}
            {(() => {
              const ganadorEfectivo = m.ganador || (
                m.local !== "" && m.visitante !== ""
                  ? (Number(m.local) > Number(m.visitante) ? "local" : Number(m.visitante) > Number(m.local) ? "visitante" : "empate")
                  : ""
              );

              return (
                <div style={{ background: "var(--noche-2)", padding: "12px 14px", borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--graderia)", margin: 0 }}>
                      🏆 Equipo Ganador del Partido (3 Pts):
                    </label>
                    {ganadorEfectivo && (
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#38bdf8", background: "rgba(56,189,248,0.15)", padding: "2px 8px", borderRadius: 4 }}>
                        {ganadorEfectivo === "local" ? `Gana ${partido.equipo_local.nombre}` : ganadorEfectivo === "visitante" ? `Gana ${partido.equipo_visitante.nombre}` : "Empate"}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                    <label
                      onClick={() => !deshabilitarMarcador && handleGanadorChange(partido.id, "local")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 4px",
                        borderRadius: 6,
                        cursor: deshabilitarMarcador ? "not-allowed" : "pointer",
                        background: ganadorEfectivo === "local" ? "linear-gradient(135deg, #059669 0%, #047857 100%)" : "rgba(255,255,255,0.05)",
                        border: ganadorEfectivo === "local" ? "1px solid #34d399" : "1px solid var(--linea)",
                        color: ganadorEfectivo === "local" ? "#fff" : "var(--tiza)",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        textAlign: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Gana {partido.equipo_local.nombre}
                    </label>
                    <label
                      onClick={() => !deshabilitarMarcador && handleGanadorChange(partido.id, "empate")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 4px",
                        borderRadius: 6,
                        cursor: deshabilitarMarcador ? "not-allowed" : "pointer",
                        background: ganadorEfectivo === "empate" ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)" : "rgba(255,255,255,0.05)",
                        border: ganadorEfectivo === "empate" ? "1px solid #fbbf24" : "1px solid var(--linea)",
                        color: ganadorEfectivo === "empate" ? "#fff" : "var(--tiza)",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        textAlign: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Empate
                    </label>
                    <label
                      onClick={() => !deshabilitarMarcador && handleGanadorChange(partido.id, "visitante")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 4px",
                        borderRadius: 6,
                        cursor: deshabilitarMarcador ? "not-allowed" : "pointer",
                        background: ganadorEfectivo === "visitante" ? "linear-gradient(135deg, #059669 0%, #047857 100%)" : "rgba(255,255,255,0.05)",
                        border: ganadorEfectivo === "visitante" ? "1px solid #34d399" : "1px solid var(--linea)",
                        color: ganadorEfectivo === "visitante" ? "#fff" : "var(--tiza)",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        textAlign: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Gana {partido.equipo_visitante.nombre}
                    </label>
                  </div>
                </div>
              );
            })()}

            {/* SELECCIÓN DE GOLEADOR PREDICHO (+2 PTS) - BOTÓN DE DESELECCIONAR 'NINGUNO' */}
            {(() => {
              const golesL = m.local !== "" ? Number(m.local) : null;
              const golesV = m.visitante !== "" ? Number(m.visitante) : null;
              const esCeroCero = golesL === 0 && golesV === 0;

              const jugadoresLocal = partido.equipo_local.jugadores || [];
              const jugadoresVisitante = partido.equipo_visitante.jugadores || [];

              const deshabilitarLocal = deshabilitarMarcador || golesL === 0;
              const deshabilitarVisitante = deshabilitarMarcador || golesV === 0;

              return (
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--graderia)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                      ⚽ Goleador del Partido (+2 Pts):
                    </label>

                    {esCeroCero ? (
                      <span style={{ fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                        🚫 Sin Goleador (Activo para 0 - 0)
                      </span>
                    ) : m.goleador_id ? (
                      <button
                        type="button"
                        onClick={() => !deshabilitarMarcador && handleGoleadorChange(partido.id, "")}
                        disabled={deshabilitarMarcador}
                        style={{
                          fontSize: "0.75rem",
                          background: "rgba(239, 68, 68, 0.2)",
                          color: "#fca5a5",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontWeight: 700,
                          cursor: deshabilitarMarcador ? "not-allowed" : "pointer",
                        }}
                      >
                        ✕ Quitar Goleador
                      </button>
                    ) : null}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {/* DROPDOWN LOCAL */}
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: deshabilitarLocal ? "var(--graderia)" : "#34d399", marginBottom: 4 }}>
                        🏠 Goleador {partido.equipo_local.nombre}:
                      </div>
                      <select
                        value={String(golesL === 0 ? "" : (jugadoresLocal.some((j: any) => String(j.id) === String(m.goleador_id)) ? m.goleador_id : ""))}
                        onChange={(e) => handleGoleadorChange(partido.id, e.target.value)}
                        disabled={deshabilitarLocal}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          fontSize: "0.78rem",
                          background: "var(--noche-2)",
                          border: jugadoresLocal.some((j: any) => String(j.id) === String(m.goleador_id)) ? "1px solid #34d399" : "1px solid var(--linea)",
                          borderRadius: 6,
                          color: deshabilitarLocal ? "var(--graderia)" : "#ffffff",
                          opacity: deshabilitarLocal ? 0.5 : 1,
                        }}
                      >
                        <option value="">-- Seleccionar de {partido.equipo_local.nombre} --</option>
                        {jugadoresLocal.map((j: any) => (
                          <option key={j.id} value={String(j.id)}>
                            {j.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DROPDOWN VISITANTE */}
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: deshabilitarVisitante ? "var(--graderia)" : "#38bdf8", marginBottom: 4 }}>
                        ✈️ Goleador {partido.equipo_visitante.nombre}:
                      </div>
                      <select
                        value={String(golesV === 0 ? "" : (jugadoresVisitante.some((j: any) => String(j.id) === String(m.goleador_id)) ? m.goleador_id : ""))}
                        onChange={(e) => handleGoleadorChange(partido.id, e.target.value)}
                        disabled={deshabilitarVisitante}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          fontSize: "0.78rem",
                          background: "var(--noche-2)",
                          border: jugadoresVisitante.some((j: any) => String(j.id) === String(m.goleador_id)) ? "1px solid #38bdf8" : "1px solid var(--linea)",
                          borderRadius: 6,
                          color: deshabilitarVisitante ? "var(--graderia)" : "#ffffff",
                          opacity: deshabilitarVisitante ? 0.5 : 1,
                        }}
                      >
                        <option value="">-- Seleccionar de {partido.equipo_visitante.nombre} --</option>
                        {jugadoresVisitante.map((j: any) => (
                          <option key={j.id} value={String(j.id)}>
                            {j.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {esCeroCero && (
                    <div style={{ marginTop: 8, fontSize: "0.73rem", color: "#38bdf8", fontStyle: "italic" }}>
                      ℹ️ Sin goleador seleccionado (válido sólo si el partido termina 0 - 0).
                    </div>
                  )}

                  {!estaCerrado && inconsistencia && (
                    <div style={{ marginTop: 10, color: "var(--rojo)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                      <AlertTriangle size={16} /> {inconsistencia}
                    </div>
                  )}

                  {/* BOTÓN GUARDAR PRONÓSTICO INDIVIDUAL CON CONFIRMACIÓN EN VIVO */}
                  {!estaCerrado && (
                    <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px dashed rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={deshabilitarBotonGuardar}
                        onClick={() => handleGuardarPronosticoPartido(partido.id)}
                        style={{
                          padding: "8px 18px",
                          fontSize: "0.88rem",
                          fontWeight: 800,
                          background: deshabilitarBotonGuardar
                            ? "#334155"
                            : partidoGuardadoExitoId === partido.id
                              ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: deshabilitarBotonGuardar ? "#94a3b8" : "#fff",
                          opacity: deshabilitarBotonGuardar ? 0.65 : 1,
                          borderRadius: 8,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: deshabilitarBotonGuardar ? "not-allowed" : "pointer",
                          boxShadow: deshabilitarBotonGuardar ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        {partidoGuardadoExitoId === partido.id ? (
                          <>
                            <CheckCircle2 size={16} /> ¡Pronóstico Guardado con Éxito!
                          </>
                        ) : guardandoPartidoId === partido.id ? (
                          "Guardando..."
                        ) : (
                          <>
                            <Save size={16} /> Guardar Pronóstico
                          </>
                        )}
                      </button>

                      {partidoGuardadoExitoId === partido.id && (
                        <div style={{ color: "#34d399", fontSize: "0.82rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={14} /> ✓ Marcador y goleador guardados correctamente en la base de datos
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  // Cerrar Sesión
  const handleCerrarSesion = () => {
    setUsuario(null);
    setSesionToken(null);
    sessionStorage.removeItem("polla_sesion");
    setCorreoInput("");
    setPasswordInput("");
    setMensajeEstado(null);
  };

  // Descargar Excel de Pronósticos por Partido (Diseño exacto Imagen 2)
  const handleDescargarImagenPronosticos = async (partidoId: number) => {
    const node = document.getElementById(`tabla-pronosticos-admin-${partidoId}`);
    if (!node) {
      alert("No se encontró la tabla de pronósticos.");
      return;
    }
    try {
      setMensajeEstado({ tipo: "info", texto: "Generando imagen... Espera un momento." });
      const dataUrl = await toPng(node, {
        backgroundColor: '#0f172a',
        style: { padding: '15px', borderRadius: '10px' },
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `Pronosticos_Partido_${partidoId}.png`;
      link.href = dataUrl;
      link.click();
      setMensajeEstado({ tipo: "exito", texto: "Imagen descargada correctamente." });
      setTimeout(() => setMensajeEstado(null), 3000);
    } catch (error) {
      console.error(error);
      setMensajeEstado({ tipo: "error", texto: "Hubo un error al generar la imagen." });
    }
  };

  const handleDescargarExcelPronosticos = async (partidoId?: number, jornada?: number) => {
    if (!usuario) return;
    try {
      setMensajeEstado({ tipo: "info", texto: "Generando Excel con formato... Esto puede tardar unos segundos." });
      let url = `/api/consolidados/excel?usuario_id=${usuario.id}`;
      if (partidoId) url += `&partido_id=${partidoId}`;
      if (jornada) url += `&jornada=${jornada}`;
      const res = await fetch(url);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al descargar el archivo");
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = jornada ? `Pronosticos_Partidos_Fecha_${jornada}.xlsx` : `Pronosticos_Partidos_Polla_BetPlay_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMensajeEstado({ tipo: "exito", texto: "¡Archivo Excel generado correctamente!" });
    } catch (err: any) {
      console.error(err);
      setMensajeEstado({ tipo: "error", texto: err.message || "No se pudo generar el archivo Excel." });
    }
  };

  // Guardar Todos los Pronósticos
  const handleGuardarTodo = async () => {
    if (!usuario) return;

    const errorCoherencia = validarCoherenciaPronosticos();
    if (errorCoherencia) {
      setMensajeEstado({ tipo: "error", texto: errorCoherencia });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setGuardando(true);
    setMensajeEstado(null);

    const arrayPartidos = Object.entries(marcadores)
      .filter(([_, m]) => m.local !== "" && m.visitante !== "")
      .map(([partidoId, m]) => ({
        partido_id: Number(partidoId),
        goles_local: Number(m.local),
        goles_visitante: Number(m.visitante),
        jugador_goleador_id: m.goleador_id ? Number(m.goleador_id) : null,
      }));

    try {
      const res = await fetch("/api/guardar-pronosticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          campeon_equipo_id: campeonId || null,
          finalista_1_equipo_id: finalista1Id || null,
          finalista_2_equipo_id: finalista2Id || null,
          goleador_torneo_jugador_id: goleadorTorneoId || null,
          clasificados_ids: clasificadosIds,
          partidos: arrayPartidos,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setMensajeEstado({ tipo: "error", texto: data.error || "Error al guardar pronósticos." });
      } else {
        const partidosRechazados: number[] = Array.isArray(data.partidosRechazados) ? data.partidosRechazados : [];
        const rechazadosSet = new Set(partidosRechazados);

        // Solo se marca como guardado en sessionStorage lo que el servidor confirmó;
        // lo rechazado por cierre de plazo no debe quedar registrado como enviado.
        arrayPartidos
          .filter((p) => !rechazadosSet.has(p.partido_id))
          .forEach((p) => {
            actualizarSesionLocalStorage(p.partido_id, p.goles_local, p.goles_visitante, p.jugador_goleador_id);
          });

        const huboRechazos = partidosRechazados.length > 0 || data.prediccionInicialRechazada;
        if (huboRechazos) {
          const nombresRechazados = partidosRechazados
            .map((id) => {
              const p = partidos.find((pp) => pp.id === id);
              return p ? `${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}` : `#${id}`;
            })
            .join(", ");
          setMensajeEstado({
            tipo: "error",
            texto: `⏱️ Algunos pronósticos ya no se pudieron guardar porque cerró su plazo${nombresRechazados ? ": " + nombresRechazados : ""}${data.prediccionInicialRechazada ? " (predicción inicial también cerrada)" : ""}. El resto sí se guardó.`,
          });
        } else {
          setMensajeEstado({ tipo: "exito", texto: "¡Tus pronósticos se han guardado exitosamente!" });
        }
        if (usuario) cargarConsolidados(usuario.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      setMensajeEstado({ tipo: "error", texto: "Error al conectar con el servidor: " + err.message });
    } finally {
      setGuardando(false);
    }
  };

  const totalPronosticados = Object.values(marcadores).filter((m) => m.local !== "" && m.visitante !== "").length;



  return (
    <div style={!usuario ? { minHeight: "100vh", display: "flex", width: "100%", background: "var(--noche)" } : { paddingBottom: 80 }}>
      {/* PANTALLA DE INGRESO PRIVADA */}
      {!usuario ? (
        <div style={{ display: "flex", flex: 1, width: "100%" }}>
          {/* Lado Izquierdo - Animación/Gráfico */}
          <div className="login-left-panel" style={{
            flex: 1,
            background: "linear-gradient(135deg, var(--noche) 0%, var(--cancha-suave) 100%)",
            position: "relative",
            overflow: "hidden",
            flexDirection: "column",
            justifyContent: "center",
            padding: "4rem"
          }}>
            <div style={{ position: "relative", zIndex: 10 }}>
              <h1 style={{ fontSize: "4rem", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
                DEMUESTRA<br />
                QUE SABES<br />
                <span style={{ color: "var(--cancha)", textShadow: "0 0 20px rgba(29, 185, 84, 0.4)" }}>DE FÚTBOL</span>
              </h1>
              <p style={{ fontSize: "1.2rem", color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.8)", maxWidth: 400 }}>
                Crea tu polla y compite en vivo con amigos, oficina o familia.
              </p>
            </div>

            {/* Elementos decorativos */}
            <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "var(--cancha)", opacity: 0.05, borderRadius: "50%", filter: "blur(50px)" }} />

            <div className="bola-flotante" style={{ position: "absolute", bottom: "15%", right: "15%", fontSize: "8rem", opacity: 0.3, filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))" }}>
              ⚽
            </div>
          </div>

          {/* Lado Derecho - Formulario */}
          <div className="login-right-panel" style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
          }}>
            <div style={{ width: "100%", maxWidth: 400 }}>
              <div className="login-mobile-header">
                <div className="login-mobile-banner">
                  <span className="login-mobile-ball">⚽</span>
                  <span className="login-mobile-ball login-mobile-ball-2">⚽</span>
                </div>
                <div className="login-mobile-badge">
                  <img
                    src="/logo_principal_recortado.webp"
                    alt="Club 90 Minutos"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div style={{ fontWeight: 900, fontSize: "1.35rem", color: "#fff", letterSpacing: "0.5px", marginTop: 14 }}>
                  CLUB 90 MINUTOS
                </div>

              </div>

              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
                  ¡Vamos con Todo, Crack!
                </h2>
                <p style={{ color: "var(--graderia)", fontSize: "0.95rem" }}>
                  Ingresa para acceder a tus pronósticos y estadísticas.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--graderia)", marginBottom: 8, display: "block" }}>
                    Correo electrónico autorizado
                  </label>
                  <input
                    type="email"
                    className="input"
                    placeholder="ejemplo@correo.com"
                    value={correoInput}
                    onChange={(e) => setCorreoInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleValidarCorreo(e); }}
                    style={{ width: "100%", padding: "16px", background: "var(--tribuna)", border: "1px solid var(--linea-fuerte)", borderRadius: "12px", color: "#fff", outline: "none", transition: "all 0.3s" }}
                    required
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--graderia)", margin: 0 }}>
                      Contraseña
                    </label>
                    <Link href="/recuperar-password" style={{ fontSize: "0.8rem", color: "var(--cancha)", textDecoration: "none", fontWeight: 600 }}>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleValidarCorreo(e); }}
                    style={{ width: "100%", padding: "16px", background: "var(--tribuna)", border: "1px solid var(--linea-fuerte)", borderRadius: "12px", color: "#fff", outline: "none", transition: "all 0.3s" }}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleValidarCorreo}
                  disabled={cargandoValidacion}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "var(--cancha)",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    borderRadius: "12px",
                    border: "none",
                    cursor: cargandoValidacion ? "not-allowed" : "pointer",
                    boxShadow: "0 8px 25px rgba(29, 185, 84, 0.3)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 8,
                    transition: "all 0.3s"
                  }}
                  onMouseOver={(e) => { if (!cargandoValidacion) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(29, 185, 84, 0.4)"; } }}
                  onMouseOut={(e) => { if (!cargandoValidacion) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(29, 185, 84, 0.3)"; } }}
                >
                  {cargandoValidacion ? (
                    <>
                      <RefreshCw className="spin" size={20} /> Ingresando...
                    </>
                  ) : (
                    "Ingresar a mis Pronósticos"
                  )}
                </button>
              </div>

              {mensajeEstado && (
                <div
                  style={{
                    marginTop: 24,
                    padding: "16px",
                    borderRadius: 12,
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    textAlign: "left",
                    background:
                      mensajeEstado.tipo === "exito"
                        ? "var(--cancha-suave)"
                        : mensajeEstado.tipo === "error"
                          ? "var(--rojo-suave)"
                          : "var(--azul-suave)",
                    color:
                      mensajeEstado.tipo === "exito"
                        ? "var(--cancha)"
                        : mensajeEstado.tipo === "error"
                          ? "var(--rojo)"
                          : "var(--azul)",
                    border: `1px solid ${mensajeEstado.tipo === "exito"
                      ? "var(--cancha-borde)"
                      : mensajeEstado.tipo === "error"
                        ? "rgba(255, 92, 92, 0.4)"
                        : "rgba(77, 163, 255, 0.4)"
                      }`,
                  }}
                >
                  {mensajeEstado.tipo === "exito" && <CheckCircle2 size={20} style={{ flexShrink: 0 }} />}
                  {mensajeEstado.tipo === "error" && <ShieldAlert size={20} style={{ flexShrink: 0 }} />}
                  {mensajeEstado.tipo === "info" && <ShieldAlert size={20} style={{ flexShrink: 0 }} />}
                  <div>{mensajeEstado.texto}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : usuario.rol_id === 2 ? (
        /* ================= VISTA ADMIN EXCLUSIVA (PANTALLA COMPLETA) ================= */
        <div>
          <div
            style={{
              animation: "fadeIn 0.5s ease",
              width: "100%",
              paddingBottom: 40,
              boxSizing: "border-box",
            }}
          >
            {/* BARRA SUPERIOR DASHBOARD ADMIN */}
            <div
              style={{
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 58, 138, 0.9) 100%)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "22px",
                padding: "24px 32px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 10px 20px rgba(0,0,0,0.35)",
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: "20px",
                    background: "rgba(245, 176, 0, 0.2)",
                    color: "#f5b000",
                    fontWeight: 900,
                    fontSize: "0.65rem",
                    letterSpacing: "1px",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    border: "1px solid rgba(245, 176, 0, 0.3)",
                    boxShadow: "0 0 10px rgba(245, 176, 0, 0.2)",
                  }}
                >
                  👑 Panel de Control Premium
                </span>
                <h2 style={{ margin: 0, color: "#ffffff", fontSize: "clamp(1.25rem, 3vw, 1.5rem)", fontWeight: 900, letterSpacing: "-0.5px" }}>
                  Administración Polla BetPlay
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "6px 0 0 0" }}>
                  Hola, <strong style={{ color: "#fff" }}>{usuario.nombre}</strong>. Tienes el control total.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleDescargarExcelPronosticos()}
                  disabled={!consolidados}
                  style={{
                    padding: "10px 16px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.45)",
                    transition: "transform 0.2s, boxShadow 0.2s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
                >
                  <Download size={15} /> Exportar Global (Excel)
                </button>

                <button
                  onClick={() => cargarConsolidados(usuario.id)}
                  disabled={cargandoConsolidados}
                  style={{
                    padding: "10px 16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
                >
                  <RefreshCw size={15} className={cargandoConsolidados ? "spin" : ""} /> Sincronizar
                </button>

                <button
                  onClick={handleCerrarSesion}
                  style={{
                    padding: "10px 16px",
                    background: "rgba(255, 92, 92, 0.12)",
                    color: "#ff5c5c",
                    border: "1px solid rgba(255, 92, 92, 0.35)",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    transition: "all 0.2s"
                  }}
                >
                  <LogOut size={15} /> Salir
                </button>
              </div>
            </div>

            {/* LAYOUT: SIDEBAR + CONTENIDO */}
            <div className="admin-layout-row" style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
              {/* SIDEBAR DE NAVEGACIÓN */}
              <div
                className="admin-sidebar"
                style={{
                  width: 264,
                  flexShrink: 0,
                  position: "sticky",
                  top: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  background: "linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(11, 21, 32, 0.95) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "24px",
                  padding: "18px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 8px 16px rgba(0,0,0,0.3)",
                }}
              >
                <div className="admin-sidebar-title" style={{ padding: "6px 10px 14px", color: "#64748b", fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px dashed rgba(255,255,255,0.08)", marginBottom: 6 }}>
                  Navegación
                </div>
                <div className="admin-sidebar-nav no-scrollbar">
                  {([
                    { key: "predicciones", label: "Fechas y Predicciones", icon: Eye, color: "#a78bfa" },
                    { key: "editar_partidos", label: "Editar Partidos", icon: Calendar, color: "#38bdf8" },
                    { key: "aplazados", label: "Partidos Aplazados", icon: Hourglass, color: "#f5b000" },
                    { key: "liquidacion", label: "Liquidación de Puntos", icon: ClipboardCheck, color: "#f59e0b" },
                    { key: "posiciones", label: "Tabla de Posiciones", icon: BarChart3, color: "#34d399" },
                  ] as const).map((item) => {
                    const activo = seccionAdminPanel === item.key;
                    const Icono = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSeccionAdminPanel(item.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 14px",
                          borderRadius: "16px",
                          border: activo ? `1px solid ${item.color}66` : "1px solid transparent",
                          background: activo ? `linear-gradient(135deg, ${item.color}33 0%, ${item.color}14 100%)` : "transparent",
                          color: activo ? "#ffffff" : "#94a3b8",
                          fontWeight: activo ? 800 : 600,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          boxShadow: activo ? `0 10px 25px -8px ${item.color}80` : "none",
                          transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) => { if (!activo) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                        onMouseOut={(e) => { if (!activo) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "10px",
                            background: activo ? `${item.color}26` : "rgba(255,255,255,0.05)",
                            color: activo ? item.color : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icono size={16} />
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {fechaAdmin !== 0 && (
                  <div className="admin-sidebar-fecha" style={{ marginTop: 10, padding: "12px 14px", borderRadius: 14, background: "rgba(0,0,0,0.25)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Fecha activa</div>
                    <div style={{ fontSize: "1rem", color: "#38bdf8", fontWeight: 900 }}>Fecha {fechaAdmin}</div>
                  </div>
                )}
              </div>

              {/* CONTENIDO PRINCIPAL */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {(() => {
                  const fechasDisponibles = Array.from(new Set(partidos.map((p) => p.jornada))).sort((a, b) => a - b);
                  const listaFechas = fechasDisponibles.length > 0 ? fechasDisponibles : [1, 2, 3];

                  const estaSoloFinal = (partido: any) => {
                    const esAplazado = partido.estado === "aplazado";
                    const esFinalizado = esPartidoFinalizadoReal(partido, partidosEnVivo);
                    const hace2Horas = new Date().getTime() >= new Date(partido.fecha_hora_partido).getTime() + 2 * 60 * 60 * 1000;
                    return esFinalizado || esAplazado || hace2Horas;
                  };

                  // Filtro de partidos para el Admin (los aplazados tienen su propia sección dedicada, no aparecen aquí)
                  const partidosAdminFiltrados = fechaAdmin === 0
                    ? []
                    : partidos.filter((p) => p.jornada === fechaAdmin && p.estado !== "aplazado");
                  const partidosActivosAdmin = partidosAdminFiltrados
                    .filter((p) => !estaSoloFinal(p))
                    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());
                  const partidosFinalizadosAdmin = partidosAdminFiltrados
                    .filter((p) => estaSoloFinal(p))
                    .sort((a, b) => {
                      if (a.estado === "aplazado" && b.estado !== "aplazado") return 1;
                      if (a.estado !== "aplazado" && b.estado === "aplazado") return -1;
                      return new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime();
                    });

                  // Selector compacto de fecha, reutilizado en Predicciones y Liquidación
                  const SelectorFechaCompacto = (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "rgba(0,0,0,0.25)", padding: "8px", borderRadius: "18px", marginBottom: 20, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.3)" }}>
                      {listaFechas.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            setFechaAdmin(f);
                            if (usuario) cargarConsolidados(usuario.id);
                          }}
                          style={{
                            padding: "7px 14px",
                            borderRadius: "10px",
                            fontWeight: 800,
                            fontSize: "0.78rem",
                            background: fechaAdmin === f ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" : "transparent",
                            color: fechaAdmin === f ? "#ffffff" : "#cbd5e1",
                            border: "none",
                            boxShadow: fechaAdmin === f ? "0 8px 20px -6px rgba(59, 130, 246, 0.6)" : "none",
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                          }}
                        >
                          Fecha {f}
                        </button>
                      ))}
                    </div>
                  );

                  // ---------- TARJETA: SOLO PREDICCIONES ----------
                  const renderPartidoPrediccionesCard = (partido: any) => {
                    const esAplazado = partido.estado === "aplazado";
                    const horaCierre = new Date(new Date(partido.fecha_hora_partido).getTime() - 30 * 60 * 1000);
                    const ahora = new Date();
                    const cerrado = ahora >= horaCierre;
                    const msFaltantes = horaCierre.getTime() - ahora.getTime();
                    let conteoFaltante = "";
                    if (!cerrado && esAplazado) {
                      const days = Math.floor(msFaltantes / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((msFaltantes % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const mins = Math.floor((msFaltantes % (1000 * 60 * 60)) / (1000 * 60));
                      conteoFaltante = `${days > 0 ? days + "d " : ""}${hours}h ${mins}m`;
                    }
                    const pronosticosPartido = (consolidados?.prediccionesPartidos || []).filter((p: any) => p.partido_id === partido.id);
                    return (
                      <div key={partido.id} style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "20px",
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.45)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                              <span style={{ fontSize: "1rem", fontWeight: 900, color: "#fff" }}>VS</span>
                              <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                            </div>
                            <div>
                              <h3 style={{ margin: 0, color: "#ffffff", fontSize: "1.02rem" }}>
                                {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
                              </h3>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                                <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>
                                  🕒 {formatearFechaPartido(partido.fecha_hora_partido)} · {formatearHoraPartido(partido.fecha_hora_partido)}
                                </span>
                                {partido.estadio && (
                                  <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>
                                    🏟️ {partido.estadio}
                                  </span>
                                )}
                              </div>
                              {esAplazado && (
                                <div style={{ marginTop: 4, padding: "4px 10px", background: cerrado ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)", color: cerrado ? "#ef4444" : "#fef08a", borderRadius: 8, fontSize: "0.85rem", fontWeight: 800, display: "inline-block" }}>
                                  {cerrado ? "🔒 Pronósticos Cerrados" : `⏳ Cierra pronósticos en: ${conteoFaltante}`}
                                </div>
                              )}
                              <div>
                                <span style={{ fontSize: "0.9rem", color: "#a78bfa", fontWeight: 700 }}>
                                  {pronosticosPartido.length} pronósticos recibidos
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              onClick={() => setPartidoAdminVer(partidoAdminVer === partido.id ? null : partido.id)}
                              style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
                            >
                              <Users size={16} /> Ver Participantes
                            </button>

                            <button
                              onClick={() => handleDescargarExcelPronosticos(partido.id)}
                              style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem", background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
                            >
                              <Download size={16} /> Bajar Excel
                            </button>
                          </div>
                        </div>

                        {partidoAdminVer === partido.id && (
                          <div id={`tabla-pronosticos-admin-${partido.id}`} style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)", animation: "fadeIn 0.3s ease" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                              <h4 style={{ margin: 0, color: "#a78bfa", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                                📋 Tabla de Predicciones ({pronosticosPartido.length})
                              </h4>
                              <button
                                onClick={() => handleDescargarImagenPronosticos(partido.id)}
                                style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}
                              >
                                <Camera size={14} /> Captura
                              </button>
                            </div>

                            {pronosticosPartido.length === 0 ? (
                              <div style={{ padding: 20, background: "rgba(0,0,0,0.2)", borderRadius: 12, color: "#94a3b8", textAlign: "center" }}>
                                Nadie ha enviado pronósticos para este partido.
                              </div>
                            ) : (
                              <div style={{ overflowX: "auto", background: "rgba(0, 0, 0, 0.3)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
                                  <thead>
                                    <tr style={{ background: "rgba(255,255,255,0.02)", color: "#cbd5e1" }}>
                                      <th style={{ padding: "12px 16px", fontWeight: 800 }}>Participante</th>
                                      <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800 }}>Marcador</th>
                                      <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800 }}>Ganador</th>
                                      <th style={{ padding: "12px 16px", fontWeight: 800 }}>Goleador</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pronosticosPartido.map((p: any, idx: number) => (
                                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#ffffff" }}>
                                          {p.usuario.nombre_completo}
                                        </td>
                                        <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 900, color: "#34d399", fontSize: "1.1rem" }}>
                                          {p.goles_local_predicho} - {p.goles_visitante_predicho}
                                        </td>
                                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                          {(() => {
                                            const valL = p.goles_local_predicho !== undefined && p.goles_local_predicho !== null ? p.goles_local_predicho : p.goles_local;
                                            const valV = p.goles_visitante_predicho !== undefined && p.goles_visitante_predicho !== null ? p.goles_visitante_predicho : p.goles_visitante;
                                            const gL = Number(valL);
                                            const gV = Number(valV);
                                            let ganadorTexto = "Empate";
                                            if (!isNaN(gL) && !isNaN(gV)) {
                                              if (gL > gV) ganadorTexto = `Gana ${partido.equipo_local.nombre}`;
                                              else if (gV > gL) ganadorTexto = `Gana ${partido.equipo_visitante.nombre}`;
                                              else ganadorTexto = "Empate";
                                            }
                                            return (
                                              <span style={{ padding: "4px 10px", borderRadius: 10, background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 800, fontSize: "0.8rem" }}>
                                                {ganadorTexto}
                                              </span>
                                            );
                                          })()}
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "#f5b000", fontWeight: 700 }}>
                                          {obtenerNombreGoleador(p)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  };

                  // ---------- TARJETA: SOLO LIQUIDACIÓN DE PUNTOS ----------
                  const renderPartidoLiquidacionCard = (partido: any) => {
                    const esAplazado = partido.estado === "aplazado";
                    const horaCierre = new Date(new Date(partido.fecha_hora_partido).getTime() - 30 * 60 * 1000);
                    const ahora = new Date();
                    const cerrado = ahora >= horaCierre;
                    const msFaltantes = horaCierre.getTime() - ahora.getTime();
                    let conteoFaltante = "";
                    if (!cerrado && esAplazado) {
                      const days = Math.floor(msFaltantes / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((msFaltantes % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const mins = Math.floor((msFaltantes % (1000 * 60 * 60)) / (1000 * 60));
                      conteoFaltante = `${days > 0 ? days + "d " : ""}${hours}h ${mins}m`;
                    }
                    if (partido.jornada === 1) return null;
                    return (
                      <div key={partido.id} style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "20px",
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.45)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                            <span style={{ fontSize: "1rem", fontWeight: 900, color: "#fff" }}>VS</span>
                            <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                          </div>
                          <h3 style={{ margin: 0, color: "#ffffff", fontSize: "1.02rem" }}>
                            {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
                          </h3>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          <div style={{ fontSize: "1rem", color: "#e2e8f0", fontWeight: 800 }}>
                            ⚙️ Gestión de Resultado Oficial
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", background: "rgba(0,0,0,0.2)", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <input
                                type="number"
                                min="0"
                                placeholder="Local"
                                style={{ width: 64, padding: "10px", borderRadius: "10px", border: "2px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", color: "#fff", textAlign: "center", fontWeight: 900, fontSize: "1.1rem" }}
                                value={resultadosAdminInput[partido.id]?.local || ""}
                                onChange={(e) => handleResultadoAdminChange(partido.id, "local", e.target.value)}
                              />
                              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--texto-secundario)", padding: "0 4px" }}>-</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="Visita"
                                style={{ width: 64, padding: "10px", borderRadius: "10px", border: "2px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", color: "#fff", textAlign: "center", fontWeight: 900, fontSize: "1.1rem" }}
                                value={resultadosAdminInput[partido.id]?.visitante || ""}
                                onChange={(e) => handleResultadoAdminChange(partido.id, "visitante", e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const toastId = toast.loading(`Obteniendo datos de ESPN para ${partido.equipo_local.nombre}...`);
                                    const res = await fetch("/api/admin/espn-resultado", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ partidoId: partido.id }),
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error || "Error al obtener de ESPN");
                                    
                                    setResultadosAdminInput((prev: any) => ({
                                      ...prev,
                                      [partido.id]: {
                                        local: data.golesLocal.toString(),
                                        visitante: data.golesVisitante.toString(),
                                        goleadores_ids: data.goleadoresIds || [],
                                      },
                                    }));

                                    let msg = `Marcador auto-completado: ${data.golesLocal}-${data.golesVisitante}`;
                                    if (data.espnStatus !== "STATUS_FULL_TIME") {
                                      msg += " (¡OJO! Partido NO finalizado en ESPN)";
                                    }
                                    toast.success(msg, { id: toastId });
                                    if (data.logs && data.logs.length > 0) {
                                      console.log("ESPN Logs:", data.logs);
                                    }
                                  } catch (err: any) {
                                    toast.error(err.message);
                                  }
                                }}
                                style={{
                                  marginLeft: 16,
                                  padding: "8px 16px",
                                  borderRadius: "8px",
                                  background: "rgba(59, 130, 246, 0.2)",
                                  color: "#60a5fa",
                                  border: "1px solid rgba(59, 130, 246, 0.5)",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  transition: "all 0.2s"
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.4)"; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)"; }}
                              >
                                🔄 Extraer ESPN
                              </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 280 }}>
                              <select
                                style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", color: "#fff", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", appearance: "none" }}
                                value=""
                                onChange={(e) => {
                                  handleAgregarGoleadorAdmin(partido.id, e.target.value);
                                  e.target.value = "";
                                }}
                              >
                                <option value="">➕ Seleccionar Goleador Oficial (Opcional)</option>
                                {partido.equipo_local.jugadores && partido.equipo_local.jugadores.length > 0 && (
                                  <optgroup label={`🏠 ${partido.equipo_local.nombre}`}>
                                    {partido.equipo_local.jugadores.map((j: any) => (
                                      <option key={j.id} value={j.id}>{j.nombre}</option>
                                    ))}
                                  </optgroup>
                                )}
                                {partido.equipo_visitante.jugadores && partido.equipo_visitante.jugadores.length > 0 && (
                                  <optgroup label={`✈️ ${partido.equipo_visitante.nombre}`}>
                                    {partido.equipo_visitante.jugadores.map((j: any) => (
                                      <option key={j.id} value={j.id}>{j.nombre}</option>
                                    ))}
                                  </optgroup>
                                )}
                              </select>

                              {resultadosAdminInput[partido.id]?.goleadores_ids?.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 4 }}>
                                  {resultadosAdminInput[partido.id].goleadores_ids.map((jId: any, idxGoleador: number) => {
                                    const todosJugadores = [...(partido.equipo_local.jugadores || []), ...(partido.equipo_visitante.jugadores || []), ...jugadores];
                                    const jObj = todosJugadores.find((j) => j.id === jId);
                                    return (
                                      <span
                                        key={`${jId}-${idxGoleador}`}
                                        style={{
                                          background: "rgba(245, 176, 0, 0.15)",
                                          color: "#f5b000",
                                          border: "1px solid rgba(245, 176, 0, 0.3)",
                                          borderRadius: "20px",
                                          padding: "4px 12px",
                                          fontSize: "0.85rem",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 8,
                                          fontWeight: 700,
                                        }}
                                      >
                                        ⚽ {jObj?.nombre || `ID: ${jId}`}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoverGoleadorAdmin(partido.id, idxGoleador)}
                                          style={{ background: "rgba(0,0,0,0.2)", border: "none", color: "#ef4444", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 900, fontSize: "0.8rem", marginLeft: 4 }}
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <button
                              onClick={() => handleCargarMarcadorPantalla(partido.id)}
                              style={{
                                flex: 1,
                                minWidth: "200px",
                                padding: "12px",
                                borderRadius: "12px",
                                fontSize: "0.95rem",
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "#fff",
                                border: "none",
                                fontWeight: 900,
                                cursor: "pointer",
                                boxShadow: "0 10px 25px -6px rgba(16, 185, 129, 0.5)",
                                transition: "transform 0.2s"
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                              onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
                            >
                              ⚽ Cargar Marcador en Pantalla
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm("ATENCIÓN: Esto ejecutará el cálculo de puntos para TODOS los usuarios y modificará la tabla general. ¿Estás seguro de que quieres LIQUIDAR PUNTOS ahora mismo?")) {
                                  handleCargarResultadoOficial(partido.id);
                                }
                              }}
                              disabled={partido.estado !== "resultado_cargado" && partido.estado !== "puntaje_calculado"}
                              style={{
                                flex: 1,
                                minWidth: "200px",
                                padding: "12px",
                                borderRadius: "12px",
                                fontSize: "0.95rem",
                                background: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" : "rgba(255,255,255,0.05)",
                                color: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "#fff" : "#64748b",
                                border: "none",
                                fontWeight: 900,
                                cursor: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "pointer" : "not-allowed",
                                boxShadow: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "0 10px 25px -6px rgba(245, 158, 11, 0.5)" : "none",
                                transition: "all 0.2s"
                              }}
                            >
                              🏆 Liquidar Puntos (Global)
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuitarResultado(partido.id)}
                              disabled={partido.estado !== "resultado_cargado" && partido.estado !== "puntaje_calculado"}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                minWidth: "160px",
                                padding: "12px",
                                borderRadius: "12px",
                                fontSize: "0.95rem",
                                background: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.05)",
                                color: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "#ef4444" : "#64748b",
                                border: "1px solid " + (partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "rgba(239, 68, 68, 0.4)" : "rgba(255,255,255,0.08)"),
                                fontWeight: 900,
                                cursor: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "pointer" : "not-allowed",
                              }}
                            >
                              <Trash2 size={14} /> Quitar Resultado
                            </button>
                          </div>
                          {partido.estado !== "resultado_cargado" && partido.estado !== "puntaje_calculado" && (
                            <div style={{ fontSize: "0.8rem", color: "#f59e0b", fontStyle: "italic", textAlign: "right" }}>
                              * Primero carga el marcador en pantalla para habilitar la liquidación.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  };

                  // ---------- TARJETA: PARTIDO APLAZADO (sección dedicada) ----------
                  const renderPartidoAplazadoCard = (partido: any) => {
                    return (
                      <div key={partido.id} style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "20px",
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.45)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                            <span style={{ fontSize: "1rem", fontWeight: 900, color: "#fff" }}>VS</span>
                            <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                          </div>
                          <div>
                            <h3 style={{ margin: 0, color: "#ffffff", fontSize: "1.02rem" }}>
                              {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
                            </h3>
                            <div style={{ marginTop: 4, padding: "4px 10px", background: "rgba(245, 158, 11, 0.15)", color: "#f5b000", borderRadius: 8, fontSize: "0.8rem", fontWeight: 800, display: "inline-block" }}>
                              📅 Pertenece a Fecha {partido.jornada}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                          <select
                            value={programacionAdminInput[partido.id]?.jornada ?? String(partido.jornada)}
                            onChange={(e) => actualizarProgramacionInput(partido, "jornada", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}
                          >
                            {Array.from({ length: Math.max(listaFechas.length, partido.jornada) + 2 }, (_, i) => i + 1).map((f) => (
                              <option key={f} value={f}>Fecha {f}</option>
                            ))}
                          </select>

                          <input
                            type="datetime-local"
                            value={programacionAdminInput[partido.id]?.fecha_hora ?? aInputDatetimeLocal(partido.fecha_hora_partido)}
                            onChange={(e) => actualizarProgramacionInput(partido, "fecha_hora", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}
                          />

                          <input
                            type="text"
                            placeholder="🏟️ Estadio"
                            value={programacionAdminInput[partido.id]?.estadio ?? (partido.estadio || "")}
                            onChange={(e) => actualizarProgramacionInput(partido, "estadio", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", color: "#fff", fontWeight: 700, fontSize: "0.85rem", minWidth: 180 }}
                          />

                          <button
                            type="button"
                            onClick={() => handleGuardarProgramacion(partido)}
                            disabled={guardandoProgramacionId === partido.id}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: "10px", border: "none", fontWeight: 800, fontSize: "0.82rem", cursor: guardandoProgramacionId === partido.id ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "#fff", opacity: guardandoProgramacionId === partido.id ? 0.6 : 1 }}
                          >
                            <Save size={14} /> Guardar Programación
                          </button>

                          {programacionGuardadaId === partido.id && (
                            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#34d399", fontWeight: 800, fontSize: "0.82rem" }}>
                              <CheckCircle2 size={16} /> Guardado
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleAplazado(partido)}
                            disabled={guardandoProgramacionId === partido.id}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: "10px", border: "none", fontWeight: 800, fontSize: "0.82rem", cursor: guardandoProgramacionId === partido.id ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", opacity: guardandoProgramacionId === partido.id ? 0.6 : 1 }}
                          >
                            <CheckCircle2 size={14} /> Reactivar Partido
                          </button>
                        </div>
                      </div>
                    );
                  };

                  // ---------- TARJETA: EDITAR PROGRAMACIÓN DE UN PARTIDO (sección dedicada) ----------
                  const renderPartidoEditarCard = (partido: any) => {
                    const esAplazado = partido.estado === "aplazado";
                    return (
                      <div key={partido.id} style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "20px",
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.45)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                            <span style={{ fontSize: "1rem", fontWeight: 900, color: "#fff" }}>VS</span>
                            <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                          </div>
                          <div>
                            <h3 style={{ margin: 0, color: "#ffffff", fontSize: "1.02rem" }}>
                              {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
                            </h3>
                            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>
                              🕒 {formatearFechaPartido(partido.fecha_hora_partido)} · {formatearHoraPartido(partido.fecha_hora_partido)}
                              {partido.estadio ? ` · 🏟️ ${partido.estadio}` : ""}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                          <select
                            value={programacionAdminInput[partido.id]?.jornada ?? String(partido.jornada)}
                            onChange={(e) => actualizarProgramacionInput(partido, "jornada", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}
                          >
                            {Array.from({ length: Math.max(listaFechas.length, partido.jornada) + 2 }, (_, i) => i + 1).map((f) => (
                              <option key={f} value={f}>Fecha {f}</option>
                            ))}
                          </select>

                          <input
                            type="datetime-local"
                            value={programacionAdminInput[partido.id]?.fecha_hora ?? aInputDatetimeLocal(partido.fecha_hora_partido)}
                            onChange={(e) => actualizarProgramacionInput(partido, "fecha_hora", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}
                          />

                          <input
                            type="text"
                            placeholder="🏟️ Estadio"
                            value={programacionAdminInput[partido.id]?.estadio ?? (partido.estadio || "")}
                            onChange={(e) => actualizarProgramacionInput(partido, "estadio", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", color: "#fff", fontWeight: 700, fontSize: "0.85rem", minWidth: 180 }}
                          />

                          <button
                            type="button"
                            onClick={() => handleGuardarProgramacion(partido)}
                            disabled={guardandoProgramacionId === partido.id}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: "10px", border: "none", fontWeight: 800, fontSize: "0.82rem", cursor: guardandoProgramacionId === partido.id ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "#fff", opacity: guardandoProgramacionId === partido.id ? 0.6 : 1 }}
                          >
                            <Save size={14} /> Guardar Programación
                          </button>

                          {programacionGuardadaId === partido.id && (
                            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#34d399", fontWeight: 800, fontSize: "0.82rem" }}>
                              <CheckCircle2 size={16} /> Guardado
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleAplazado(partido)}
                            disabled={guardandoProgramacionId === partido.id}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: "10px", fontWeight: 800, fontSize: "0.82rem", cursor: guardandoProgramacionId === partido.id ? "not-allowed" : "pointer", background: esAplazado ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" : "transparent", color: esAplazado ? "#fff" : "#f59e0b", border: "1px solid " + (esAplazado ? "transparent" : "rgba(245, 158, 11, 0.4)") }}
                          >
                            <Hourglass size={14} /> {esAplazado ? "Quitar Aplazado" : "Marcar Aplazado"}
                          </button>
                        </div>
                      </div>
                    );
                  };

                  // ================= SECCIÓN: EDITAR PARTIDOS (programación) =================
                  if (seccionAdminPanel === "editar_partidos") {
                    return (
                      <div>
                        <h2 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1.3rem", fontWeight: 900 }}>📅 Editar Partidos</h2>
                        <p style={{ color: "#94a3b8", margin: "0 0 16px", fontSize: "0.82rem" }}>Cambia la fecha, hora, jornada o estadio de un partido. No afecta resultados ni puntos ya liquidados.</p>
                        {SelectorFechaCompacto}
                        {fechaAdmin === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(15, 23, 42, 0.6)", border: "2px dashed rgba(245, 158, 11, 0.4)", borderRadius: 24 }}>
                            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#f59e0b" }}>👆 Selecciona una Fecha</div>
                          </div>
                        ) : partidosAdminFiltrados.length === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(15, 23, 42, 0.6)", borderRadius: 24, color: "#94a3b8" }}>
                            {`No hay partidos programados para la Fecha ${fechaAdmin}.`}
                          </div>
                        ) : (
                          <>
                            {partidosActivosAdmin.map((partido) => renderPartidoEditarCard(partido))}
                            {partidosFinalizadosAdmin.length > 0 && (
                              <>
                                <div style={{ margin: "30px 0 20px", borderTop: "2px dashed rgba(255,255,255,0.1)", paddingTop: 20 }}>
                                  <h3 style={{ color: "#64748b", fontSize: "1.2rem", fontWeight: 900, margin: 0 }}>Partidos Finalizados</h3>
                                </div>
                                {partidosFinalizadosAdmin.map((partido) => renderPartidoEditarCard(partido))}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }

                  // ================= SECCIÓN: PARTIDOS APLAZADOS =================
                  if (seccionAdminPanel === "aplazados") {
                    const partidosAplazados = partidos
                      .filter((p) => p.estado === "aplazado")
                      .sort((a, b) => a.jornada - b.jornada);
                    return (
                      <div>
                        <h2 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1.3rem", fontWeight: 900 }}>⏳ Partidos Aplazados</h2>
                        <p style={{ color: "#94a3b8", margin: "0 0 16px", fontSize: "0.82rem" }}>Partidos pospuestos, sin importar la fecha a la que pertenecen. Reprográmalos aquí cuando tengas la nueva fecha, o reactívalos para que vuelvan a su fecha normal.</p>
                        {partidosAplazados.length === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(15, 23, 42, 0.6)", borderRadius: 24, color: "#94a3b8" }}>
                            No hay partidos aplazados registrados actualmente.
                          </div>
                        ) : (
                          partidosAplazados.map((partido) => renderPartidoAplazadoCard(partido))
                        )}
                      </div>
                    );
                  }

                  // ================= SECCIÓN: FECHAS Y PREDICCIONES (UNIFICADA) =================
                  if (seccionAdminPanel === "predicciones") {
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* KPIs */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
                          {[
                            { label: "Usuarios Registrados", value: consolidados?.usuarios?.length || 0, icon: UserCheck, color: "#38bdf8" },
                            { label: "Líder Actual", value: TABLA_POSICIONES_FIJA[0]?.nombre_completo || "N/A", sub: TABLA_POSICIONES_FIJA[0] ? `${TABLA_POSICIONES_FIJA[0]?.pts_total ?? 0} Pts` : undefined, icon: Trophy, color: "#f5b000" },
                            { label: "Partidos Programados", value: partidos.length, icon: Calendar, color: "#10b981" },
                          ].map((kpi, idx) => {
                            const KpiIcono = kpi.icon;
                            return (
                              <div
                                key={idx}
                                style={{
                                  padding: "18px 20px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 16,
                                  background: "rgba(15, 23, 42, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: `1px solid ${kpi.color}33`,
                                  borderRadius: "20px",
                                  boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                              >
                                <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: `${kpi.color}22`, filter: "blur(30px)", borderRadius: "50%" }}></div>
                                <div
                                  style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "14px",
                                    background: `linear-gradient(135deg, ${kpi.color}33 0%, ${kpi.color}66 100%)`,
                                    color: kpi.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    border: `1px solid ${kpi.color}4d`,
                                  }}
                                >
                                  <KpiIcono size={26} />
                                </div>
                                <div style={{ zIndex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    {kpi.label}
                                  </div>
                                  <strong style={{ fontSize: typeof kpi.value === "string" && kpi.value.length > 14 ? "1.05rem" : "1.6rem", color: "#ffffff", fontWeight: 900, lineHeight: 1.15, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {kpi.value}
                                  </strong>
                                  {kpi.sub && <span style={{ fontSize: "0.8rem", color: kpi.color, fontWeight: 800 }}>{kpi.sub}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* SELECTOR GRANDE DE FECHA */}
                        <div
                          style={{
                            background: "rgba(15, 23, 42, 0.7)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: "24px",
                            padding: "24px",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.55)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                            <div>
                              <h2 style={{ margin: 0, fontSize: "1.35rem", color: "#ffffff", fontWeight: 900 }}>
                                👁️ Fechas y Predicciones
                              </h2>
                              <p style={{ color: "#94a3b8", margin: "6px 0 0 0", fontSize: "0.85rem" }}>
                                Selecciona una fecha para revisar lo que pronosticó cada usuario. Los partidos aplazados aparecen siempre.
                              </p>
                            </div>

                            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: "rgba(0,0,0,0.2)", padding: "6px", borderRadius: "20px" }}>
                              {listaFechas.map((f) => (
                                <button
                                  key={f}
                                  type="button"
                                  onClick={() => {
                                    setFechaAdmin(f);
                                    if (usuario) cargarConsolidados(usuario.id);
                                  }}
                                  style={{
                                    padding: "8px 18px",
                                    borderRadius: "12px",
                                    fontWeight: 800,
                                    fontSize: "0.8rem",
                                    background: fechaAdmin === f ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" : "transparent",
                                    color: fechaAdmin === f ? "#ffffff" : "#cbd5e1",
                                    border: "none",
                                    boxShadow: fechaAdmin === f ? "0 8px 20px -6px rgba(59, 130, 246, 0.6)" : "none",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  Fecha {f}
                                </button>
                              ))}

                              <button
                                type="button"
                                onClick={() => handleDescargarExcelPronosticos(undefined, fechaAdmin)}
                                disabled={fechaAdmin === 0}
                                style={{
                                  padding: "8px 18px",
                                  fontSize: "0.8rem",
                                  background: fechaAdmin === 0 ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                  color: fechaAdmin === 0 ? "#64748b" : "#fff",
                                  border: "none",
                                  borderRadius: "12px",
                                  fontWeight: 900,
                                  boxShadow: fechaAdmin === 0 ? "none" : "0 8px 20px -6px rgba(16, 185, 129, 0.6)",
                                  cursor: fechaAdmin === 0 ? "not-allowed" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 7,
                                  marginLeft: 8,
                                  transition: "all 0.3s"
                                }}
                              >
                                <Download size={15} /> Excel F{fechaAdmin || "-"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* TARJETAS DE PARTIDOS CON SUS PREDICCIONES (incluye aplazados) */}
                        {fechaAdmin === 0 && partidosAdminFiltrados.length === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(15, 23, 42, 0.6)", border: "2px dashed rgba(167, 139, 250, 0.4)", borderRadius: 24 }}>
                            <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#a78bfa" }}>👆 Selecciona una Fecha</div>
                          </div>
                        ) : partidosAdminFiltrados.length === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(15, 23, 42, 0.6)", borderRadius: 24, color: "#94a3b8" }}>
                            {`No hay partidos programados para la Fecha ${fechaAdmin}.`}
                          </div>
                        ) : (
                          <>
                            {partidosActivosAdmin.map((partido) => renderPartidoPrediccionesCard(partido))}
                            {partidosFinalizadosAdmin.length > 0 && (
                              <>
                                <div style={{ margin: "30px 0 20px", borderTop: "2px dashed rgba(255,255,255,0.1)", paddingTop: 20 }}>
                                  <h3 style={{ color: "#64748b", fontSize: "1.2rem", fontWeight: 900, margin: 0 }}>Partidos Finalizados</h3>
                                </div>
                                {partidosFinalizadosAdmin.map((partido) => renderPartidoPrediccionesCard(partido))}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }

                  // ================= SECCIÓN: LIQUIDACIÓN DE PUNTOS =================
                  if (seccionAdminPanel === "liquidacion") {
                    return (
                      <div>
                        <h2 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1.3rem", fontWeight: 900 }}>🏆 Liquidación de Puntos</h2>
                        <p style={{ color: "#94a3b8", margin: "0 0 16px", fontSize: "0.82rem" }}>Carga el marcador oficial y liquida los puntos de cada partido.</p>
                        {SelectorFechaCompacto}
                        {fechaAdmin === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(15, 23, 42, 0.6)", border: "2px dashed rgba(245, 158, 11, 0.4)", borderRadius: 24 }}>
                            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#f59e0b" }}>👆 Selecciona una Fecha</div>
                          </div>
                        ) : partidosAdminFiltrados.length === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(15, 23, 42, 0.6)", borderRadius: 24, color: "#94a3b8" }}>
                            {`No hay partidos programados para la Fecha ${fechaAdmin}.`}
                          </div>
                        ) : (
                          <>
                            {partidosActivosAdmin.map((partido) => renderPartidoLiquidacionCard(partido))}
                            {partidosFinalizadosAdmin.length > 0 && (
                              <>
                                <div style={{ margin: "30px 0 20px", borderTop: "2px dashed rgba(255,255,255,0.1)", paddingTop: 20 }}>
                                  <h3 style={{ color: "#64748b", fontSize: "1.2rem", fontWeight: 900, margin: 0 }}>Partidos Finalizados</h3>
                                </div>
                                {partidosFinalizadosAdmin.map((partido) => renderPartidoLiquidacionCard(partido))}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }

                  // ================= SECCIÓN: TABLA DE POSICIONES =================
                  return (
                    <div>
                      <h2 style={{ margin: "0 0 4px", color: "#fff", fontSize: "1.3rem", fontWeight: 900 }}>📊 Tabla de Posiciones</h2>
                      <p style={{ color: "#94a3b8", margin: "0 0 16px", fontSize: "0.82rem" }}>Puntos verificados de todos los participantes.</p>
                      {cargandoConsolidados ? (
                        <div style={{ textAlign: "center", padding: 50, background: "rgba(15, 23, 42, 0.6)", borderRadius: 24 }}>
                          <RefreshCw className="spin" size={36} style={{ color: "#38bdf8", marginBottom: 16 }} />
                          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>Cargando tabla de posiciones...</div>
                        </div>
                      ) : !consolidados ? (
                        <div style={{ textAlign: "center", padding: 40, background: "rgba(15, 23, 42, 0.6)", borderRadius: 24, color: "#94a3b8" }}>
                          No se pudieron cargar los datos.
                        </div>
                      ) : (
                        <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)" }}>
                          <TablaPosicionesAfiche
                            tabla={consolidados.tablaPosiciones || []}
                            onDescargarExcelPronosticos={handleDescargarExcelPronosticos}
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VISTA NORMAL DE PARTICIPANTE ================= */
        <div>
          {/* HEADER PRINCIPAL RESPONSIVO */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              background: "rgba(14, 26, 39, 0.95)",
              backdropFilter: "blur(14px)",
              border: "1px solid var(--linea-fuerte)",
              borderRadius: 16,
              marginBottom: 20,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{ fontWeight: 900, fontSize: "1.2rem", color: "#ffffff", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                onClick={() => setTabActiva("inicio")}
              >
                ⚽ POLLA LIGA BETPLAY
              </div>
            </div>

            {/* CENTRO: ES LOGAN LÍMPIO EN BLANCO CON ICONOS 3D ANIMADOS */}
            <div
              className="desktop-slogan"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                justifyContent: "center",
              }}
            >
              {/* BALÓN 3D */}
              <img
                src="/images/balon_3d.png"
                alt="Balón 3D"
                className="icono-3d-flotante"
                style={{ width: 32, height: 32 }}
              />

              {/* TEXTO EN BLANCO LÍMPIO */}
              <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "#ffffff", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                DEMUESTRA LO QUE SABES DE FÚTBOL ⚽🔥
              </span>

              {/* CAMISETA #10 3D */}
              <img
                src="/images/camiseta_3d.png"
                alt="Camiseta 10 3D"
                className="icono-3d-flotante-delay"
                style={{ width: 32, height: 32 }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="desktop-slogan" style={{ color: "var(--graderia)", fontSize: "0.85rem", fontWeight: 600 }}>
                {usuario.nombre}
              </span>
              <button
                type="button"
                className="btn desktop-slogan"
                onClick={handleCerrarSesion}
                style={{ padding: "6px 12px", fontSize: "0.8rem", background: "rgba(255, 92, 92, 0.1)", color: "#ff5c5c", border: "1px solid rgba(255,92,92,0.3)", display: "flex", alignItems: "center", gap: 6 }}
              >
                <LogOut size={14} /> Salir
              </button>
              {/* BOTÓN MENÚ HAMBURGUESA MOVIL (3 LÍNEAS) */}
              <button
                type="button"
                className="mobile-menu-btn btn"
                onClick={() => setMenuAbierto(!menuAbierto)}
                style={{ padding: "8px 14px", background: "var(--noche-2)", border: "1px solid var(--linea-fuerte)", color: "#fff", cursor: "pointer" }}
              >
                {menuAbierto ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </header>

          {/* MENÚ DESPLEGABLE HAMBURGUESA PARA CELULARES (3 LÍNEAS) */}
          {menuAbierto && (
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "var(--tribuna)",
                border: "1px solid var(--cancha-borde)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className={`menu-drawer-item ${tabActiva === "partidos" ? "active" : ""}`}
                onClick={() => {
                  setTabActiva("partidos");
                  setMenuAbierto(false);
                }}
              >
                ⚽ Pronósticos Fecha {fechaParticipante}
              </div>
              <div
                className={`menu-drawer-item ${tabActiva === "finalizados" ? "active" : ""}`}
                onClick={() => {
                  setTabActiva("finalizados");
                  setMenuAbierto(false);
                }}
              >
                🏁 Partidos Terminados
              </div>
              <div
                className={`menu-drawer-item ${tabActiva === "inicial" ? "active" : ""}`}
                onClick={() => {
                  setTabActiva("inicial");
                  setMenuAbierto(false);
                }}
              >
                🏆 Predicciones Torneo (Campeón y Clasificados)
              </div>
              <div
                className={`menu-drawer-item ${tabActiva === "mis_pronosticos" ? "active" : ""}`}
                onClick={() => {
                  setTabActiva("mis_pronosticos");
                  setMenuAbierto(false);
                  cargarConsolidados(usuario.id);
                }}
              >
                📋 Mis Pronósticos y Públicos
              </div>
              <div
                className={`menu-drawer-item ${tabActiva === "posiciones" ? "active" : ""}`}
                onClick={() => {
                  setTabActiva("posiciones");
                  setMenuAbierto(false);
                  cargarConsolidados(usuario.id);
                }}
              >
                📊 Tabla de Posiciones
              </div>
              {esSamuel && (
                <div
                  className={`menu-drawer-item ${tabActiva === "en_vivo" ? "active" : ""}`}
                  onClick={() => {
                    setTabActiva("en_vivo");
                    setMenuAbierto(false);
                    cargarPartidosEnVivo();
                  }}
                  style={{ color: "#ff4d4d", fontWeight: 800 }}
                >
                  🔴 Partidos y Stats En Vivo
                </div>
              )}
              <div
                className="menu-drawer-item"
                onClick={handleCerrarSesion}
                style={{ color: "var(--rojo)", borderColor: "rgba(255,92,92,0.3)" }}
              >
                <LogOut size={18} /> Salir (Cerrar Sesión)
              </div>
            </div>
          )}



          {/* MENSAJE DE ESTADO DE OPERACIÓN */}
          {mensajeEstado && (
            <div
              style={{
                marginBottom: 24,
                padding: "16px 20px",
                borderRadius: 12,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                background: mensajeEstado.tipo === "exito" ? "var(--cancha-suave)" : "var(--rojo-suave)",
                color: mensajeEstado.tipo === "exito" ? "var(--cancha)" : "var(--rojo)",
                border: `1px solid ${mensajeEstado.tipo === "exito" ? "var(--cancha-borde)" : "rgba(255,92,92,0.4)"}`,
              }}
            >
              {mensajeEstado.tipo === "exito" ? <CheckCircle2 size={24} style={{ flexShrink: 0 }} /> : <AlertTriangle size={24} style={{ flexShrink: 0 }} />}
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{mensajeEstado.texto}</div>
            </div>
          )}

          {/* TAB 0: PANTALLA DE INICIO Y BIENVENIDA (con sidebar de navegación) */}
          {tabActiva === "inicio" && (
            <div className="inicio-layout-row" style={{ display: "flex", gap: 20, alignItems: "stretch" }}>
              {/* SIDEBAR DE MENÚ RÁPIDO (a la izquierda) */}
              <div
                className="inicio-sidebar"
                style={{
                  width: 300,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  background: "linear-gradient(180deg, rgba(14, 26, 39, 0.95) 0%, rgba(16, 42, 33, 0.92) 100%)",
                  border: "1px solid var(--cancha-borde)",
                  borderRadius: 16,
                  padding: 18,
                  boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
                }}
              >

                <div className="inicio-sidebar-nav no-scrollbar">
                  {([
                    {
                      key: "partidos",
                      emoji: "⚽",
                      label: `Pronósticos`,
                      desc: "Marcadores, ganadores y goleadores",
                      color: "#10b981",
                      onClick: () => setTabActiva("partidos"),
                    },
                    {
                      key: "inicial",
                      emoji: "🏆",
                      label: "Predicciones Torneo",
                      desc: "Campeón, finalistas y clasificados",
                      color: "#f5b000",
                      onClick: () => setTabActiva("inicial"),
                    },
                    {
                      key: "mis_pronosticos",
                      emoji: "📋",
                      label: "Tabla de Pronósticos",
                      desc: "Pronosticos Globales",
                      color: "#6366f1",
                      onClick: () => {
                        setTabActiva("mis_pronosticos");
                        cargarConsolidados(usuario.id);
                      },
                    },
                    {
                      key: "aplazados",
                      emoji: "⏳",
                      label: "Partidos Aplazados",
                      desc: "Partidos pospuestos",
                      color: "#f59e0b",
                      onClick: () => setTabActiva("aplazados"),
                    },
                    {
                      key: "finalizados",
                      emoji: "🏁",
                      label: "Partidos Terminados",
                      desc: "Resultados ya jugados",
                      color: "#ef4444",
                      onClick: () => setTabActiva("finalizados"),
                    },
                    {
                      key: "posiciones",
                      emoji: "📊",
                      label: "Tabla de Posiciones",
                      desc: "Puntos acumulados",
                      color: "#38bdf8",
                      onClick: () => {
                        setTabActiva("posiciones");
                        cargarConsolidados(usuario.id);
                      },
                    },
                  ]).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={item.onClick}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px",
                        borderRadius: 14,
                        border: `1px solid ${item.color}40`,
                        background: `linear-gradient(135deg, ${item.color}22 0%, ${item.color}0d 100%)`,
                        color: "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateX(4px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px -8px ${item.color}90`;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <span
                        className="inicio-card-icon"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: `${item.color}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.3rem",
                          flexShrink: 0,
                        }}
                      >
                        {item.emoji}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <div className="inicio-card-label" style={{ fontWeight: 800, fontSize: "0.92rem", color: "#fff", lineHeight: 1.3 }}>
                          {item.label}
                        </div>
                        <div className="inicio-card-desc" style={{ fontSize: "0.74rem", color: "var(--graderia)", lineHeight: 1.3, marginTop: 2 }}>
                          {item.desc}
                        </div>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CONTENIDO PRINCIPAL: HERO DE BIENVENIDA */}
              <div
                className="card"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "linear-gradient(135deg, rgba(14, 26, 39, 0.95) 0%, rgba(19, 32, 48, 0.95) 50%, rgba(16, 42, 33, 0.95) 100%)",
                  border: "1px solid var(--cancha-borde)",
                  borderRadius: 16,
                  padding: "28px 28px",
                  textAlign: "center",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "#34d399", fontWeight: 800, marginBottom: 8 }}>
                  🔥 BIENVENIDO AL DESAFÍO, LIGA BETPLAY 2026 🔥
                </div>
                <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 900, color: "#ffffff", marginBottom: 12 }}>
                  ¿CREES QUE NADIE TE GANA? DEMUÉSTRALO
                </h1>
                <p style={{ maxWidth: 560, margin: "0 auto", color: "var(--graderia)", fontSize: "1rem", lineHeight: 1.6 }}>
                  ¡Hola, <strong style={{ color: "#fff" }}>{usuario.nombre}</strong>! Elige una opción del menú para ingresar tus pronósticos o revisar la tabla de posiciones en vivo.
                </p>

                {/* TU RENDIMIENTO: integrado en la misma tarjeta, compacto, sin caja separada */}
                {(() => {
                  const miFila = TABLA_POSICIONES_FIJA.find((f) => f.correo.toLowerCase() === (usuario.correo || "").toLowerCase());
                  if (!miFila) return null;
                  const desglose = [
                    { label: "Resultado Exacto", val: miFila.pts_resultado_exacto, color: "#34d399" },
                    { label: "Ganador Partido", val: miFila.pts_ganador_partido, color: "#38bdf8" },
                    { label: "Goleador Partido", val: miFila.pts_goleador_partido, color: "#f59e0b" },
                    { label: "Campeón", val: miFila.pts_campeon, color: "#f5b000" },
                    { label: "Finalistas", val: miFila.pts_finalistas, color: "#a78bfa" },
                    { label: "Clasificados", val: miFila.pts_clasificados, color: "#ef4444" },
                    { label: "Goleador Torneo", val: miFila.pts_goleador_torneo, color: "#6366f1" },
                  ];
                  const datosDona = desglose.filter((s) => s.val > 0);
                  const hayPuntos = datosDona.length > 0;

                  return (
                    <div style={{ width: "100%", marginTop: 20, paddingTop: 16, borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                        <h2 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 900, color: "#fff" }}>
                          📈 Tu Rendimiento
                        </h2>
                        <span style={{ fontSize: "0.7rem", color: "var(--graderia)" }}>· tabla oficial verificada</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 14, flexWrap: "wrap" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#38bdf8" }}>#{miFila.posicion}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--graderia)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Posición</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#34d399" }}>{miFila.pts_total}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--graderia)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Puntos</div>
                        </div>
                      </div>

                      {!hayPuntos ? (
                        <div style={{ textAlign: "center", padding: "12px 0", color: "var(--graderia)", fontSize: "0.82rem" }}>
                          Todavía no tienes puntos registrados. En cuanto se liquide tu primer partido, aquí verás tu gráfico.
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "center", textAlign: "left" }}>
                          {/* DONA: distribución de puntos por categoría */}
                          <div style={{ flex: "0 0 140px", width: 140, height: 140 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={datosDona}
                                  dataKey="val"
                                  nameKey="label"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius="58%"
                                  outerRadius="90%"
                                  paddingAngle={3}
                                  strokeWidth={0}
                                  isAnimationActive={false}
                                >
                                  {datosDona.map((s) => (
                                    <Cell key={s.label} fill={s.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: "0.75rem" }}
                                  labelStyle={{ color: "#fff", fontWeight: 800 }}
                                  itemStyle={{ color: "#fff" }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          {/* BARRAS: comparación por categoría (incluye las que están en 0) */}
                          <div style={{ flex: "1 1 260px", minWidth: 240, height: 150 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={desglose} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                  type="category"
                                  dataKey="label"
                                  width={110}
                                  tick={{ fill: "var(--graderia)", fontSize: 10 }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Tooltip
                                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                                  contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: "0.75rem" }}
                                  labelStyle={{ color: "#fff", fontWeight: 800 }}
                                  itemStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="val" radius={[0, 6, 6, 0]} barSize={11} isAnimationActive={false}>
                                  {desglose.map((s) => (
                                    <Cell key={s.label} fill={s.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 1: PRONÓSTICOS DE PARTIDOS (FECHAS) */}
          {tabActiva === "partidos" && (
            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <h2>⚽ Pronósticos de Fecha {fechaParticipante}</h2>
                <p style={{ color: "var(--graderia)", margin: 0, fontSize: "0.85rem" }}>
                  Ingresa el <strong>Marcador Exacto (5 Pts)</strong>, el <strong>Equipo Ganador (3 Pts)</strong> y opcionalmente el <strong>Goleador del Partido (2 Pts)</strong>.
                </p>
              </div>

              {/* BOTONES DE NAVEGACIÓN RÁPIDA (Solo en Celular) */}
              <div className="solo-celular" style={{ display: "flex", flexWrap: "nowrap", gap: 6, marginBottom: 20, alignItems: "center", width: "100%" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setTabActiva("finalizados")}
                  style={{ flex: 1, whiteSpace: "nowrap", padding: "6px 2px", fontSize: "0.65rem", fontWeight: 700, background: "var(--tarjeta)", color: "var(--tiza)", border: "1px solid var(--borde)", borderRadius: 50, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}
                >
                  <span style={{ fontSize: "0.9rem" }}>🏁</span> FINALIZADOS
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setTabActiva("aplazados")}
                  style={{ flex: 1, whiteSpace: "nowrap", padding: "6px 2px", fontSize: "0.65rem", fontWeight: 700, background: "var(--tarjeta)", color: "var(--tiza)", border: "1px solid var(--borde)", borderRadius: 50, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}
                >
                  <span style={{ fontSize: "0.9rem" }}>⚠️</span> APLAZADOS
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setTabActiva("posiciones");
                    cargarConsolidados(usuario.id);
                  }}
                  style={{ flex: 1, whiteSpace: "nowrap", padding: "6px 2px", fontSize: "0.65rem", fontWeight: 700, background: "var(--tarjeta)", color: "var(--tiza)", border: "1px solid var(--borde)", borderRadius: 50, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}
                >
                  <span style={{ fontSize: "0.9rem" }}>📊</span> POSICIONES
                </button>
              </div>

              {cargandoMaestros ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--graderia)" }}>
                  <button className="btn btn-primary" onClick={cargarMaestros} style={{ padding: "10px 18px" }}>
                    🔄 Cargar Partidos Ahora
                  </button>
                </div>
              ) : (
                (() => {
                  const estaSoloFinal = (partido: any) => {
                    const esFinalizado = esPartidoFinalizadoReal(partido, partidosEnVivo);
                    const hace2Horas = new Date().getTime() >= new Date(partido.fecha_hora_partido).getTime() + 2 * 60 * 60 * 1000;
                    return esFinalizado || hace2Horas;
                  };

                  // Excluir partidos aplazados de la lista general (tienen su propio botón/pestaña "⚠️ Aplazados")
                  const partidosFiltradosParticipante = partidos.filter((p) => p.jornada === fechaParticipante && p.estado !== "aplazado");

                  const partidosActivos = partidosFiltradosParticipante
                    .filter((p) => !estaSoloFinal(p))
                    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {/* PARTIDOS ACTIVOS EN PROGRAMACIÓN */}
                      {partidosActivos.length > 0 ? (
                        partidosActivos.map((partido) => renderPartidoCard(partido))
                      ) : (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--graderia)", border: "1px dashed var(--linea-fuerte)", borderRadius: 12 }}>
                          No hay partidos pendientes por jugar en esta fecha.
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* TAB: PARTIDOS FINALIZADOS */}
          {tabActiva === "finalizados" && (
            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <h2>🏁 Partidos Finalizados (Orden Cronológico)</h2>
                <p style={{ color: "var(--graderia)", margin: 0, fontSize: "0.85rem" }}>
                  Aquí puedes ver el historial de los partidos que ya han finalizado en la fecha actual.
                </p>
              </div>

              {cargandoMaestros ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--graderia)" }}>
                  <button className="btn btn-primary" onClick={cargarMaestros} style={{ padding: "10px 18px" }}>
                    🔄 Cargar Partidos Ahora
                  </button>
                </div>
              ) : (
                (() => {
                  const estaSoloFinal = (partido: any) => {
                    const esFinalizado = esPartidoFinalizadoReal(partido, partidosEnVivo);
                    const hace2Horas = new Date().getTime() >= new Date(partido.fecha_hora_partido).getTime() + 2 * 60 * 60 * 1000;
                    return esFinalizado || hace2Horas;
                  };

                  const partidosFiltradosParticipante = partidos.filter((p) => p.jornada === fechaParticipante && p.estado !== "aplazado");
                  const partidosFinalizados = partidosFiltradosParticipante
                    .filter((p) => estaSoloFinal(p))
                    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {partidosFinalizados.length > 0 ? (
                        partidosFinalizados.map((partido) => renderPartidoCard(partido))
                      ) : (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--graderia)", border: "1px dashed var(--linea-fuerte)", borderRadius: 12 }}>
                          Todavía no hay partidos finalizados en esta fecha.
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* TAB: PARTIDOS APLAZADOS DEDICADO */}
          {tabActiva === "aplazados" && (
            <div>
              <div
                className="card"
                style={{
                  marginBottom: 20,
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(120, 53, 15, 0.2) 100%)",
                  border: "2px solid #f59e0b",
                  boxShadow: "0 4px 20px rgba(245, 158, 11, 0.15)",
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <h2 style={{ margin: 0, color: "#fef08a", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>⚠️</span> Partidos Aplazados y Reprogramados
                  </h2>
                  <span style={{ fontSize: "0.8rem", background: "rgba(245, 158, 11, 0.3)", color: "#fef08a", padding: "4px 12px", borderRadius: 12, fontWeight: 800 }}>
                    Dimayor 2026
                  </span>
                </div>
                <p style={{ color: "#fef3c7", margin: 0, fontSize: "0.88rem", lineHeight: 1.5 }}>
                  Partidos reprogramados (incluye Deportivo Pereira vs Independiente Santa Fe, Boyacá Chicó vs Atlético Nacional y Cúcuta Deportivo vs Internacional). Puedes ingresar o modificar tus pronósticos hasta <strong>30 minutos antes</strong> de su nuevo horario de inicio.
                </p>
              </div>

              {cargandoMaestros ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--graderia)" }}>
                  Cargando partidos aplazados...
                </div>
              ) : (
                (() => {
                  const partidosAplazados = partidos.filter((p) => p.estado === "aplazado");
                  if (partidosAplazados.length === 0) {
                    return (
                      <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--graderia)" }}>
                        No hay partidos aplazados registrados actualmente.
                      </div>
                    );
                  }
                  const partidosPorJornada = partidosAplazados.reduce((acc, partido) => {
                    if (!acc[partido.jornada]) acc[partido.jornada] = [];
                    acc[partido.jornada].push(partido);
                    return acc;
                  }, {} as Record<number, typeof partidosAplazados>);

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {Object.keys(partidosPorJornada)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((jornadaStr) => {
                          const jornada = Number(jornadaStr);
                          const partidosDeLaJornada = partidosPorJornada[jornada];
                          return (
                            <details
                              key={`aplazados-jornada-${jornada}`}
                              style={{
                                background: "var(--bg-card)",
                                borderRadius: 12,
                                border: "1px solid var(--cancha-borde)",
                                overflow: "hidden",
                              }}
                              open
                            >
                              <summary
                                style={{
                                  padding: "16px 20px",
                                  cursor: "pointer",
                                  background: "linear-gradient(90deg, rgba(16, 42, 33, 0.8) 0%, rgba(13, 27, 42, 0.8) 100%)",
                                  color: "var(--texto-principal)",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  listStyle: "none",
                                  fontWeight: 800,
                                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                                }}
                              >
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  📅 Fecha {jornada}
                                </span>
                                <span style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 12, color: "var(--graderia)" }}>
                                  {partidosDeLaJornada.length} {partidosDeLaJornada.length === 1 ? "Partido" : "Partidos"}
                                </span>
                              </summary>
                              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, background: "rgba(0,0,0,0.15)" }}>
                                {partidosDeLaJornada.map((partido) => renderPartidoCard(partido))}
                              </div>
                            </details>
                          );
                        })}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* TAB 2: PREDICCIÓN INICIAL & SISTEMA DE PUNTUACIÓN */}
          {tabActiva === "inicial" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* SISTEMA DE PUNTUACIÓN BANNER OFICIAL */}
              <div
                className="card"
                style={{
                  background: "linear-gradient(135deg, rgba(16, 42, 33, 0.9) 0%, rgba(13, 27, 42, 0.9) 100%)",
                  border: "1px solid var(--cancha-borde)",
                  padding: "24px",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <span
                    className="badge badge-cancha"
                    style={{ fontSize: "0.85rem", textTransform: "uppercase", marginBottom: 8 }}
                  >
                    ⭐ Sistema Oficial de Puntuación
                  </span>
                  <h2 style={{ fontSize: "1.4rem", margin: "4px 0 0 0", color: "#ffffff" }}>
                    Acumula puntos durante todo el torneo
                  </h2>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 215, 0, 0.3)",
                      borderRadius: 12,
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 4 }}>🏆</div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#ffffff" }}>Campeón del Torneo</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--cancha)", marginTop: 6 }}>
                      30 <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>PTS</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(77, 163, 255, 0.3)",
                      borderRadius: 12,
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 4 }}>🥇</div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#ffffff" }}>Finalistas</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--graderia)" }}>(por equipo acertado)</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--cancha)", marginTop: 2 }}>
                      25 <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>PTS</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(0, 230, 153, 0.3)",
                      borderRadius: 12,
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 4 }}>👥</div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#ffffff" }}>Clasificados Cuadrangulares</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--graderia)" }}>(por equipo acertado)</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--cancha)", marginTop: 2 }}>
                      20 <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>PTS</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 92, 92, 0.3)",
                      borderRadius: 12,
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 4 }}>👟</div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#ffffff" }}>Goleador del Torneo</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--cancha)", marginTop: 6 }}>
                      15 <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>PTS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTROLES DE PREDICCIÓN TORNEO */}
              {/* BLOQUE 1: CAMPEÓN Y FINALISTAS */}
              <div className="card">
                <div className="card-header">
                  <h2 style={{ color: "#ffffff" }}>🏆 1. Campeón y Finalistas (30 Pts Campeón / 25 Pts Finalista)</h2>
                  <p style={{ color: "var(--graderia)", margin: 0, fontSize: "0.85rem" }}>
                    Selecciona al equipo campeón y a los 2 finalistas oficiales del campeonato.
                  </p>
                </div>

                <div className="grid-iniciales" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: "#f5b000" }}>
                      🥇 Equipo Campeón (30 Pts)
                    </label>
                    <select
                      className="input"
                      value={campeonId}
                      onChange={(e) => setCampeonId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">-- Seleccionar Campeón --</option>
                      {equipos.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: "#cbd5e1" }}>
                      🥈 Finalista 1 (25 Pts)
                    </label>
                    <select
                      className="input"
                      value={finalista1Id}
                      onChange={(e) => setFinalista1Id(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">-- Seleccionar Finalista --</option>
                      {equipos.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: "#cbd5e1" }}>
                      🥈 Finalista 2 (25 Pts)
                    </label>
                    <select
                      className="input"
                      value={finalista2Id}
                      onChange={(e) => setFinalista2Id(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">-- Seleccionar Finalista --</option>
                      {equipos.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOQUE 2: GOLEADOR DEL TORNEO */}
              <div className="card">
                <div className="card-header">
                  <h2 style={{ color: "#ffffff" }}>👟 2. Goleador del Torneo (15 Pts)</h2>
                  <p style={{ color: "var(--graderia)", margin: 0, fontSize: "0.85rem" }}>
                    Selecciona al jugador que terminará como máximo anotador del campeonato.
                  </p>
                </div>

                <div style={{ maxWidth: 450 }}>
                  <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: "var(--cancha)" }}>
                    ⚽ Máximo Goleador Predicho
                  </label>
                  <select
                    className="input"
                    value={goleadorTorneoId}
                    onChange={(e) => setGoleadorTorneoId(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">-- Seleccionar Goleador del Torneo --</option>
                    {Object.entries(
                      jugadores.reduce((acc: { [key: string]: Jugador[] }, j) => {
                        const eq = j.equipo?.nombre || "Otros / Sin Equipo";
                        if (!acc[eq]) acc[eq] = [];
                        acc[eq].push(j);
                        return acc;
                      }, {})
                    ).map(([equipoNombre, jugList]) => (
                      <optgroup key={equipoNombre} label={equipoNombre}>
                        {jugList.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.nombre}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* BLOQUE 3: 8 CLASIFICADOS A CUADRANGULARES */}
              <div className="card">
                <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h2 style={{ color: "#ffffff" }}>⚡ 3. Equipos Clasificados a Cuadrangulares (20 Pts c/u)</h2>
                    <p style={{ color: "var(--graderia)", margin: 0, fontSize: "0.85rem" }}>
                      Selecciona los 8 equipos que avanzarán a fase semifinal.
                    </p>
                  </div>
                  <span className={`badge ${clasificadosIds.length === 8 ? "badge-cancha" : "badge-trofeo"}`}>
                    {clasificadosIds.length} / 8 Seleccionados
                  </span>
                </div>

                <div className="grid-clasificados" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 16 }}>
                  {equipos.map((eq) => {
                    const seleccionado = clasificadosIds.includes(eq.id);
                    return (
                      <div
                        key={eq.id}
                        className={`item-clasificado ${seleccionado ? "selected" : ""}`}
                        onClick={() => toggleClasificado(eq.id)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          border: `1px solid ${seleccionado ? "var(--cancha)" : "var(--linea)"}`,
                          background: seleccionado ? "var(--cancha-suave)" : "var(--noche-2)",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        <img
                          src={eq.escudo_url || "https://placehold.co/30x30/1e3145/ffffff?text=FPC"}
                          alt={eq.nombre}
                          style={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }}
                        />
                        <span style={{ flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {eq.nombre}
                        </span>
                        {seleccionado && <span style={{ color: "var(--cancha)", fontWeight: 900 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTÓN GUARDAR PREDICCIONES DEL TORNEO (PARTICIPANTE) */}
              <div style={{ marginTop: 8, marginBottom: 16, textAlign: "center" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGuardarPrediccionInicial}
                  disabled={guardandoInicial}
                  style={{
                    padding: "16px 36px",
                    fontSize: "1.15rem",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    color: "#ffffff",
                    border: "2px solid #34d399",
                    borderRadius: 14,
                    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                    cursor: guardandoInicial ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {guardandoInicial ? (
                    <>
                      <RefreshCw className="spin" size={22} /> Guardando Predicciones...
                    </>
                  ) : (
                    <>
                      <Save size={22} /> 💾 Guardar Predicciones del Torneo
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MIS PRONÓSTICOS & TABLA DE PRONÓSTICOS PÚBLICOS */}
          {tabActiva === "mis_pronosticos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* RESUMEN DE MIS PRONÓSTICOS REGISTRADOS */}
              <div className="card" style={{ background: "linear-gradient(135deg, #0b1e36 0%, #17375e 100%)", border: "1px solid #1e3a8a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <List size={28} style={{ color: "#38bdf8" }} />
                  <div>
                    <h2 style={{ margin: 0, color: "#ffffff", fontSize: "1.3rem" }}>Mis Pronósticos Registrados</h2>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      Resumen personal de tus selecciones guardadas para la Polla BetPlay.
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                  <div style={{ background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: "0.75rem", color: "#f5b000", fontWeight: 700 }}>🏆 Campeón:</div>
                    <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.95rem" }}>
                      {equipos.find((e) => e.id === Number(campeonId))?.nombre || "Sin definir"}
                    </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: "0.75rem", color: "#cbd5e1", fontWeight: 700 }}>🥈 Finalistas:</div>
                    <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.95rem" }}>
                      {[
                        equipos.find((e) => e.id === Number(finalista1Id))?.nombre,
                        equipos.find((e) => e.id === Number(finalista2Id))?.nombre,
                      ].filter(Boolean).join(" y ") || "Sin definir"}
                    </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 700 }}>👟 Goleador Torneo:</div>
                    <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.95rem" }}>
                      {jugadores.find((j) => j.id === Number(goleadorTorneoId))?.nombre || "Sin definir"}
                    </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 700 }}>⚡ Clasificados (8):</div>
                    <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.85rem" }}>
                      {clasificadosIds.map((id) => equipos.find((e) => e.id === id)?.nombre).filter(Boolean).join(", ") || "Sin seleccionar"}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN PRONÓSTICOS PÚBLICOS DE TODOS LOS PARTICIPANTES */}
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <Eye size={24} style={{ color: "#34d399" }} />
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Tabla de Pronósticos</h2>
                    <p style={{ color: "var(--graderia)", margin: 0, fontSize: "0.85rem" }}>
                      Los pronósticos de todos los participantes se liberan públicamente <strong>30 MINUTOS ANTES</strong> del inicio de cada partido.
                    </p>
                  </div>
                </div>

                {(() => {
                  const esPartidoCerrado = (partido: any) => {
                    const esFinalizado = esPartidoFinalizadoReal(partido, partidosEnVivo);
                    const horaCierre = new Date(new Date(partido.fecha_hora_partido).getTime() - 30 * 60 * 1000);
                    return esFinalizado || (new Date() >= horaCierre);
                  };

                  const partidosPublicosFiltrados = partidos.filter((p) => p.jornada === fechaParticipante || p.estado === "aplazado");

                  const partidosActivosPublicos = partidosPublicosFiltrados
                    .filter((p) => !esPartidoCerrado(p))
                    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());

                  const partidosCerradosPublicos = partidosPublicosFiltrados
                    .filter((p) => esPartidoCerrado(p))
                    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());

                  const renderTablaPronosticoPartido = (partido: any) => {
                    const horaCierre = new Date(new Date(partido.fecha_hora_partido).getTime() - 30 * 60 * 1000);
                    const estaCerrado = new Date() >= horaCierre || usuario?.rol_id === 2;

                    const pronosticosDeEstePartido = consolidados?.prediccionesPartidos?.filter(
                      (p: any) => p.partido_id === partido.id
                    ) || [];

                    const estaDesplegadoTabla = pronosticosTablasDesplegadas[partido.id] ?? false;

                    return (
                      <div
                        key={partido.id}
                        style={{
                          marginBottom: 16,
                          border: "1px solid var(--linea)",
                          borderRadius: 10,
                          padding: 16,
                          background: "var(--noche-2)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: estaDesplegadoTabla ? 12 : 0, flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <strong style={{ fontSize: "1rem", color: "#ffffff" }}>
                              ⚽ {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
                            </strong>
                            <span style={{ fontSize: "0.72rem", color: "var(--graderia)", fontWeight: 700 }}>
                              🕒 {formatearFechaPartido(partido.fecha_hora_partido)} · {formatearHoraPartido(partido.fecha_hora_partido)}
                              {partido.estadio ? ` · 🏟️ ${partido.estadio}` : ""}
                            </span>
                            {estaCerrado && pronosticosDeEstePartido.length > 0 && (
                              <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700 }}>
                                👥 {pronosticosDeEstePartido.length} Pronóstico{pronosticosDeEstePartido.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <RelojCuentaRegresiva fechaHoraPartido={partido.fecha_hora_partido} estado={partido.estado} />

                            <button
                              type="button"
                              onClick={() => setPronosticosTablasDesplegadas(prev => ({ ...prev, [partido.id]: !estaDesplegadoTabla }))}
                              style={{
                                background: estaDesplegadoTabla ? "rgba(56, 189, 248, 0.25)" : "rgba(255, 255, 255, 0.08)",
                                border: estaDesplegadoTabla ? "1px solid #38bdf8" : "1px solid var(--linea)",
                                color: estaDesplegadoTabla ? "#38bdf8" : "#ffffff",
                                padding: "6px 14px",
                                borderRadius: 8,
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "all 0.15s ease",
                              }}
                            >
                              <span>{estaDesplegadoTabla ? "▲ Cerrar Pronósticos" : "▼ Ver Pronósticos"}</span>
                            </button>
                          </div>
                        </div>

                        {estaDesplegadoTabla && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--linea)" }}>
                            {estaCerrado ? (
                              pronosticosDeEstePartido.length > 0 ? (
                                <div style={{ overflowX: "auto" }}>
                                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                                    <thead>
                                      <tr style={{ borderBottom: "1px solid var(--linea)", color: "var(--graderia)" }}>
                                        <th style={{ padding: "8px" }}>Participante</th>
                                        <th style={{ padding: "8px", textAlign: "center" }}>Marcador Exacto</th>
                                        <th style={{ padding: "8px", textAlign: "center" }}>Ganador Predicho</th>
                                        <th style={{ padding: "8px" }}>Goleador Predicho</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {pronosticosDeEstePartido.map((p: any) => (
                                        <tr key={p.id} style={{ borderBottom: "1px dashed rgba(255,255,255,0.1)" }}>
                                          <td style={{ padding: "8px", fontWeight: 700, color: "#ffffff" }}>
                                            {p.usuario?.nombre_completo || "Participante"}
                                          </td>
                                          <td style={{ padding: "8px", textAlign: "center", fontWeight: 800, color: "var(--cancha)" }}>
                                            {p.goles_local_predicho} - {p.goles_visitante_predicho}
                                          </td>
                                          <td style={{ padding: "8px", textAlign: "center" }}>
                                            {(() => {
                                              const gL = Number(p.goles_local_predicho);
                                              const gV = Number(p.goles_visitante_predicho);
                                              let ganadorTexto = "Empate";
                                              if (!isNaN(gL) && !isNaN(gV)) {
                                                if (gL > gV) {
                                                  ganadorTexto = `Gana ${partido.equipo_local.nombre}`;
                                                } else if (gV > gL) {
                                                  ganadorTexto = `Gana ${partido.equipo_visitante.nombre}`;
                                                }
                                              }
                                              return (
                                                <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 800 }}>
                                                  {ganadorTexto}
                                                </span>
                                              );
                                            })()}
                                          </td>
                                          <td style={{ padding: "8px", color: "var(--graderia)" }}>
                                            {obtenerNombreGoleador(p)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div style={{ fontSize: "0.85rem", color: "var(--graderia)", fontStyle: "italic", textAlign: "center", padding: 12 }}>
                                  Sin pronósticos registrados para este partido.
                                </div>
                              )
                            ) : (
                              <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8, textAlign: "center", color: "#fbbf24", fontSize: "0.85rem", fontWeight: 600 }}>
                                🔒 Los pronósticos de todos los participantes permanecen ocultos hasta 30 minutos antes del partido.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {partidosActivosPublicos.map((partido) => renderTablaPronosticoPartido(partido))}

                      {partidosCerradosPublicos.length > 0 && (
                        <>
                          <div style={{ marginTop: 24, marginBottom: 8, borderTop: "2px dashed var(--linea)", paddingTop: 16 }}>
                            <h3 style={{ color: "#34d399", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                              🏁 Partidos Cerrados y Finalizados (Pronósticos Revelados)
                            </h3>
                          </div>
                          {partidosCerradosPublicos.map((partido) => renderTablaPronosticoPartido(partido))}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 4: POSICIONES & PUNTOS EN VIVO */}
          {tabActiva === "posiciones" && (
            <div>
              {/* TARJETA: LÍDER ACTUAL */}
              <div style={{ marginBottom: 24 }}>
                <div
                  className="card"
                  style={{
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    background: "linear-gradient(130deg, #1e1b4b 0%, #312e81 100%)",
                    border: "1px solid #4338ca",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "14px",
                      background: "rgba(245, 176, 0, 0.2)",
                      color: "#f5b000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Trophy size={26} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#c7d2fe", fontWeight: 600 }}>
                      👑 Líder Actual de la Polla
                    </div>
                    <strong style={{ fontSize: "1.1rem", color: "#ffd700", fontWeight: 900, display: "block" }}>
                      {TABLA_POSICIONES_FIJA[0]?.nombre_completo || "Cargando..."}
                    </strong>
                    {TABLA_POSICIONES_FIJA[0] && (
                      <span style={{ fontSize: "0.8rem", color: "#a5b4fc", fontWeight: 700 }}>
                        {TABLA_POSICIONES_FIJA[0]?.pts_total ?? 0} Pts acumulados
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AFICHE OFICIAL TABLA DE POSICIONES */}
              {cargandoConsolidados ? (
                <div className="card" style={{ textAlign: "center", padding: 50 }}>
                  <RefreshCw className="spin" size={36} style={{ color: "#38bdf8", marginBottom: 16 }} />
                  <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>Cargando Puntos en Vivo...</div>
                </div>
              ) : !consolidados ? (
                <div className="card" style={{ textAlign: "center", padding: 40 }}>
                  <p style={{ marginBottom: 16, color: "#94a3b8" }}>No se pudieron cargar las posiciones.</p>
                  <button className="btn btn-primary" onClick={() => cargarConsolidados(usuario.id)}>
                    🔄 Recargar Tabla
                  </button>
                </div>
              ) : (
                <TablaPosicionesAfiche
                  tabla={consolidados.tablaPosiciones || []}
                  prediccionesPartidos={consolidados.prediccionesPartidos || []}
                  prediccionesIniciales={consolidados.prediccionesIniciales || []}
                />
              )}
            </div>
          )}

          {/* TAB EN VIVO: PARTIDOS Y ESTADÍSTICAS EN VIVO (SOLO SAMUEL) */}
          {tabActiva === "en_vivo" && esSamuel && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                className="card"
                style={{
                  background: "linear-gradient(135deg, rgba(24, 15, 20, 0.95) 0%, rgba(35, 18, 25, 0.95) 100%)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: 16,
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 12px #ef4444" }} />
                      <h2 style={{ margin: 0, color: "#ffffff", fontSize: "1.3rem", fontWeight: 900 }}>
                        Partidos y Cancha 2D En Vivo
                      </h2>
                    </div>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.88rem" }}>
                      Liga BetPlay Colombia — Simulador visual de cancha 2D, marcadores y estadísticas en tiempo real.
                    </p>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={cargarPartidosEnVivo}
                    disabled={cargandoEnVivo}
                    style={{ padding: "8px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <RefreshCw size={14} className={cargandoEnVivo ? "spin" : ""} />
                    {cargandoEnVivo ? "Actualizando..." : "Actualizar Ahora"}
                  </button>
                </div>

                {cargandoEnVivo && partidosEnVivo.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 30 }}>
                    <RefreshCw className="spin" size={28} style={{ color: "#ef4444" }} />
                  </div>
                ) : partidosEnVivo.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 36, background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px dashed var(--linea)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>🏟️</div>
                    <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>No hay partidos en curso en este momento</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      Los marcadores y la Cancha 2D en vivo de la Liga BetPlay se activan automáticamente durante cada encuentro.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {partidosEnVivo.map((p) => {
                      const estaDesplegado = partidoDesplegadoId === p.eventId;
                      const subTab = subTabDetalle[p.eventId] || "cancha";

                      return (
                        <div
                          key={p.eventId}
                          style={{
                            background: "var(--tribuna)",
                            border: p.esEnVivo ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid var(--linea)",
                            borderRadius: 12,
                            padding: 18,
                            boxShadow: p.esEnVivo ? "0 4px 20px rgba(239, 68, 68, 0.15)" : "none",
                          }}
                        >
                          {/* ENCABEZADO PARTIDO */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: "0.82rem", color: "var(--graderia)", borderBottom: "1px dashed var(--linea)", paddingBottom: 8, flexWrap: "wrap", gap: 8 }}>
                            <span style={{ fontWeight: 700, color: "var(--cancha)" }}>
                              🏟️ {p.estadio}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {p.esEnVivo ? (
                                <span style={{ background: "rgba(220, 38, 38, 0.25)", color: "#ff4d4d", border: "1px solid rgba(239, 68, 68, 0.6)", padding: "4px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 0 10px rgba(239, 68, 68, 0.4)" }}>
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }} />
                                  🟢 EN VIVO {p.reloj}
                                </span>
                              ) : p.esFinalizado ? (
                                <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)", padding: "4px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 800 }}>
                                  ⚽ FINALIZADO
                                </span>
                              ) : (
                                <span style={{ background: "var(--noche-2)", color: "#ffffff", padding: "4px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 }}>
                                  📅 {p.estadoDetail}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* TABLERO DE MARCADOR */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, margin: "14px 0" }}>
                            {/* LOCAL */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, textAlign: "right" }}>
                              <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ffffff" }}>
                                {p.equipoLocal.nombre}
                              </span>
                              {p.equipoLocal.escudo && (
                                <img src={p.equipoLocal.escudo} alt={p.equipoLocal.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                              )}
                            </div>

                            {/* CAJA MARCADOR */}
                            <div style={{ background: "var(--noche-2)", padding: "8px 22px", borderRadius: 10, border: "1px solid var(--cancha-borde)", display: "flex", alignItems: "center", gap: 8, fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
                              <span>{p.equipoLocal.goles}</span>
                              <span style={{ color: "var(--graderia)", fontSize: "1.2rem" }}>:</span>
                              <span>{p.equipoVisitante.goles}</span>
                            </div>

                            {/* VISITANTE */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 10, textAlign: "left" }}>
                              {p.equipoVisitante.escudo && (
                                <img src={p.equipoVisitante.escudo} alt={p.equipoVisitante.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                              )}
                              <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ffffff" }}>
                                {p.equipoVisitante.nombre}
                              </span>
                            </div>
                          </div>

                          {/* BOTÓN DESPLEGABLE DE CANCHA Y ESTADÍSTICAS */}
                          <div style={{ marginTop: 14, textAlign: "center" }}>
                            <button
                              onClick={() => setPartidoDesplegadoId(estaDesplegado ? null : p.eventId)}
                              style={{
                                background: "rgba(255, 255, 255, 0.04)",
                                border: "1px solid var(--linea)",
                                color: "#38bdf8",
                                borderRadius: 8,
                                padding: "8px 16px",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span>🌱 Cancha 2D y Estadísticas</span>
                              <span>{estaDesplegado ? "▲" : "▼"}</span>
                            </button>
                          </div>

                          {/* CONTENIDO DESPLEGABLE */}
                          {estaDesplegado && (
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--linea)", background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 16 }}>
                              {/* SUB-TABS */}
                              <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center" }}>
                                <button
                                  onClick={() => setSubTabDetalle({ ...subTabDetalle, [p.eventId]: "cancha" })}
                                  style={{
                                    padding: "6px 14px",
                                    borderRadius: 6,
                                    border: "none",
                                    fontSize: "0.82rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    background: subTab === "cancha" ? "#10b981" : "rgba(255,255,255,0.08)",
                                    color: subTab === "cancha" ? "#ffffff" : "var(--graderia)",
                                  }}
                                >
                                  🌱 Cancha 2D En Vivo
                                </button>
                                <button
                                  onClick={() => setSubTabDetalle({ ...subTabDetalle, [p.eventId]: "stats" })}
                                  style={{
                                    padding: "6px 14px",
                                    borderRadius: 6,
                                    border: "none",
                                    fontSize: "0.82rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    background: subTab === "stats" ? "#38bdf8" : "rgba(255,255,255,0.08)",
                                    color: subTab === "stats" ? "#ffffff" : "var(--graderia)",
                                  }}
                                >
                                  📊 Estadísticas
                                </button>
                              </div>

                              {/* VISTA CANCHA 2D */}
                              {subTab === "cancha" && (
                                <Cancha2DVisualizador partido={p} />
                              )}

                              {/* VISTA ESTADÍSTICAS */}
                              {subTab === "stats" && (
                                <div>
                                  {p.estadisticas ? (
                                    <div style={{ maxWidth: 500, margin: "0 auto" }}>
                                      <BarraEstadistica label="Posesión de Balón" valLocal={p.estadisticas.posesionLocal} valVisitante={p.estadisticas.posesionVisitante} unit="%" />
                                      <BarraEstadistica label="Remates al Arco" valLocal={p.estadisticas.rematesArcoLocal} valVisitante={p.estadisticas.rematesArcoVisitante} />
                                      <BarraEstadistica label="Remates Totales" valLocal={p.estadisticas.rematesLocal} valVisitante={p.estadisticas.rematesVisitante} />
                                      <BarraEstadistica label="Tiros de Esquina" valLocal={p.estadisticas.cornersLocal} valVisitante={p.estadisticas.cornersVisitante} />
                                      <BarraEstadistica label="Faltas Cometidas" valLocal={p.estadisticas.faltasLocal} valVisitante={p.estadisticas.faltasVisitante} />
                                      <BarraEstadistica label="Tarjetas Amarillas" valLocal={p.estadisticas.amarillasLocal} valVisitante={p.estadisticas.amarillasVisitante} />
                                      <BarraEstadistica label="Tarjetas Rojas" valLocal={p.estadisticas.rojasLocal} valVisitante={p.estadisticas.rojasVisitante} />
                                    </div>
                                  ) : (
                                    <div style={{ textAlign: "center", color: "var(--graderia)", fontSize: "0.85rem", padding: 12 }}>
                                      Estadísticas detalladas aún no disponibles para este encuentro.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default function ExpressPage() {
  return (
    <GlobalErrorBoundary>
      <ExpressPageContent />
    </GlobalErrorBoundary>
  );
}
