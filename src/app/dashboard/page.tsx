"use client";

import React, { useState, useEffect, useMemo, useRef, Component } from "react";
import { CheckCircle2, ShieldAlert, Save, RefreshCw, Trophy, Calendar, LogOut, AlertTriangle, UserCheck, Lock, Clock, Eye, List, Download, Users, Menu, X, Flame, Camera, BarChart3, ClipboardCheck, Trash2, Hourglass, BrainCircuit, User, ArrowRight, ArrowLeft, ChevronRight, Home, ListChecks, CalendarClock, Crosshair, Radio, TrendingUp } from "lucide-react";
import Link from "next/link";
import { toPng } from 'html-to-image';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import TablaPosicionesAfiche from "../components/TablaPosicionesAfiche";
import PronosticosPartidoAfiche from "../components/PronosticosPartidoAfiche";
import PronosticosTorneoAfiche from "../components/PronosticosTorneoAfiche";
import TriviaModal from "../components/TriviaModal";
import CazadorDePuntosView from "../components/CazadorDePuntosView";
import HistorialPuntosModal from "../components/HistorialPuntosModal";
import MisResultadosView from "../components/MisResultadosView";
import PanelLiquidacionAutomatica from "../components/PanelLiquidacionAutomatica";
import PanelCorreosAutomaticos from "../components/PanelCorreosAutomaticos";
import AppTopBar from "../components/c90/AppTopBar";
import MiJornada from "../components/c90/MiJornada";
import Countdown from "../components/c90/Countdown";
import { MatchRow, MatchDayList } from "../components/c90/MatchRow";
import PredictionForm from "../components/c90/PredictionForm";
import Leaderboard from "../components/c90/Leaderboard";
import DateNavigator from "../components/c90/DateNavigator";
import EstadisticasView from "../components/c90/EstadisticasView";
import { Logotipo } from "../components/c90/Brand";
import { puntosProvisionales, textoProvisional, type Provisional } from "../components/c90/provisional";

// Nombre visible de cada pestaña en la barra "← Inicio"
const TITULOS_PESTANA: Record<string, string> = {
  partidos: "Pronósticos",
  inicial: "Predicciones del Torneo",
  aplazados: "Partidos Aplazados",
  finalizados: "Mis Resultados y Puntos",
  mis_pronosticos: "Mis Resultados y Puntos",
  posiciones: "Tabla de Posiciones",
  oraculo: "Cazador de Puntos",
  pronosticos_todos: "Pronósticos de Todos",
  en_vivo: "En Vivo",
  admin: "Panel de Administración",
  historial: "Historial",
  estadisticas: "Estadísticas",
};

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
  jornada_original?: number | null;
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

  let textoAccion = "JUGADA EN CURSO / DISPUTA EN CENTRO DE CAMPO";
  let colorAccion = "#438AFF";
  let posCalculada = { x: 50, y: 50 };

  if (incActual) {
    const txt = (incActual.texto || "").toLowerCase();
    const esLocal = incActual.equipo
      ? incActual.equipo.toLowerCase().includes(partido.equipoLocal.nombre.toLowerCase().split(" ")[0])
      : true;

    if (incActual.tipo === "gol" || txt.includes("goal") || txt.includes("gol")) {
      textoAccion = `¡GOOOOOOL! ${incActual.minuto || ""} ${incActual.texto || ""}`;
      colorAccion = "#74CC10";
      posCalculada = esLocal ? { x: 92, y: 50 } : { x: 8, y: 50 };
    } else if (txt.includes("shot") || txt.includes("remate") || txt.includes("tiro")) {
      textoAccion = `REMATE AL ARCO ${incActual.minuto || ""} - ${incActual.texto || ""}`;
      colorAccion = "#EA3D35";
      posCalculada = esLocal ? { x: 78, y: 40 } : { x: 22, y: 60 };
    } else if (txt.includes("corner") || txt.includes("esquina")) {
      textoAccion = `CÓRNER ${incActual.minuto || ""} - ${incActual.texto || ""}`;
      colorAccion = "#EFCC36";
      posCalculada = esLocal ? { x: 96, y: 12 } : { x: 4, y: 88 };
    } else if (txt.includes("foul") || txt.includes("falta") || incActual.tipo === "amarilla" || incActual.tipo === "roja") {
      textoAccion = `FALTA / TARJETA ${incActual.minuto || ""} - ${incActual.texto || ""}`;
      colorAccion = "#EFCC36";
      posCalculada = esLocal ? { x: 42, y: 35 } : { x: 58, y: 65 };
    } else if (incActual.tipo === "cambio" || txt.includes("sustitucion") || txt.includes("cambio")) {
      textoAccion = `CAMBIO ${incActual.minuto || ""} - ${incActual.texto || ""}`;
      colorAccion = "#438AFF";
      posCalculada = { x: 50, y: 90 };
    } else {
      textoAccion = `${incActual.minuto || ""} ${incActual.texto || "Jugada en vivo"}`;
      posCalculada = esLocal ? { x: 65, y: 45 } : { x: 35, y: 55 };
    }
  }

  const finalX = Math.min(94, Math.max(6, posCalculada.x));
  const finalY = Math.min(88, Math.max(12, posCalculada.y));

  return (
    <div style={{ background: "#04060A", borderRadius: 14, padding: 16, border: "1px solid #74CC10", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#74CC10", display: "flex", alignItems: "center", gap: 6 }}>
          CANCHA 2D EN VIVO (JUGADAS REALES DE ESPN)
        </span>
        <span style={{ background: "rgba(4, 6, 10, 0.7)", color: colorAccion, border: `1px solid ${colorAccion}`, padding: "4px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 900, boxShadow: "none", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {textoAccion}
        </span>
      </div>

      <div style={{ position: "relative", width: "100%", height: 190, background: "#1A1F26", borderRadius: 10, border: "1px solid rgba(116, 204, 16, 0.45)", boxShadow: "none"}}>
        <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="4 2" />
          <circle cx="50%" cy="50%" r="35" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <circle cx="50%" cy="50%" r="3" fill="rgba(255,255,255,0.9)" />

          <rect x="0" y="25%" width="16%" height="50%" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <rect x="0" y="38%" width="6%" height="24%" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />

          <rect x="84%" y="25%" width="16%" height="50%" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <rect x="94%" y="38%" width="6%" height="24%" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        </svg>

        <div style={{ position: "absolute", left: 12, top: 12, fontWeight: 900, color: "#FFFFFF", fontSize: "0.85rem", textShadow: "none"}}>
          {partido.equipoLocal.nombre}
        </div>
        <div style={{ position: "absolute", right: 12, top: 12, fontWeight: 900, color: "#FFFFFF", fontSize: "0.85rem", textShadow: "none"}}>
          {partido.equipoVisitante.nombre}
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
          <div style={{ fontSize: "1.6rem", filter: "none" }}>
            
          </div>
        </div>
      </div>

      {/* FEED DE JUGADAS DEL PARTIDO EN VIVO (ESPN) */}
      <div style={{ marginTop: 12, background: "rgba(4, 6, 10, 0.4)", borderRadius: 10, padding: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span>JUGADAS DEL PARTIDO EN DIRECTO (TOCA CUALQUIERA PARA MOVER EL BALÓN)</span>
          {incidenciaSeleccionada && (
            <span
              onClick={() => setIncidenciaSeleccionada(null)}
              style={{ color: "#438AFF", cursor: "pointer", textDecoration: "underline" }}
            >
              Volver al vivo
            </span>
          )}
        </div>

        {incidencias.length === 0 ? (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: 8 }}>
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
                    background: esActiva ? "rgba(67, 138, 255, 0.2)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${esActiva ? "#438AFF" : "transparent"}`,
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontWeight: 900, color: "#EFCC36", minWidth: 32 }}>
                    {item.minuto || "0'"}
                  </span>
                  <span style={{ flex: 1, color: esActiva ? "#FFFFFF" : "#E5E7EB", fontWeight: esActiva ? 800 : 500 }}>
                    {item.texto || item.tipo}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: 4, color: "#FFFFFF" }}>
        <span style={{ color: "#74CC10" }}>{valLocal}{unit}</span>
        <span style={{ color: "#E5E7EB", fontSize: "0.78rem" }}>{label}</span>
        <span style={{ color: "#438AFF" }}>{valVisitante}{unit}</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${pctL}%`, background: "#74CC10", transition: "width 0.5s ease" }} />
        <div style={{ flex: 1, background: "#438AFF", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

// Reloj de cierre: ver components/c90/Countdown.tsx (mismos cortes de estado).
const RelojCuentaRegresiva = Countdown;

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
  if (esSuspendido) return <span className="badge badge-warn">Suspendido</span>;
  return (
    <span className="badge badge-live" title="Marcador en vivo (ESPN)">
      {live.equipoLocal.goles} – {live.equipoVisitante.goles}
      <span style={{ opacity: 0.8 }}>{live.reloj || live.estadoDetail || "En vivo"}</span>
    </span>
  );
}

const NOTICIAS_ROTATIVAS = [
  "¡Bienvenido al Club 90 Minutos! ",
  "La tabla está que arde. ¡No te quedes atrás!",
  "Si apostaste por un empate 0-0, te gusta el peligro. ",
];

function NoticiasTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % NOTICIAS_ROTATIVAS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 600, height: 50, overflow: "hidden" }}>
      {NOTICIAS_ROTATIVAS.map((noticia, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontSize: "0.95rem",
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            transition: "all 0.5s ease",
            opacity: i === index ? 1 : 0,
            transform: i === index ? "translateY(0)" : "translateY(20px)",
            pointerEvents: i === index ? "auto" : "none",
          }}
        >
          {noticia}
        </div>
      ))}
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
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#FFFFFF", background: "#1A1F26", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}></div>
          <h2 style={{ color: "#438AFF", marginBottom: 8 }}>Actualización del Sistema en Curso</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 500, margin: "0 auto 20px", fontSize: "0.92rem", lineHeight: 1.5 }}>
            Se han actualizado los datos de la polla. Haz clic abajo para sincronizar la aplicación.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const handleCerrarSesion = () => {
                sessionStorage.removeItem("polla_sesion");
                window.location.href = "/";
              };
              handleCerrarSesion();
            }}
            style={{ padding: "10px 24px", fontSize: "0.95rem", fontWeight: 800 }}
          >
            Sincronizar la app
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
  const [nombreInput, setNombreInput] = useState("");
  const [modoRegistro, setModoRegistro] = useState(false);
  const [aceptoDatos, setAceptoDatos] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
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
  const [tabActiva, setTabActiva] = useState<"inicio" | "partidos" | "aplazados" | "inicial" | "mis_pronosticos" | "admin" | "posiciones" | "en_vivo" | "finalizados" | "historial" | "oraculo" | "pronosticos_todos" | "estadisticas">("inicio");
  const [desgloseAbierto, setDesgloseAbierto] = useState<"exacto" | "ganador" | "goleador" | null>(null);
  const [mostrarTrivia, setMostrarTrivia] = useState(false);
  // Historial de puntos partido por partido (transparencia para el participante)
  const [mostrarHistorialPuntos, setMostrarHistorialPuntos] = useState(false);
  const [mostrarAficheRanking, setMostrarAficheRanking] = useState(false);
  const [menuInicioMovilAbierto, setMenuInicioMovilAbierto] = useState(false);
  const [partidoPronosticosAbierto, setPartidoPronosticosAbierto] = useState<number | null>(null);
  const mouseDownEnFondoRef = useRef(false);
  const [filtroPronosticosTodos, setFiltroPronosticosTodos] = useState<"todos" | "pendientes" | "finalizados">("todos");
  const [fechaPronosticosTodos, setFechaPronosticosTodos] = useState<number | null>(null);
  const [modalPrediccionAbierto, setModalPrediccionAbierto] = useState<"campeon" | "finalistas" | "clasificados" | "goleador" | null>(null);
  const [fechaFiltroAplazados, setFechaFiltroAplazados] = useState<string>("todas");
  const necesitaFullscreen = true;
  const [cronicaData, setCronicaData] = useState<{ titular: string; cuerpo_noticia: string } | null>(null);
  const [cargandoCronica, setCargandoCronica] = useState(false);


  // Pantalla de Inicio del participante: también ocupa toda la pantalla (igual que el admin).
  useEffect(() => {
    const esInicioParticipante = usuario?.rol_id !== 2 && tabActiva === "inicio";
    document.body.classList.toggle("inicio-fullscreen", esInicioParticipante);
    return () => {
      document.body.classList.remove("inicio-fullscreen");
    };
  }, [usuario, tabActiva]);

  // Menú del sidebar en celular: colapsado por defecto cada vez que se vuelve a "inicio".
  useEffect(() => {
    if (tabActiva !== "inicio") {
      setMenuInicioMovilAbierto(false);
    }
  }, [tabActiva]);

  // Login y pantalla de Inicio: quedan estáticas (sin scroll de página); solo el
  // menú del sidebar puede desplazarse internamente si su contenido no cabe.
  useEffect(() => {
    const esInicioParticipante = usuario?.rol_id !== 2 && tabActiva === "inicio";
    const esLogin = !usuario;
    const bloquearScroll = esLogin;
    document.documentElement.classList.toggle("app-fullscreen-lock", bloquearScroll);
    document.body.classList.toggle("app-fullscreen-lock", bloquearScroll);
    document.body.classList.toggle("login-fullscreen", esLogin);
    return () => {
      document.documentElement.classList.remove("app-fullscreen-lock");
      document.body.classList.remove("app-fullscreen-lock");
      document.body.classList.remove("login-fullscreen");
    };
  }, [usuario, tabActiva]);

  // Volver a la pantalla de inicio desde cualquier pestaña (botón "Inicio" y logo)
  const irAInicio = () => {
    setTabActiva("inicio");
    setMenuInicioMovilAbierto(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    puntajes?: any[];
  } | null>(null);

  const liderObj = consolidados?.tablaPosiciones?.[0];
  const segundoObj = consolidados?.tablaPosiciones?.[1];
  const terceroObj = consolidados?.tablaPosiciones?.[2];

  const lider = liderObj?.nombre_completo ? liderObj.nombre_completo.split(" ")[0].toUpperCase() : "EL LÍDER";
  const segundo = segundoObj?.nombre_completo ? segundoObj.nombre_completo.split(" ")[0].toUpperCase() : "EL SEGUNDO";
  const tercero = terceroObj?.nombre_completo ? terceroObj.nombre_completo.split(" ")[0].toUpperCase() : "EL TERCERO";

  // Frases animadas para el Noticiero del banner superior
  const [frasesNoticiero, setFrasesNoticiero] = useState<string[]>([
    "NOTICIERO 90 MINUTOS: ¡BIENVENIDO AL JUEGO MÁS ADICTIVO DE TODO FUTBOLERO! "
  ]);

  useEffect(() => {
    // Si todavía está cargando los consolidados, no hacemos nada
    if (!consolidados) return;

    const chistesBase = [
      "NOTICIERO 90 MINUTOS: ¡BIENVENIDO AL JUEGO MÁS ADICTIVO DE TODO FUTBOLERO! ",
      `¡ATENCIÓN! ${lider} ESTÁ BIEN ARRIBA DANDO BATE, LOS TIENE A TODOS MAMANDO... CABLE. `,
      `OJO CON ${segundo} QUE LE ESTÁ SOPLANDO LA NUCA A ${lider}. ¡CUIDADO SE ENAMORAN! `,
      `${tercero} ESTÁ CALLADITO DE TERCERO ESPERANDO EL PAPAYAZO PA' METERLA... LA PREDICCIÓN. `
    ];

    if (consolidados.tablaPosiciones && consolidados.tablaPosiciones.length > 0) {
      // Mostrar primero los chistes base con los nombres reales
      setFrasesNoticiero(chistesBase);
    } else {
      // Si la tabla de posiciones está vacía
      setFrasesNoticiero([
        "NOTICIERO 90 MINUTOS: ¡BIENVENIDO A LA POLLA MÁS SABROSA DE COLOMBIA!",
        "AÚN NO HAY PUNTOS EN LA TABLA. ¡ES TU MOMENTO DE PICAR ADELANTE!",
        "¡PASA POR LA TRIVIA Y MIRA SI DE VERDAD SABES DE FÚTBOL O PURO CUENTO!"
      ]);
    }
  }, [consolidados, lider, segundo, tercero]);

  const [fraseIndice, setFraseIndice] = useState(0);

  const frasesRef = useRef(frasesNoticiero);
  useEffect(() => {
    frasesRef.current = frasesNoticiero;
  }, [frasesNoticiero]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const tick = () => {
      if (frasesRef.current.length > 1) {
        setFraseIndice((prev) => (prev + 1) % frasesRef.current.length);
      }
      timeoutId = setTimeout(tick, 5500);
    };
    timeoutId = setTimeout(tick, 5500);
    return () => clearTimeout(timeoutId);
  }, []);
  const [cargandoConsolidados, setCargandoConsolidados] = useState(false);
  const [partidoAdminVer, setPartidoAdminVer] = useState<number | null>(null);
  const [guardandoPartidoId, setGuardandoPartidoId] = useState<number | null>(null);
  const [partidoGuardadoExitoId, setPartidoGuardadoExitoId] = useState<number | null>(null);

  // Filtros por Jornada / Fecha
  const [fechaParticipante, setFechaParticipante] = useState<number>(3); // Auto-determinado por progreso de la polla
  const [fechaAdmin, setFechaAdmin] = useState<number>(0); // 0 indica que no se ha seteado aún
  const [seccionAdmin, setSeccionAdmin] = useState<"partidos" | "torneo">("partidos");
  const [seccionAdminPanel, setSeccionAdminPanel] = useState<"predicciones" | "predicciones_torneo" | "liquidacion" | "posiciones" | "aplazados" | "editar_partidos" | "jugadores">("predicciones");

  // Estado para creación de jugadores en Admin
  const [equipoJugadorSeleccionado, setEquipoJugadorSeleccionado] = useState<number | "">("");
  const [nombreNuevoJugador, setNombreNuevoJugador] = useState("");
  const [guardandoJugador, setGuardandoJugador] = useState(false);
  const [filtroEquipoJugadores, setFiltroEquipoJugadores] = useState<number | "">("");
  const [mostrarModalPlantilla, setMostrarModalPlantilla] = useState(false);
  const [equipoModalId, setEquipoModalId] = useState<number | "todas">("todas");

  const handleCrearJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoJugadorSeleccionado || !nombreNuevoJugador.trim()) {
      toast.error("Por favor selecciona un equipo e ingresa el nombre del jugador.");
      return;
    }

    const equipoObj = equipos.find((eq) => eq.id === Number(equipoJugadorSeleccionado));
    const nombreConfirmar = nombreNuevoJugador.trim();
    const equipoNombre = equipoObj ? equipoObj.nombre : "el equipo seleccionado";

    const confirmado = window.confirm(
      `VERIFICACIÓN DE ORTOGRAFÍA:\n\n¿Estás seguro de añadir el jugador "${nombreConfirmar}" a la plantilla de "${equipoNombre}"?\n\nPor favor revisa que el nombre esté bien escrito antes de guardar.`
    );

    if (!confirmado) return;

    setGuardandoJugador(true);
    const toastId = toast.loading("Añadiendo jugador a la plantilla...");
    try {
      const res = await fetch("/api/admin/crear-jugador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario?.id,
          nombre: nombreConfirmar,
          equipo_id: Number(equipoJugadorSeleccionado),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear jugador");

      toast.success(data.mensaje, { id: toastId });
      setNombreNuevoJugador("");
      await cargarMaestros();
    } catch (err: any) {
      toast.error(err.message || "Error al añadir jugador.", { id: toastId });
    } finally {
      setGuardandoJugador(false);
    }
  };

  const handleEliminarJugador = async (jugadorId: number, nombreJugador: string) => {
    const conf = window.confirm(`¿Estás seguro de ELIMINAR a "${nombreJugador}" de la plantilla?`);
    if (!conf) return;

    const toastId = toast.loading("Eliminando jugador...");
    try {
      const res = await fetch("/api/admin/eliminar-jugador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario?.id,
          jugador_id: jugadorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar jugador");

      toast.success(data.mensaje, { id: toastId });
      await cargarMaestros();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar jugador.", { id: toastId });
    }
  };

  // Calcular automáticamente la fecha activa para participantes (primera fecha no finalizada)
  useEffect(() => {
    if (partidos && partidos.length > 0) {
      const jornadas = Array.from(new Set(partidos.map((p) => p.jornada))).sort((a, b) => a - b);
      
      // Calcular ventanas de apertura/cierre por jornada basándose en cuándo juega
      // la MAYORÍA de sus partidos (ignorando partidos sueltos reprogramados a meses de distancia).
      const ahora = new Date().getTime();

      const cierresJornada: Record<number, number> = {};
      const aperturasJornada: Record<number, number> = {};
      jornadas.forEach(j => {
        // Solo partidos no-aplazados de la jornada
        const partidosJornada = partidos.filter(p => p.jornada === j && p.estado !== "aplazado");
        if (partidosJornada.length > 0) {
          // Encontrar el bloque principal: la ventana de 7 días que contiene más partidos
          const tiempos = partidosJornada.map(p => new Date(p.fecha_hora_partido).getTime()).sort((a, b) => a - b);
          let mejorInicio = tiempos[0];
          let mejorCount = 0;
          for (let i = 0; i < tiempos.length; i++) {
            const count = tiempos.filter(t => t >= tiempos[i] && t <= tiempos[i] + 7 * 24 * 60 * 60 * 1000).length;
            if (count > mejorCount) {
              mejorCount = count;
              mejorInicio = tiempos[i];
            }
          }
          const bloqueRegular = partidosJornada.filter(p => {
            const t = new Date(p.fecha_hora_partido).getTime();
            return t >= mejorInicio && t <= mejorInicio + 7 * 24 * 60 * 60 * 1000;
          });
          if (bloqueRegular.length > 0) {
            aperturasJornada[j] = Math.min(...bloqueRegular.map(p => new Date(p.fecha_hora_partido).getTime())) - (24 * 60 * 60 * 1000);
            const maxTime = Math.max(...bloqueRegular.map(p => new Date(p.fecha_hora_partido).getTime()));
            cierresJornada[j] = maxTime + (3 * 60 * 60 * 1000);
          }
        }
      });

      // 1) Buscar jornadas actualmente activas (ahora está entre apertura y cierre)
      const jornadasActivas = jornadas.filter(j => aperturasJornada[j] && cierresJornada[j] && ahora >= aperturasJornada[j] && ahora <= cierresJornada[j]);
      
      let jornadaActiva = 0;
      if (jornadasActivas.length > 0) {
        // Si hay varias activas simultáneamente, tomar la mayor (la más reciente)
        jornadaActiva = Math.max(...jornadasActivas);
      } else {
        // 2) Si ninguna está activa ahora, buscar la próxima que aún no cierra
        for (const j of jornadas) {
          if (cierresJornada[j] && ahora <= cierresJornada[j]) {
            jornadaActiva = j;
            break;
          }
        }
      }

      // 3) Fallback: si todas las ventanas ya pasaron, buscar la primera jornada no completamente liquidada
      if (jornadaActiva === 0) {
        for (const j of jornadas) {
          const partidosJ = partidos.filter(p => p.jornada === j && p.estado !== "aplazado");
          if (partidosJ.length > 0) {
            const liquidados = partidosJ.filter(p => p.resultado_oficial !== null || p.estado === "resultado_cargado" || p.estado === "puntaje_calculado");
            if (liquidados.length < partidosJ.length) {
              jornadaActiva = j;
              break;
            }
          }
        }
      }

      const fechaFinal = jornadaActiva > 0 ? jornadaActiva : (jornadas[jornadas.length - 1] || 1);
      setFechaParticipante(fechaFinal);
      setFechaAdmin((prev) => (prev === 0 ? fechaFinal : prev));
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
      setMensajeEstado({ tipo: "error", texto: "Inconsistencia: Ingresaste un marcador con goles pero dejaste goleador en 'Ninguno'. Si hay goles en el partido, es OBLIGATORIO elegir cuál jugador anotará gol." });
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
            ? "Ya cerró el plazo para este partido (30 min antes del inicio). No se guardó."
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
    const idParaUsar = uId || usuario?.id || (typeof window !== "undefined" && JSON.parse(sessionStorage.getItem("polla_sesion") || "{}")?.usuario?.id);
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

  // Auto-cálculo y carga automática de consolidados al cambiar a pestañas que los requieren
  useEffect(() => {
    if (["inicio", "posiciones", "pronosticos_todos", "mis_pronosticos", "admin", "estadisticas"].includes(tabActiva)) {
      if (!consolidados && !cargandoConsolidados) {
        const idUsar = usuario?.id || (typeof window !== "undefined" && JSON.parse(sessionStorage.getItem("polla_sesion") || "{}")?.usuario?.id);
        if (idUsar) {
          cargarConsolidados(idUsar);
        }
      }
    }
  }, [tabActiva, usuario?.id, consolidados, cargandoConsolidados]);

  // Marcadores oficiales por partido para Administrador
  const [resultadosAdminInput, setResultadosAdminInput] = useState<Record<number, { local: string; visitante: string; goleadores_ids: number[] }>>({});
  const [programacionAdminInput, setProgramacionAdminInput] = useState<Record<number, { jornada: string; fecha_hora: string; estadio: string }>>({});
  const [guardandoProgramacionId, setGuardandoProgramacionId] = useState<number | null>(null);
  const [programacionGuardadaId, setProgramacionGuardadaId] = useState<number | null>(null);
  const [reliquidandoTodo, setReliquidandoTodo] = useState(false);
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
          ? "Ya cerró el plazo de predicciones iniciales (Fecha 5 ya inició). No se guardó."
          : data.error || "Error al guardar predicciones del torneo.";
        setMensajeEstado({ tipo: "error", texto });
        if (typeof window !== "undefined") toast.error(texto);
      } else {
        setMensajeEstado({ tipo: "exito", texto: "¡Predicciones del torneo guardadas exitosamente!" });
        if (typeof window !== "undefined") toast.success("¡Tus predicciones del torneo han sido guardadas exitosamente!");
        sincronizarSesionBackend(usuario.correo, sesionToken);
      }
    } catch (err: any) {
      setMensajeEstado({ tipo: "error", texto: "Error al guardar: " + err.message });
      if (typeof window !== "undefined") toast.error(err.message);
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
      if (typeof window !== "undefined") {
        toast.success(data.mensaje || "¡Marcador guardado en pantalla!");
      }
      cargarMaestros();
      cargarConsolidados(usuario.id);
    } catch (err: any) {
      console.error(err);
      setMensajeEstado({ tipo: "error", texto: err.message || "Error al cargar marcador." });
      if (typeof window !== "undefined") {
        toast.error(err.message || "Error al cargar marcador.");
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
      if (typeof window !== "undefined") {
        toast.success(data.mensaje || "¡Resultado oficial publicado y puntos calculados!");
      }
      cargarMaestros();
      cargarConsolidados(usuario.id);
    } catch (err: any) {
      console.error(err);
      setMensajeEstado({ tipo: "error", texto: err.message || "Error al liquidar resultado." });
      if (typeof window !== "undefined") {
        toast.error(err.message || "Error al liquidar resultado.");
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
        toast.error(err.message || "Error al reprogramar el partido.");
      }
    } finally {
      setGuardandoProgramacionId(null);
    }
  };

  const handleToggleAplazado = async (partido: any) => {
    if (!usuario || usuario.rol_id !== 2) return;
    const nuevoEstado = partido.estado === "aplazado" ? "programado" : "aplazado";

    try {
      setGuardandoProgramacionId(partido.id);
      const payload: any = {
        usuario_id: usuario.id,
        partido_id: partido.id,
        estado: nuevoEstado,
      };

      const res = await fetch("/api/admin/reprogramar-partido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar el estado del partido");

      const fechaOrigen = partido.jornada_original || partido.jornada;
      const texto = nuevoEstado === "aplazado"
        ? "Partido marcado como aplazado."
        : `Partido reactivado (aparecerá automáticamente en la fecha activa para participantes y en la Fecha ${fechaOrigen} para administración).`;

      setMensajeEstado({ tipo: "exito", texto });
      if (nuevoEstado !== "aplazado" && typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.success(texto);
      }
      cargarMaestros();
    } catch (err: any) {
      console.error(err);
      if (typeof window !== "undefined") {
        toast.error(err.message || "Error al actualizar el estado del partido.");
      }
    } finally {
      setGuardandoProgramacionId(null);
    }
  };

  const handleQuitarResultado = async (partidoId: number) => {
    if (!usuario || usuario.rol_id !== 2) return;
    if (typeof window !== "undefined" && !window.confirm("Esto eliminará el marcador oficial, goleadores y TODOS los puntos ya liquidados de la tabla de posiciones. ¿Continuar?")) {
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
          toast.success(data.mensaje || "Resultado eliminado.");
        }
      cargarMaestros();
      cargarConsolidados(usuario.id);
    } catch (err: any) {
      console.error(err);
      setMensajeEstado({ tipo: "error", texto: err.message || "Error al quitar el resultado." });
      if (typeof window !== "undefined") {
        toast.error(err.message || "Error al quitar el resultado.");
      }
    }
  };

  const handleReliquidarTodo = async () => {
    if (!usuario || usuario.rol_id !== 2) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "ATENCIÓN: Esto borrará TODOS los puntos ya calculados y los recalculará desde cero para TODOS los partidos con resultado oficial cargado. Puede tardar unos segundos. ¿Continuar?"
      )
    ) {
      return;
    }
    try {
      setReliquidandoTodo(true);
      setMensajeEstado({ tipo: "info", texto: "Reliquidando todos los partidos, esto puede tardar unos segundos..." });
      const res = await fetch("/api/admin/reliquidar-todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: usuario.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al reliquidar todo");
      setMensajeEstado({ tipo: "exito", texto: data.mensaje || "Puntos reliquidados desde cero." });
      if (typeof window !== "undefined") {
        toast.success(data.mensaje || "Puntos reliquidados desde cero.");
      }
      cargarConsolidados(usuario.id);
    } catch (err: any) {
      console.error(err);
      setMensajeEstado({ tipo: "error", texto: err.message || "Error al reliquidar todo." });
      if (typeof window !== "undefined") {
        toast.error(err.message || "Error al reliquidar todo.");
      }
    } finally {
      setReliquidandoTodo(false);
    }
  };

  const handleGenerarCronica = async () => {
    if (!consolidados || !consolidados.tablaPosiciones || consolidados.tablaPosiciones.length === 0) {
      if (typeof window !== "undefined") {
        toast.error("La tabla de posiciones está vacía. No se puede generar crónica.");
      }
      return;
    }
    setCargandoCronica(true);
    try {
      const res = await fetch("/api/ai/cronica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tablaPosiciones: consolidados.tablaPosiciones }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar la crónica.");
      setCronicaData(data);
    } catch (err: any) {
      if (typeof window !== "undefined") {
        toast.error("La Inteligencia Artificial está saturada en este momento. Intenta de nuevo en unos segundos.");
      }
    } finally {
      setCargandoCronica(false);
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
        cargarConsolidados(usrNorm.id);
      } else {
        // El token dejó de ser válido (ej. la clave se reseteó en otro dispositivo): cerrar sesión local.
        setUsuario(null);
        setSesionToken(null);
        sessionStorage.removeItem("polla_sesion");
        setTabActiva("inicio");
        setPartidosDesplegados({});
        setPronosticosTablasDesplegadas({});
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
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
          if (usr.id) {
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

  // Borrar automáticamente los mensajes tras unos segundos (5s info/éxito, 8s error)
  useEffect(() => {
    if (mensajeEstado) {
      const delay = mensajeEstado.tipo === "error" ? 8000 : 5000;
      const timer = setTimeout(() => {
        setMensajeEstado(null);
      }, delay);
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
      setTabActiva("inicio");
      setPartidosDesplegados({});
      setPronosticosTablasDesplegadas({});
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", window.location.pathname);
      }

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

  const handleRegistro = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!nombreInput.trim() || !correoInput.trim() || !passwordInput.trim()) {
      setMensajeEstado({ tipo: "error", texto: "Por favor llena todos los campos para crear tu cuenta." });
      return;
    }

    if (!aceptoDatos || !aceptoTerminos) {
      setMensajeEstado({ tipo: "error", texto: "Debes aceptar el tratamiento de datos y los Términos y Condiciones para registrarte." });
      return;
    }

    setCargandoValidacion(true);
    setMensajeEstado(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_completo: nombreInput, correo: correoInput, password: passwordInput }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMensajeEstado({ tipo: "error", texto: data.error || "Error al crear la cuenta." });
        return;
      }

      // Registro exitoso, iniciar sesión automáticamente
      setMensajeEstado({ tipo: "exito", texto: "¡Cuenta creada exitosamente! Iniciando sesión..." });
      await handleValidarCorreo(); // Usamos la misma función de login que ya tiene el estado listo
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
        toast.error("Ya has seleccionado el máximo permitido de 8 clasificados.");
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
          return `Inconsistencia en ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}: Pusiste marcador de victoria local (${nL} - ${nV}), pero marcaste como ganador a "${nombreGanador}".`;
        }

        if (nV > nL && ganador !== "visitante") {
          const nombreGanador = ganador === "local" ? partido.equipo_local.nombre : "Empate";
          return `Inconsistencia en ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}: Pusiste marcador de victoria visitante (${nL} - ${nV}), pero marcaste como ganador a "${nombreGanador}".`;
        }

        if (nL === nV && ganador !== "empate") {
          const nombreGanador = ganador === "local" ? partido.equipo_local.nombre : partido.equipo_visitante.nombre;
          return `Inconsistencia en ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}: Pusiste marcador de empate (${nL} - ${nV}), pero seleccionaste como ganador a "${nombreGanador}".`;
        }

        if ((nL > 0 || nV > 0) && (!m.goleador_id || m.goleador_id === "")) {
          return `Inconsistencia en ${partido.equipo_local.nombre} vs ${partido.equipo_visitante.nombre}: Ingresaste marcador con goles (${nL} - ${nV}), por lo que debes seleccionar un goleador predicho. No puedes dejar "Ninguno" si hay goles.`;
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

  // Puntos provisionales "si termina así" para un partido en vivo con pronóstico guardado.
  const enVivoDe = (partido: any): { marcador: string; reloj: string; prov: Provisional | null } | null => {
    const live = buscarPartidoEnVivoESPN(partido, partidosEnVivo);
    if (!live || !live.esEnVivo || esPartidoFinalizadoReal(partido, partidosEnVivo)) return null;
    const m = marcadores[partido.id];
    let prov: Provisional | null = null;
    if (m && m.local !== "" && m.visitante !== "") {
      const jugadoresPartido = [...(partido.equipo_local?.jugadores || []), ...(partido.equipo_visitante?.jugadores || [])];
      const goleador = jugadoresPartido.find((j: any) => String(j.id) === String(m.goleador_id));
      prov = puntosProvisionales(
        { local: Number(m.local), visitante: Number(m.visitante), goleadorNombre: goleador?.nombre ?? null },
        { local: live.equipoLocal.goles, visitante: live.equipoVisitante.goles, goleadores: live.goleadores || [] }
      );
    }
    return { marcador: `${live.equipoLocal.goles} – ${live.equipoVisitante.goles}`, reloj: live.reloj || "En vivo", prov };
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
    const tienePronostico = m.local !== "" && m.visitante !== "";
    const jornadaOrigen = partido.jornada_original || partido.jornada;
    const enVivo = Boolean(liveMatch && liveMatch.esEnVivo && !esFinalizado);
    const vivo = enVivo ? enVivoDe(partido) : null;
    const marcadorFila =
      esFinalizado && partido.resultado_oficial
        ? `${partido.resultado_oficial.goles_local_real} – ${partido.resultado_oficial.goles_visitante_real}`
        : vivo
          ? vivo.marcador
          : null;

    return (
      <MatchRow
        key={partido.id}
        fechaHora={partido.fecha_hora_partido}
        local={partido.equipo_local}
        visitante={partido.equipo_visitante}
        marcador={marcadorFila}
        abierto={estaCardAbierta}
        onToggle={() => setPartidosDesplegados((prev) => ({ ...prev, [partido.id]: !estaCardAbierta }))}
        etiquetaAccion={estaCerrado ? "Ver" : "Pronosticar"}
        estado={
          <>
            {esAplazado ? (
              <span className="badge badge-warn">Aplazado</span>
            ) : jornadaOrigen < fechaParticipante ? (
              <span className="badge badge-info">Fecha {jornadaOrigen}</span>
            ) : jornadaOrigen > fechaParticipante ? (
              <span className="badge badge-info">Adelantado · F{jornadaOrigen}</span>
            ) : null}
            {tienePronostico ? (
              <span className="badge badge-ok">
                <CheckCircle2 size={12} aria-hidden="true" />
                <span className="num">{m.local} – {m.visitante}</span>
              </span>
            ) : !estaCerrado ? (
              <span className="badge badge-warn">Pendiente</span>
            ) : null}
            {enVivo ? (
              <>
                <MarcadorEnVivoMini live={liveMatch} />
                {vivo?.prov && (
                  <span className={`badge ${vivo.prov.total > 0 ? "badge-ok" : "badge-neutral"}`} title={textoProvisional(vivo.prov)}>
                    Si termina así <span className="num">+{vivo.prov.total}</span>
                  </span>
                )}
              </>
            ) : !esAplazado ? (
              <RelojCuentaRegresiva fechaHoraPartido={partido.fecha_hora_partido} estado={partido.estado} compacto />
            ) : null}
          </>
        }
      >
        <PredictionForm
          local={partido.equipo_local}
          visitante={partido.equipo_visitante}
          m={m}
          cerrado={deshabilitarMarcador}
          inconsistencia={inconsistencia}
          resultadoOficial={partido.resultado_oficial}
          guardando={guardandoPartidoId === partido.id}
          guardadoOk={partidoGuardadoExitoId === partido.id}
          onMarcador={(campo, valor) => handleMarcadorChange(partido.id, campo, valor)}
          onGanador={(g) => handleGanadorChange(partido.id, g)}
          onGoleador={(id) => handleGoleadorChange(partido.id, id)}
          onGuardar={() => handleGuardarPronosticoPartido(partido.id)}
        />
      </MatchRow>
    );
  };

  // Cerrar Sesión
  const handleCerrarSesion = () => {
    sessionStorage.removeItem("polla_sesion");
    // Invalida la sesión también en el servidor (borra la cookie y el token).
    // keepalive: la petición termina aunque la página navegue enseguida.
    fetch("/api/auth/logout", { method: "POST", keepalive: true }).catch(() => {});
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  // Descargar Excel de Pronósticos por Partido (Diseño exacto Imagen 2)
  const handleDescargarImagenPronosticos = async (partidoId: number) => {
    const node = document.getElementById(`tabla-pronosticos-admin-${partidoId}`);
    if (!node) {
      toast.error("No se encontró la tabla de pronósticos.");
      return;
    }
    try {
      setMensajeEstado({ tipo: "info", texto: "Generando imagen... Espera un momento." });
      const dataUrl = await toPng(node, {
        backgroundColor: '#04060A',
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
            texto: `Algunos pronósticos ya no se pudieron guardar porque cerró su plazo${nombresRechazados ? ": " + nombresRechazados : ""}${data.prediccionInicialRechazada ? " (predicción inicial también cerrada)" : ""}. El resto sí se guardó.`,
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

  // Partidos de la fecha activa que el participante puede ver/pronosticar (mismo filtro de siempre).
  const obtenerPartidosActivosParticipante = () => {
    const estaSoloFinal = (partido: any) => {
      const esFinalizado = esPartidoFinalizadoReal(partido, partidosEnVivo);
      const hace2Horas = new Date().getTime() >= new Date(partido.fecha_hora_partido).getTime() + 2 * 60 * 60 * 1000;
      return esFinalizado || hace2Horas;
    };
    return partidos
      .filter((p) => {
        if (p.estado === "aplazado") return false;
        const jornadaOrigen = p.jornada_original || p.jornada;
        if (p.jornada === fechaParticipante || jornadaOrigen === fechaParticipante) return true;
        if (jornadaOrigen < fechaParticipante && p.estado === "programado") return true;
        const ahora = new Date().getTime();
        const diasAdelanto = 3 * 24 * 60 * 60 * 1000;
        if (jornadaOrigen > fechaParticipante && p.estado !== "aplazado" && new Date(p.fecha_hora_partido).getTime() < ahora + diasAdelanto) {
          return true;
        }
        return false;
      })
      .filter((p) => !estaSoloFinal(p))
      .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());
  };

  const abrirPronostico = (partidoId?: number) => {
    setTabActiva("partidos");
    window.scrollTo({ top: 0 });
    if (partidoId) {
      setPartidosDesplegados((prev) => ({ ...prev, [partidoId]: true }));
      setTimeout(() => {
        document.getElementById(`partido-${partidoId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
    }
  };

  const totalPronosticados = Object.values(marcadores).filter((m) => m.local !== "" && m.visitante !== "").length;

  // Evita el parpadeo de la pantalla de login: mientras no se haya intentado
  // restaurar la sesión guardada, no se sabe todavía si hay que mostrar el
  // login o el dashboard, así que se muestra una pantalla de carga neutra.
  if (!isMounted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--noche)" }}>
        <RefreshCw className="spin" size={36} style={{ color: "#438AFF" }} />
      </div>
    );
  }

  return (
    <div className="participant-root" style={!usuario ? { minHeight: "100vh", display: "flex", width: "100%", background: "var(--noche)" } : { paddingBottom: 80 }}>
      {/* INYECCIÓN DE ESTILO PARA EVITAR POP-IN */}
      {necesitaFullscreen && (
        <style dangerouslySetInnerHTML={{ __html: `
          body main {
            max-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            width: 100vw !important;
          }
        `}} />
      )}
      {/* PANTALLA DE INGRESO PRIVADA */}
      {!usuario ? (
        <div style={{ display: "flex", flex: 1, width: "100%", minHeight: "100vh" }}>
          {/* Panel de marca (escritorio): escudo completo, sin texto encima (zona de protección, manual 04) */}
          <div
            className="login-left-panel"
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "var(--s-6)",
              padding: "var(--s-7) clamp(32px, 5vw, 72px)",
              background: "var(--bg)",
              borderRight: "1px solid var(--line)",
            }}
          >
            <span className="eyebrow" style={{ color: "var(--color-verde-club)" }}>Predice · Compite · Pertenece</span>

            <div style={{ display: "flex", alignItems: "center", gap: "clamp(24px, 4vw, 56px)", flexWrap: "wrap" }}>
              <img
                src="/marca/logo-club90-principal-transparente.webp"
                alt="Club 90 Minutos"
                width={220}
                height={208}
                style={{ width: "clamp(160px, 16vw, 220px)", height: "auto", flexShrink: 0, clipPath: "inset(1.5%)" }}
              />
              <div style={{ maxWidth: 440 }}>
                <h1 style={{ marginBottom: "var(--s-4)" }}>Demuestra que sabes de fútbol</h1>
                <p style={{ color: "var(--text-2)", fontSize: "var(--fs-body-lg)", margin: 0 }}>
                  Pronostica cada fecha de la Liga BetPlay y compite con tu grupo, partido a partido.
                </p>
              </div>
            </div>

            <dl style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, max-content))", gap: "var(--s-2) var(--s-6)", margin: 0 }}>
              {[
                ["5", "marcador exacto"],
                ["3", "ganador o empate"],
                ["2", "goleador"],
              ].map(([n, t]) => (
                <div key={t}>
                  <dt className="num" style={{ fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.1 }}>+{n}</dt>
                  <dd className="caption" style={{ margin: 0 }}>{t}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Formulario */}
          <div
            className="login-right-panel"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "var(--s-6) var(--s-4)",
            }}
          >
            <div style={{ width: "100%", maxWidth: 400 }}>
              <div className="login-mobile-header">
                <Logotipo size={32} />
                <span className="eyebrow" style={{ color: "var(--color-verde-club)" }}>Predice · Compite · Pertenece</span>
              </div>

              <div style={{ marginBottom: "var(--s-6)" }}>
                <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 1.75rem)", marginBottom: "var(--s-2)" }}>
                  {modoRegistro ? "Crea tu cuenta" : "Ingresa al club"}
                </h2>
                <p style={{ color: "var(--text-muted)", margin: 0 }}>
                  {modoRegistro ? "Regístrate para empezar a pronosticar." : "Accede a tus pronósticos y a la tabla de posiciones."}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  modoRegistro ? handleRegistro(e) : handleValidarCorreo(e);
                }}
                style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}
              >
                {modoRegistro && (
                  <div>
                    <label className="field-label" htmlFor="login-nombre">Nombre completo</label>
                    <input
                      id="login-nombre"
                      type="text"
                      className="input"
                      placeholder="Ej. Juan Pérez"
                      autoComplete="name"
                      value={nombreInput}
                      onChange={(e) => setNombreInput(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="field-label" htmlFor="login-correo">Correo electrónico</label>
                  <input
                    id="login-correo"
                    type="email"
                    className="input"
                    placeholder="ejemplo@correo.com"
                    autoComplete="email"
                    value={correoInput}
                    onChange={(e) => setCorreoInput(e.target.value)}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--s-2)" }}>
                    <label className="field-label" htmlFor="login-clave">Contraseña</label>
                    {!modoRegistro && (
                      <Link href="/recuperar-password" style={{ fontSize: "var(--fs-caption)" }}>
                        ¿Olvidaste tu contraseña?
                      </Link>
                    )}
                  </div>
                  <input
                    id="login-clave"
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    autoComplete={modoRegistro ? "new-password" : "current-password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                </div>

                {modoRegistro && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "var(--s-2)", cursor: "pointer", fontSize: "0.875rem", color: "var(--text-2)" }}>
                      <input
                        type="checkbox"
                        checked={aceptoDatos}
                        onChange={(e) => setAceptoDatos(e.target.checked)}
                        style={{ accentColor: "var(--color-verde-club)", width: 18, height: 18, flexShrink: 0 }}
                      />
                      <span>Acepto el tratamiento de mis datos personales</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "var(--s-2)", cursor: "pointer", fontSize: "0.875rem", color: "var(--text-2)" }}>
                      <input
                        type="checkbox"
                        checked={aceptoTerminos}
                        onChange={(e) => setAceptoTerminos(e.target.checked)}
                        style={{ accentColor: "var(--color-verde-club)", width: 18, height: 18, flexShrink: 0 }}
                      />
                      <span>Acepto los <a href="/terminos" target="_blank" rel="noreferrer">términos y condiciones</a></span>
                    </label>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-block" disabled={cargandoValidacion} style={{ marginTop: "var(--s-2)" }}>
                  {cargandoValidacion ? (
                    <>
                      <RefreshCw className="spin" size={18} /> {modoRegistro ? "Creando cuenta…" : "Ingresando…"}
                    </>
                  ) : modoRegistro ? (
                    "Crear mi cuenta"
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </form>

              <div style={{ marginTop: "var(--s-5)", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                {modoRegistro ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
                <button type="button" className="btn btn-text btn-sm" onClick={() => setModoRegistro(!modoRegistro)} style={{ minHeight: 0, padding: "4px" }}>
                  {modoRegistro ? "Inicia sesión" : "Regístrate"}
                </button>
              </div>
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
                background: "rgba(26, 31, 38, 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "22px",
                padding: "24px 32px",
                boxShadow: "none",
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
                    background: "rgba(239, 204, 54, 0.2)",
                    color: "#EFCC36",
                    fontWeight: 900,
                    fontSize: "0.65rem",
                    letterSpacing: "1px",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    border: "1px solid rgba(239, 204, 54, 0.3)",
                    boxShadow: "none",
                  }}
                >
                  Panel de Control Premium
                </span>
                <h2 style={{ margin: 0, color: "#FFFFFF", fontSize: "clamp(1.25rem, 3vw, 1.5rem)", fontWeight: 900, letterSpacing: "-0.5px" }}>
                  Administración Club 90 Minutos
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "6px 0 0 0" }}>
                  Hola, <strong style={{ color: "#FFFFFF" }}>{usuario.nombre}</strong>. Tienes el control total.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleDescargarExcelPronosticos()}
                  disabled={!consolidados}
                  style={{
                    padding: "10px 20px",
                    background: "#74CC10",
                    color: "#04060A",
                    border: "1px solid rgba(116, 204, 16, 0.8)",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Download size={16} /> Exportar Global (Excel)
                </button>

                <button
                  onClick={() => cargarConsolidados(usuario.id)}
                  disabled={cargandoConsolidados}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "none",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                >
                  <RefreshCw size={16} className={cargandoConsolidados ? "spin" : ""} /> Sincronizar
                </button>

                <button
                  onClick={handleCerrarSesion}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(234, 61, 53, 0.15)",
                    color: "#EA3D35",
                    border: "1px solid rgba(234, 61, 53, 0.5)",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.background = "rgba(234, 61, 53, 0.25)";
                    e.currentTarget.style.borderColor = "rgba(234, 61, 53, 0.8)";
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.background = "rgba(234, 61, 53, 0.15)";
                    e.currentTarget.style.borderColor = "rgba(234, 61, 53, 0.5)";
                    e.currentTarget.style.color = "#EA3D35";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <LogOut size={16} /> Cerrar Sesión
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
                  background: "rgba(26, 31, 38, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "24px",
                  padding: "18px",
                  boxShadow: "none",
                }}
              >
                <div className="admin-sidebar-title" style={{ padding: "6px 10px 14px", color: "var(--text-muted)", fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px dashed rgba(255,255,255,0.08)", marginBottom: 6 }}>
                  Navegación
                </div>
                <div className="admin-sidebar-nav no-scrollbar">
                  {([
                    { key: "predicciones", label: "Fechas y Predicciones", icon: Eye, color: "#438AFF" },
                    { key: "predicciones_torneo", label: "Predicciones Torneo", icon: Trophy, color: "#EFCC36" },
                    { key: "editar_partidos", label: "Editar Partidos", icon: Calendar, color: "#438AFF" },
                    { key: "aplazados", label: "Partidos Aplazados", icon: Hourglass, color: "#EFCC36" },
                    { key: "liquidacion", label: "Liquidación de Puntos", icon: ClipboardCheck, color: "#EFCC36" },
                    { key: "jugadores", label: "Gestión de Jugadores", icon: Users, color: "#438AFF" },
                    { key: "posiciones", label: "Tabla de Posiciones", icon: BarChart3, color: "#74CC10" },
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
                          background: activo ? `transparent` : "transparent",
                          color: activo ? "#FFFFFF" : "var(--text-muted)",
                          fontWeight: activo ? 800 : 600,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          boxShadow: "none",
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
                            color: activo ? item.color : "var(--text-muted)",
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
                  <div className="admin-sidebar-fecha" style={{ marginTop: 10, padding: "12px 14px", borderRadius: 14, background: "rgba(4, 6, 10, 0.25)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Fecha activa</div>
                    <div style={{ fontSize: "1rem", color: "#438AFF", fontWeight: 900 }}>Fecha {fechaAdmin}</div>
                  </div>
                )}
              </div>

              {/* CONTENIDO PRINCIPAL */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {(() => {
                  const fechasDisponibles = Array.from(new Set(partidos.map((p) => p.jornada))).sort((a, b) => a - b);
                  const listaFechas = fechasDisponibles.length > 0 ? fechasDisponibles : [1, 2, 3];

                  const estaSoloFinal = (partido: any) => {
                    if (partido.estado === "aplazado") return false;
                    const esFinalizado = esPartidoFinalizadoReal(partido, partidosEnVivo);
                    const hace2Horas = new Date().getTime() >= new Date(partido.fecha_hora_partido).getTime() + 2 * 60 * 60 * 1000;
                    return esFinalizado || hace2Horas;
                  };

                  // Filtro de partidos para el Admin (mostrados en su fecha original de fixture)
                  const partidosAdminFiltrados = fechaAdmin === 0
                    ? []
                    : partidos.filter((p) => {
                        if (seccionAdminPanel === "aplazados") {
                          return p.estado === "aplazado";
                        }
                        const jornadaOrigen = p.jornada_original || p.jornada;
                        return jornadaOrigen === fechaAdmin;
                      });
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
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "rgba(4, 6, 10, 0.25)", padding: "8px", borderRadius: "18px", marginBottom: 20, boxShadow: "none"}}>
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
                            background: fechaAdmin === f ? "#438AFF" : "transparent",
                            color: fechaAdmin === f ? "#FFFFFF" : "#E5E7EB",
                            border: "none",
                            boxShadow: "none",
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
                        background: "rgba(26, 31, 38, 0.6)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "20px",
                        boxShadow: "none"}}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                              <span style={{ fontSize: "1rem", fontWeight: 900, color: "#FFFFFF" }}>VS</span>
                              <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                            </div>
                            <div>
                              <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "1.02rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span>{partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}</span>
                                {partido.estado === "aplazado" && (
                                  <span style={{ background: "rgba(239, 204, 54, 0.25)", color: "#EFCC36", border: "1px solid rgba(239, 204, 54, 0.5)", padding: "2px 8px", borderRadius: 12, fontSize: "0.72rem", fontWeight: 800 }}>
                                    Aplazado
                                  </span>
                                )}
                              </h3>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>
                                  {formatearFechaPartido(partido.fecha_hora_partido)} · {formatearHoraPartido(partido.fecha_hora_partido)}
                                </span>
                                {partido.estadio && (
                                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>
                                    {partido.estadio}
                                  </span>
                                )}
                              </div>
                              {esAplazado && (
                                <div style={{ marginTop: 4, padding: "4px 10px", background: cerrado ? "rgba(234, 61, 53, 0.2)" : "rgba(239, 204, 54, 0.2)", color: cerrado ? "#EA3D35" : "#EFCC36", borderRadius: 8, fontSize: "0.85rem", fontWeight: 800, display: "inline-block" }}>
                                  {cerrado ? "Pronósticos Cerrados" : `Cierra pronósticos en: ${conteoFaltante}`}
                                </div>
                              )}
                              <div>
                                <span style={{ fontSize: "0.9rem", color: "#438AFF", fontWeight: 700 }}>
                                  {pronosticosPartido.length} pronósticos recibidos
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              onClick={() => setPartidoAdminVer(partidoAdminVer === partido.id ? null : partido.id)}
                              style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem", background: "rgba(255,255,255,0.1)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
                            >
                              <Users size={16} /> Ver Participantes
                            </button>

                            <button
                              onClick={() => handleDescargarExcelPronosticos(partido.id)}
                              style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem", background: "rgba(116, 204, 16, 0.2)", color: "#74CC10", border: "1px solid rgba(116, 204, 16, 0.4)", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
                            >
                              <Download size={16} /> Bajar Excel
                            </button>
                          </div>
                        </div>

                        {partidoAdminVer === partido.id && (
                          <div id={`tabla-pronosticos-admin-${partido.id}`} style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)", animation: "fadeIn 0.3s ease" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                              <h4 style={{ margin: 0, color: "#438AFF", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                                Tabla de Predicciones ({pronosticosPartido.length})
                              </h4>
                              <button
                                onClick={() => handleDescargarImagenPronosticos(partido.id)}
                                style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem", background: "#438AFF", color: "#04060A", border: "none", cursor: "pointer", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}
                              >
                                <Camera size={14} /> Captura
                              </button>
                            </div>

                            {pronosticosPartido.length === 0 ? (
                              <div style={{ padding: 20, background: "rgba(4, 6, 10, 0.2)", borderRadius: 12, color: "var(--text-muted)", textAlign: "center" }}>
                                Nadie ha enviado pronósticos para este partido.
                              </div>
                            ) : (
                              <div style={{ overflowX: "auto", background: "rgba(4, 6, 10, 0.3)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
                                  <thead>
                                    <tr style={{ background: "rgba(255,255,255,0.02)", color: "#E5E7EB" }}>
                                      <th style={{ padding: "12px 16px", fontWeight: 800 }}>Participante</th>
                                      <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800 }}>Marcador</th>
                                      <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800 }}>Ganador</th>
                                      <th style={{ padding: "12px 16px", fontWeight: 800 }}>Goleador</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pronosticosPartido.map((p: any, idx: number) => (
                                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#FFFFFF" }}>
                                          {p.usuario.nombre_completo}
                                        </td>
                                        <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 900, color: "#74CC10", fontSize: "1.1rem" }}>
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
                                              <span style={{ padding: "4px 10px", borderRadius: 10, background: "rgba(67, 138, 255, 0.15)", color: "#438AFF", fontWeight: 800, fontSize: "0.8rem" }}>
                                                {ganadorTexto}
                                              </span>
                                            );
                                          })()}
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "#EFCC36", fontWeight: 700 }}>
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
                        background: "rgba(26, 31, 38, 0.6)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "20px",
                        boxShadow: "none"}}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                            <span style={{ fontSize: "1rem", fontWeight: 900, color: "#FFFFFF" }}>VS</span>
                            <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                          </div>
                          <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "1.02rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span>{partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}</span>
                            {(partido.jornada_original || esAplazado) && (
                              <span style={{ background: "rgba(239, 204, 54, 0.25)", color: "#EFCC36", border: "1px solid rgba(239, 204, 54, 0.5)", padding: "2px 8px", borderRadius: 12, fontSize: "0.72rem", fontWeight: 800 }}>
                                Aplazado (Pertenece a Fecha {partido.jornada_original || partido.jornada})
                              </span>
                            )}
                          </h3>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          <div style={{ fontSize: "1rem", color: "#E5E7EB", fontWeight: 800 }}>
                            Gestión de Resultado Oficial
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", background: "rgba(4, 6, 10, 0.2)", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                              <input
                                type="number"
                                min="0"
                                placeholder="Local"
                                style={{ width: 64, padding: "10px", borderRadius: "10px", border: "2px solid rgba(255,255,255,0.1)", background: "rgba(26, 31, 38, 0.8)", color: "#FFFFFF", textAlign: "center", fontWeight: 900, fontSize: "1.1rem" }}
                                value={resultadosAdminInput[partido.id]?.local || ""}
                                onChange={(e) => handleResultadoAdminChange(partido.id, "local", e.target.value)}
                              />
                              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--texto-secundario)", padding: "0 4px" }}>-</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="Visita"
                                style={{ width: 64, padding: "10px", borderRadius: "10px", border: "2px solid rgba(255,255,255,0.1)", background: "rgba(26, 31, 38, 0.8)", color: "#FFFFFF", textAlign: "center", fontWeight: 900, fontSize: "1.1rem" }}
                                value={resultadosAdminInput[partido.id]?.visitante || ""}
                                onChange={(e) => handleResultadoAdminChange(partido.id, "visitante", e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  const toastId = toast.loading(`Obteniendo datos de ESPN para ${partido.equipo_local.nombre}...`);
                                  try {
                                    const res = await fetch("/api/admin/extraer-resultado-externo", {
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

                                    let msg = `Marcador oficial auto-completado (partido finalizado en ESPN): ${data.golesLocal}-${data.golesVisitante}`;

                                    if (data.logs && data.logs.length > 0) {
                                      toast.success(`${msg}. Goleadores: ${data.logs.join(' | ')}`, { id: toastId, duration: 6000 });
                                    } else {
                                      toast.success(msg, { id: toastId });
                                    }
                                  } catch (err: any) {
                                    toast.error(err.message, { id: toastId });
                                  }
                                }}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "8px",
                                  background: "rgba(67, 138, 255, 0.2)",
                                  color: "#438AFF",
                                  border: "1px solid rgba(67, 138, 255, 0.5)",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  whiteSpace: "nowrap"
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(67, 138, 255, 0.4)"; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(67, 138, 255, 0.2)"; }}
                              >
                                Extraer ESPN
                              </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 280 }}>
                              <select
                                style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(26, 31, 38, 0.8)", color: "#FFFFFF", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", appearance: "none" }}
                                value=""
                                onChange={(e) => {
                                  handleAgregarGoleadorAdmin(partido.id, e.target.value);
                                  e.target.value = "";
                                }}
                              >
                                <option value="">Seleccionar Goleador Oficial (Opcional)</option>
                                {partido.equipo_local.jugadores && partido.equipo_local.jugadores.length > 0 && (
                                  <optgroup label={`${partido.equipo_local.nombre}`}>
                                    {partido.equipo_local.jugadores.map((j: any) => (
                                      <option key={j.id} value={j.id}>{j.nombre}</option>
                                    ))}
                                  </optgroup>
                                )}
                                {partido.equipo_visitante.jugadores && partido.equipo_visitante.jugadores.length > 0 && (
                                  <optgroup label={`${partido.equipo_visitante.nombre}`}>
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
                                          background: "rgba(239, 204, 54, 0.15)",
                                          color: "#EFCC36",
                                          border: "1px solid rgba(239, 204, 54, 0.3)",
                                          borderRadius: "20px",
                                          padding: "4px 12px",
                                          fontSize: "0.85rem",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 8,
                                          fontWeight: 700,
                                        }}
                                      >
                                        {jObj?.nombre || `ID: ${jId}`}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoverGoleadorAdmin(partido.id, idxGoleador)}
                                          style={{ background: "rgba(4, 6, 10, 0.2)", border: "none", color: "#EA3D35", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 900, fontSize: "0.8rem", marginLeft: 4 }}
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                              
                              {(resultadosAdminInput[partido.id]?.goleadores_ids?.length === 0 || !resultadosAdminInput[partido.id]?.goleadores_ids) && 
                               resultadosAdminInput[partido.id]?.local === "0" && 
                               resultadosAdminInput[partido.id]?.visitante === "0" && (
                                <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                                  <span style={{
                                    background: "rgba(107, 114, 128, 0.15)",
                                    color: "var(--text-muted)",
                                    border: "1px solid rgba(107, 114, 128, 0.3)",
                                    borderRadius: "20px",
                                    padding: "4px 12px",
                                    fontSize: "0.85rem",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    fontWeight: 600,
                                    fontStyle: "italic"
                                  }}>
                                    Sin Goleador (0 - 0)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", width: "100%" }}>
                            <button
                              onClick={() => handleCargarMarcadorPantalla(partido.id)}
                              style={{
                                flex: "1 1 200px",
                                minWidth: "200px",
                                padding: "12px",
                                borderRadius: "12px",
                                fontSize: "0.95rem",
                                background: "#74CC10",
                                color: "#04060A",
                                border: "none",
                                fontWeight: 900,
                                cursor: "pointer",
                                boxShadow: "none",
                                transition: "transform 0.2s"
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                              onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
                            >
                              Cargar Marcador en Pantalla
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm("ATENCIÓN: Esto ejecutará el cálculo de puntos para TODOS los usuarios y modificará la tabla general. ¿Estás seguro de que quieres LIQUIDAR PUNTOS ahora mismo?")) {
                                  handleCargarResultadoOficial(partido.id);
                                }
                              }}
                              disabled={partido.estado !== "resultado_cargado" && partido.estado !== "puntaje_calculado"}
                              style={{
                                flex: "1 1 200px",
                                minWidth: "200px",
                                padding: "12px",
                                borderRadius: "12px",
                                fontSize: "0.95rem",
                                background: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "#EFCC36" : "rgba(255,255,255,0.05)",
                                color: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "#FFFFFF" : "var(--text-muted)",
                                border: "none",
                                fontWeight: 900,
                                cursor: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "pointer" : "not-allowed",
                                boxShadow: "none",
                                transition: "all 0.2s"
                              }}
                            >
                              Liquidar Puntos (Global)
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
                                flex: "1 1 160px",
                                minWidth: "160px",
                                padding: "12px",
                                borderRadius: "12px",
                                fontSize: "0.95rem",
                                background: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "rgba(234, 61, 53, 0.15)" : "rgba(255,255,255,0.05)",
                                color: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "#EA3D35" : "var(--text-muted)",
                                border: "1px solid " + (partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "rgba(234, 61, 53, 0.4)" : "rgba(255,255,255,0.08)"),
                                fontWeight: 900,
                                cursor: partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado" ? "pointer" : "not-allowed",
                              }}
                            >
                              <Trash2 size={14} /> Quitar Resultado
                            </button>
                          </div>
                          {partido.estado !== "resultado_cargado" && partido.estado !== "puntaje_calculado" && (
                            <div style={{ fontSize: "0.8rem", color: "#EFCC36", fontStyle: "italic", textAlign: "right" }}>
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
                        background: "rgba(26, 31, 38, 0.6)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(239, 204, 54, 0.25)",
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "20px",
                        boxShadow: "none"}}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                            <span style={{ fontSize: "1rem", fontWeight: 900, color: "#FFFFFF" }}>VS</span>
                            <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                          </div>
                          <div>
                            <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "1.02rem" }}>
                              {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
                            </h3>
                            <div style={{ marginTop: 4, padding: "4px 10px", background: "rgba(239, 204, 54, 0.15)", color: "#EFCC36", borderRadius: 8, fontSize: "0.8rem", fontWeight: 800, display: "inline-block" }}>
                              Pertenece a Fecha {partido.jornada}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "rgba(4, 6, 10, 0.2)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                          <select
                            value={programacionAdminInput[partido.id]?.jornada ?? String(partido.jornada)}
                            onChange={(e) => actualizarProgramacionInput(partido, "jornada", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(26, 31, 38, 0.8)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}
                          >
                            {Array.from({ length: Math.max(listaFechas.length, partido.jornada) + 2 }, (_, i) => i + 1).map((f) => (
                              <option key={f} value={f}>Fecha {f}</option>
                            ))}
                          </select>

                          <input
                            type="datetime-local"
                            value={programacionAdminInput[partido.id]?.fecha_hora ?? aInputDatetimeLocal(partido.fecha_hora_partido)}
                            onChange={(e) => actualizarProgramacionInput(partido, "fecha_hora", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(26, 31, 38, 0.8)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}
                          />

                          <input
                            type="text"
                            placeholder="Estadio"
                            value={programacionAdminInput[partido.id]?.estadio ?? (partido.estadio || "")}
                            onChange={(e) => actualizarProgramacionInput(partido, "estadio", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(26, 31, 38, 0.8)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem", minWidth: 180 }}
                          />

                          <button
                            type="button"
                            onClick={() => handleGuardarProgramacion(partido)}
                            disabled={guardandoProgramacionId === partido.id}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: "10px", border: "none", fontWeight: 800, fontSize: "0.82rem", cursor: guardandoProgramacionId === partido.id ? "not-allowed" : "pointer", background: "#438AFF", color: "#04060A", opacity: guardandoProgramacionId === partido.id ? 0.6 : 1 }}
                          >
                            <Save size={14} /> Guardar Programación
                          </button>

                          {programacionGuardadaId === partido.id && (
                            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#74CC10", fontWeight: 800, fontSize: "0.82rem" }}>
                              <CheckCircle2 size={16} /> Guardado
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleAplazado(partido)}
                            disabled={guardandoProgramacionId === partido.id}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: "10px", border: "none", fontWeight: 800, fontSize: "0.82rem", cursor: guardandoProgramacionId === partido.id ? "not-allowed" : "pointer", background: "#74CC10", color: "#04060A", opacity: guardandoProgramacionId === partido.id ? 0.6 : 1 }}
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
                        background: "rgba(26, 31, 38, 0.6)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "20px",
                        padding: "24px",
                        marginBottom: "20px",
                        boxShadow: "none"}}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img src={partido.equipo_local.escudo_url} alt={partido.equipo_local.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                            <span style={{ fontSize: "1rem", fontWeight: 900, color: "#FFFFFF" }}>VS</span>
                            <img src={partido.equipo_visitante.escudo_url} alt={partido.equipo_visitante.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                          </div>
                          <div>
                            <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "1.02rem" }}>
                              {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
                            </h3>
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>
                              {formatearFechaPartido(partido.fecha_hora_partido)} · {formatearHoraPartido(partido.fecha_hora_partido)}
                              {partido.estadio ? ` · ${partido.estadio}` : ""}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "rgba(4, 6, 10, 0.2)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                          <select
                            value={programacionAdminInput[partido.id]?.jornada ?? String(partido.jornada)}
                            onChange={(e) => actualizarProgramacionInput(partido, "jornada", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(26, 31, 38, 0.8)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}
                          >
                            {Array.from({ length: Math.max(listaFechas.length, partido.jornada) + 2 }, (_, i) => i + 1).map((f) => (
                              <option key={f} value={f}>Fecha {f}</option>
                            ))}
                          </select>

                          <input
                            type="datetime-local"
                            value={programacionAdminInput[partido.id]?.fecha_hora ?? aInputDatetimeLocal(partido.fecha_hora_partido)}
                            onChange={(e) => actualizarProgramacionInput(partido, "fecha_hora", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(26, 31, 38, 0.8)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}
                          />

                          <input
                            type="text"
                            placeholder="Estadio"
                            value={programacionAdminInput[partido.id]?.estadio ?? (partido.estadio || "")}
                            onChange={(e) => actualizarProgramacionInput(partido, "estadio", e.target.value)}
                            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(26, 31, 38, 0.8)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem", minWidth: 180 }}
                          />

                          <button
                            type="button"
                            onClick={() => handleGuardarProgramacion(partido)}
                            disabled={guardandoProgramacionId === partido.id}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: "10px", border: "none", fontWeight: 800, fontSize: "0.82rem", cursor: guardandoProgramacionId === partido.id ? "not-allowed" : "pointer", background: "#438AFF", color: "#04060A", opacity: guardandoProgramacionId === partido.id ? 0.6 : 1 }}
                          >
                            <Save size={14} /> Guardar Programación
                          </button>

                          {programacionGuardadaId === partido.id && (
                            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#74CC10", fontWeight: 800, fontSize: "0.82rem" }}>
                              <CheckCircle2 size={16} /> Guardado
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleAplazado(partido)}
                            disabled={guardandoProgramacionId === partido.id}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: "10px", fontWeight: 800, fontSize: "0.82rem", cursor: guardandoProgramacionId === partido.id ? "not-allowed" : "pointer", background: esAplazado ? "#EFCC36" : "transparent", color: esAplazado ? "#FFFFFF" : "#EFCC36", border: "1px solid " + (esAplazado ? "transparent" : "rgba(239, 204, 54, 0.4)") }}
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
                        <h2 style={{ margin: "0 0 4px", color: "#FFFFFF", fontSize: "1.3rem", fontWeight: 900 }}>Editar Partidos</h2>
                        <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: "0.82rem" }}>Cambia la fecha, hora, jornada o estadio de un partido. No afecta resultados ni puntos ya liquidados.</p>
                        {SelectorFechaCompacto}
                        {fechaAdmin === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(26, 31, 38, 0.6)", border: "2px dashed rgba(239, 204, 54, 0.4)", borderRadius: 24 }}>
                            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#EFCC36" }}>Selecciona una Fecha</div>
                          </div>
                        ) : partidosAdminFiltrados.length === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(26, 31, 38, 0.6)", borderRadius: 24, color: "var(--text-muted)" }}>
                            {`No hay partidos programados para la Fecha ${fechaAdmin}.`}
                          </div>
                        ) : (
                          <>
                            {partidosActivosAdmin.map((partido) => renderPartidoEditarCard(partido))}
                            {partidosFinalizadosAdmin.length > 0 && (
                              <>
                                <div style={{ margin: "30px 0 20px", borderTop: "2px dashed rgba(255,255,255,0.1)", paddingTop: 20 }}>
                                  <h3 style={{ color: "var(--text-muted)", fontSize: "1.2rem", fontWeight: 900, margin: 0 }}>Partidos Finalizados</h3>
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
                        <h2 style={{ margin: "0 0 4px", color: "#FFFFFF", fontSize: "1.3rem", fontWeight: 900 }}>Partidos Aplazados</h2>
                        <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: "0.82rem" }}>Partidos pospuestos, sin importar la fecha a la que pertenecen. Reprográmalos aquí cuando tengas la nueva fecha, o reactívalos para que vuelvan a su fecha normal.</p>
                        {partidosAplazados.length === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(26, 31, 38, 0.6)", borderRadius: 24, color: "var(--text-muted)" }}>
                            No hay partidos aplazados registrados actualmente.
                          </div>
                        ) : (
                          partidosAplazados.map((partido) => renderPartidoAplazadoCard(partido))
                        )}
                      </div>
                    );
                  }

                  // ================= SECCIÓN: FECHAS Y PREDICCIONES (UNIFICADA) =================
                  if (seccionAdminPanel === "predicciones_torneo") {
                    return (
                      <div>
                        <h2 style={{ margin: "0 0 16px", color: "#FFFFFF", fontSize: "1.3rem", fontWeight: 900 }}>Predicciones del Torneo</h2>
                        {(!consolidados || !consolidados.prediccionesIniciales || consolidados.prediccionesIniciales.length === 0) ? (
                          <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                            No hay predicciones del torneo registradas aún.
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {consolidados.prediccionesIniciales.map((pi: any) => (
                              <details key={pi.id} className="card" style={{ padding: "0", cursor: "pointer", transition: "all 0.3s ease", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden", background: "rgba(26, 31, 38, 0.4)" }}>
                                <summary style={{ 
                                  padding: "16px 20px", 
                                  fontWeight: 800, 
                                  color: "#FFFFFF", 
                                  listStyle: "none", 
                                  display: "flex", 
                                  justifyContent: "space-between", 
                                  alignItems: "center",
                                  background: "rgba(26, 31, 38, 0.7)",
                                  borderBottom: "1px solid rgba(255,255,255,0.05)"
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <User size={18} color="var(--cancha)" />
                                    {pi.usuario.nombre_completo}
                                  </div>
                                  <span style={{ 
                                    fontSize: "0.75rem", 
                                    color: "#1A1F26", 
                                    fontWeight: 800, 
                                    background: "var(--cancha)",
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    boxShadow: "none"}}>
                                    Ver predicciones 
                                  </span>
                                </summary>
                                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.95rem", background: "rgba(4, 6, 10, 0.2)" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Campeón:</span>
                                    <span style={{ color: "#EFCC36", fontWeight: 600 }}>{pi.campeon?.nombre || "-"}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Subcampeón:</span>
                                    <span style={{ color: "#E5E7EB" }}>
                                      {pi.campeon?.nombre === pi.finalista_1?.nombre 
                                        ? (pi.finalista_2?.nombre || "-") 
                                        : (pi.finalista_1?.nombre || "-")}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Goleador Torneo:</span>
                                    <span style={{ color: "#EA3D35" }}>{pi.goleador_torneo?.nombre || "-"}</span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Clasificados:</span>
                                    <span style={{ color: "#74CC10", fontSize: "0.85rem", lineHeight: "1.4" }}>
                                      {pi.clasificados && pi.clasificados.length > 0 
                                        ? pi.clasificados.map((c: any) => c.equipo.nombre).join(", ")
                                        : "-"}
                                    </span>
                                  </div>
                                </div>
                              </details>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (seccionAdminPanel === "predicciones") {
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* KPIs */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
                          {[
                            { label: "Usuarios Registrados", value: consolidados?.usuarios?.length || 0, icon: UserCheck, color: "#438AFF" },
                            { label: "Líder Actual", value: consolidados?.tablaPosiciones?.[0]?.nombre_completo || "N/A", sub: consolidados?.tablaPosiciones?.[0] ? `${consolidados.tablaPosiciones[0]?.pts_total ?? 0} Pts` : undefined, icon: Trophy, color: "#EFCC36" },
                            { label: "Partidos Programados", value: partidos.length, icon: Calendar, color: "#74CC10" },
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
                                  background: "rgba(26, 31, 38, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: `1px solid ${kpi.color}33`,
                                  borderRadius: "20px",
                                  boxShadow: "none",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                              >
                                <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: `${kpi.color}22`, filter: "none", borderRadius: "50%" }}></div>
                                <div
                                  style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "14px",
                                    background: `transparent`,
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
                                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    {kpi.label}
                                  </div>
                                  <strong style={{ fontSize: typeof kpi.value === "string" && kpi.value.length > 14 ? "1.05rem" : "1.6rem", color: "#FFFFFF", fontWeight: 900, lineHeight: 1.15, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                            background: "rgba(26, 31, 38, 0.7)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: "24px",
                            padding: "24px",
                            boxShadow: "none",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                            <div>
                              <h2 style={{ margin: 0, fontSize: "1.35rem", color: "#FFFFFF", fontWeight: 900 }}>
                                Fechas y Predicciones
                              </h2>
                              <p style={{ color: "var(--text-muted)", margin: "6px 0 0 0", fontSize: "0.85rem" }}>
                                Selecciona una fecha para revisar lo que pronosticó cada usuario. Los partidos aplazados aparecen siempre.
                              </p>
                            </div>

                            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: "rgba(4, 6, 10, 0.2)", padding: "6px", borderRadius: "20px" }}>
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
                                    background: fechaAdmin === f ? "#438AFF" : "transparent",
                                    color: fechaAdmin === f ? "#FFFFFF" : "#E5E7EB",
                                    border: "none",
                                    boxShadow: "none",
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
                                  background: fechaAdmin === 0 ? "rgba(255,255,255,0.05)" : "#74CC10",
                                  color: fechaAdmin === 0 ? "var(--text-muted)" : "#FFFFFF",
                                  border: "none",
                                  borderRadius: "12px",
                                  fontWeight: 900,
                                  boxShadow: "none",
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
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(26, 31, 38, 0.6)", border: "2px dashed rgba(67, 138, 255, 0.4)", borderRadius: 24 }}>
                            <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#438AFF" }}>Selecciona una Fecha</div>
                          </div>
                        ) : partidosAdminFiltrados.length === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(26, 31, 38, 0.6)", borderRadius: 24, color: "var(--text-muted)" }}>
                            {`No hay partidos programados para la Fecha ${fechaAdmin}.`}
                          </div>
                        ) : (
                          <>
                            {partidosActivosAdmin.map((partido) => renderPartidoPrediccionesCard(partido))}
                            {partidosFinalizadosAdmin.length > 0 && (
                              <>
                                <div style={{ margin: "30px 0 20px", borderTop: "2px dashed rgba(255,255,255,0.1)", paddingTop: 20 }}>
                                  <h3 style={{ color: "var(--text-muted)", fontSize: "1.2rem", fontWeight: 900, margin: 0 }}>Partidos Finalizados</h3>
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
                        <h2 style={{ margin: "0 0 4px", color: "#FFFFFF", fontSize: "1.3rem", fontWeight: 900 }}>Liquidación de Puntos</h2>
                        <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: "0.82rem" }}>Carga el marcador oficial y liquida los puntos de cada partido.</p>
                        <PanelLiquidacionAutomatica onLiquidado={() => cargarMaestros()} />
                        <div style={{ marginTop: 16 }}><PanelCorreosAutomaticos /></div>
                        {SelectorFechaCompacto}
                        {fechaAdmin === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(26, 31, 38, 0.6)", border: "2px dashed rgba(239, 204, 54, 0.4)", borderRadius: 24 }}>
                            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#EFCC36" }}>Selecciona una Fecha</div>
                          </div>
                        ) : partidosAdminFiltrados.length === 0 ? (
                          <div style={{ padding: 40, textAlign: "center", background: "rgba(26, 31, 38, 0.6)", borderRadius: 24, color: "var(--text-muted)" }}>
                            {`No hay partidos programados para la Fecha ${fechaAdmin}.`}
                          </div>
                        ) : (
                          <>
                            {partidosActivosAdmin.map((partido) => renderPartidoLiquidacionCard(partido))}
                            {partidosFinalizadosAdmin.length > 0 && (
                              <>
                                <div style={{ margin: "30px 0 20px", borderTop: "2px dashed rgba(255,255,255,0.1)", paddingTop: 20 }}>
                                  <h3 style={{ color: "var(--text-muted)", fontSize: "1.2rem", fontWeight: 900, margin: 0 }}>Partidos Finalizados</h3>
                                </div>
                                {partidosFinalizadosAdmin.map((partido) => renderPartidoLiquidacionCard(partido))}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }

                  // ================= SECCIÓN: GESTIÓN DE JUGADORES =================
                  if (seccionAdminPanel === "jugadores") {
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <div>
                          <h2 style={{ margin: "0 0 4px", color: "#FFFFFF", fontSize: "1.3rem", fontWeight: 900 }}>
                            Gestión de Jugadores y Plantillas
                          </h2>
                          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.82rem" }}>
                            Añade nuevos jugadores a los equipos del torneo para que aparezcan en los menús de goleadores en pronósticos y resultados oficiales.
                          </p>
                        </div>

                        {/* FORMULARIO PARA AÑADIR JUGADOR */}
                        <div
                          style={{
                            background: "rgba(26, 31, 38, 0.6)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(67, 138, 255, 0.25)",
                            borderRadius: "20px",
                            padding: "24px",
                            boxShadow: "none",
                          }}
                        >
                          <h3 style={{ margin: "0 0 16px", color: "#438AFF", fontSize: "1.05rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                            Añadir Nuevo Jugador a un Equipo
                          </h3>

                          <form onSubmit={handleCrearJugador} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>
                                  1. Selecciona el Equipo:
                                </label>
                                <select
                                  value={equipoJugadorSeleccionado}
                                  onChange={(e) => setEquipoJugadorSeleccionado(e.target.value ? Number(e.target.value) : "")}
                                  required
                                  style={{
                                    padding: "12px 14px",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(26, 31, 38, 0.85)",
                                    color: "#FFFFFF",
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  <option value="">-- Elige un Equipo --</option>
                                  {equipos.map((eq) => (
                                    <option key={eq.id} value={eq.id}>
                                      {eq.nombre}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>
                                  2. Nombre del Jugador:
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Radamel Falcao, Luis Díaz..."
                                  value={nombreNuevoJugador}
                                  onChange={(e) => setNombreNuevoJugador(e.target.value)}
                                  required
                                  style={{
                                    padding: "12px 14px",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(26, 31, 38, 0.85)",
                                    color: "#FFFFFF",
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                  }}
                                />
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                              <button
                                type="submit"
                                disabled={guardandoJugador || !equipoJugadorSeleccionado || !nombreNuevoJugador.trim()}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "12px 24px",
                                  borderRadius: "12px",
                                  fontSize: "0.9rem",
                                  background: guardandoJugador
                                    ? "rgba(255,255,255,0.1)"
                                    : "#438AFF",
                                  color: "#FFFFFF",
                                  border: "none",
                                  fontWeight: 900,
                                  cursor: guardandoJugador || !equipoJugadorSeleccionado || !nombreNuevoJugador.trim() ? "not-allowed" : "pointer",
                                  boxShadow: "none",
                                  opacity: guardandoJugador || !equipoJugadorSeleccionado || !nombreNuevoJugador.trim() ? 0.6 : 1,
                                  transition: "all 0.2s",
                                }}
                              >
                                {guardandoJugador ? (
                                  <>
                                    <RefreshCw className="spin" size={16} /> Guardando...
                                  </>
                                ) : (
                                  <>
                                    Añadir Jugador a la Plantilla
                                  </>
                                )}
                              </button>

                              {equipoJugadorSeleccionado !== "" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEquipoModalId(Number(equipoJugadorSeleccionado));
                                    setMostrarModalPlantilla(true);
                                  }}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "12px 20px",
                                    borderRadius: "12px",
                                    fontSize: "0.88rem",
                                    background: "rgba(67, 138, 255, 0.2)",
                                    color: "#438AFF",
                                    border: "1px solid rgba(67, 138, 255, 0.4)",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseOver={(e) => (e.currentTarget.style.background = "rgba(67, 138, 255, 0.35)")}
                                  onMouseOut={(e) => (e.currentTarget.style.background = "rgba(67, 138, 255, 0.2)")}
                                >
                                  <Eye size={16} /> Ver Plantilla de {equipos.find((e) => e.id === Number(equipoJugadorSeleccionado))?.nombre || "este Equipo"}
                                </button>
                              )}
                            </div>
                          </form>
                        </div>

                        {/* TARJETA ACCESO RÁPIDO A PLANTILLAS (VENTANA EMERGENTE) */}
                        <div
                          style={{
                            background: "rgba(26, 31, 38, 0.6)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "20px",
                            padding: "24px",
                            boxShadow: "none",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                            <div>
                              <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "1.05rem", fontWeight: 800 }}>
                                Plantillas de Equipos Registradas ({jugadores.length} jugadores)
                              </h3>
                              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                Haz clic en cualquier equipo o en el botón para abrir la plantilla completa en una ventana emergente.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setEquipoModalId("todas");
                                setMostrarModalPlantilla(true);
                              }}
                              style={{
                                padding: "10px 18px",
                                borderRadius: "12px",
                                background: "#438AFF",
                                color: "#04060A",
                                border: "none",
                                fontWeight: 800,
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                boxShadow: "none",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                              onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
                            >
                              <Eye size={16} /> Abrir Ventana Emergente
                            </button>
                          </div>

                          {/* Chips de Equipos */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEquipoModalId("todas");
                                setMostrarModalPlantilla(true);
                              }}
                              style={{
                                padding: "8px 14px",
                                borderRadius: "12px",
                                background: "rgba(67, 138, 255, 0.2)",
                                color: "#438AFF",
                                border: "1px solid rgba(67, 138, 255, 0.4)",
                                fontWeight: 800,
                                fontSize: "0.8rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              Todos los Equipos ({jugadores.length})
                            </button>
                            {equipos.map((eq) => {
                              const cant = jugadores.filter((j) => j.equipo_id === eq.id).length;
                              return (
                                <button
                                  key={eq.id}
                                  type="button"
                                  onClick={() => {
                                    setEquipoModalId(eq.id);
                                    setMostrarModalPlantilla(true);
                                  }}
                                  style={{
                                    padding: "8px 14px",
                                    borderRadius: "12px",
                                    background: "rgba(255,255,255,0.05)",
                                    color: "#FFFFFF",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    fontWeight: 700,
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    transition: "all 0.2s",
                                  }}
                                  onMouseOver={(e) => (e.currentTarget.style.background = "rgba(67, 138, 255, 0.15)")}
                                  onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                >
                                  {eq.escudo_url && <img src={eq.escudo_url} alt={eq.nombre} style={{ width: 20, height: 20, objectFit: "contain" }} />}
                                  <span>{eq.nombre} ({cant})</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // ================= SECCIÓN: TABLA DE POSICIONES =================
                  return (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                        <div>
                          <h2 style={{ margin: "0 0 4px", color: "#FFFFFF", fontSize: "1.3rem", fontWeight: 900 }}>Tabla de Posiciones</h2>
                          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.82rem" }}>Puntos verificados de todos los participantes.</p>
                        </div>
                        <button
                          onClick={handleReliquidarTodo}
                          disabled={reliquidandoTodo}
                          title="Borra todos los puntos y los recalcula desde cero para todos los partidos con resultado oficial. Úsalo si liquidaste un partido y la tabla no se movió."
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 18px",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            background: reliquidandoTodo ? "rgba(255,255,255,0.05)" : "#438AFF",
                            color: reliquidandoTodo ? "var(--text-muted)" : "#FFFFFF",
                            border: "none",
                            fontWeight: 900,
                            cursor: reliquidandoTodo ? "not-allowed" : "pointer",
                            boxShadow: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <RefreshCw className={reliquidandoTodo ? "spin" : ""} size={16} />
                          {reliquidandoTodo ? "Reliquidando..." : "Reliquidar Todo"}
                        </button>
                      </div>
                      {cargandoConsolidados ? (
                        <div style={{ textAlign: "center", padding: 50, background: "rgba(26, 31, 38, 0.6)", borderRadius: 24 }}>
                          <RefreshCw className="spin" size={36} style={{ color: "#438AFF", marginBottom: 16 }} />
                          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>Cargando tabla de posiciones...</div>
                        </div>
                      ) : !consolidados ? (
                        <div style={{ textAlign: "center", padding: 40, background: "rgba(26, 31, 38, 0.6)", borderRadius: 24, color: "var(--text-muted)" }}>
                          No se pudieron cargar los datos.
                        </div>
                      ) : (
                        <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "none"}}>
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
        <div className="participante-shell" style={{ maxWidth: 1232, margin: "0 auto", padding: "0 16px" }}>
          <AppTopBar
            activo={tabActiva === "mis_pronosticos" ? "finalizados" : tabActiva}
            onInicio={() => irAInicio()}
            nombreUsuario={usuario.nombre}
            onSalir={handleCerrarSesion}
            items={[
              { key: "inicio", label: "Mi jornada", icon: Home, onClick: () => irAInicio() },
              { key: "partidos", label: "Pronósticos", icon: ListChecks, onClick: () => setTabActiva("partidos") },
              { key: "posiciones", label: "Ranking", icon: BarChart3, onClick: () => { setTabActiva("posiciones"); cargarConsolidados(usuario.id); } },
              { key: "finalizados", label: "Mis resultados", icon: ClipboardCheck, onClick: () => setTabActiva("finalizados") },
              { key: "inicial", label: "Torneo", icon: Trophy, onClick: () => setTabActiva("inicial") },
              { key: "aplazados", label: "Aplazados", icon: CalendarClock, onClick: () => setTabActiva("aplazados") },
              { key: "pronosticos_todos", label: "Pronósticos de todos", icon: Users, onClick: () => { setTabActiva("pronosticos_todos"); cargarConsolidados(usuario.id); } },
              { key: "oraculo", label: "Cazador de puntos", icon: Crosshair, onClick: () => setTabActiva("oraculo") },
              { key: "estadisticas", label: "Estadísticas", icon: TrendingUp, onClick: () => { setTabActiva("estadisticas"); cargarConsolidados(usuario.id); } },
              ...(esSamuel ? [{ key: "en_vivo", label: "En vivo", icon: Radio, onClick: () => setTabActiva("en_vivo") }] : []),
            ]}
          />

          {/* INICIO CON SESIÓN: MI JORNADA */}
          {tabActiva === "inicio" && (
            <MiJornada
              usuarioId={usuario.id}
              nombre={usuario.nombre}
              fecha={fechaParticipante}
              partidosActivos={obtenerPartidosActivosParticipante()}
              partidos={partidos}
              marcadores={marcadores}
              tabla={consolidados?.tablaPosiciones ?? null}
              puntajes={consolidados?.puntajes ?? []}
              onPronosticar={abrirPronostico}
              onVerRanking={() => { setTabActiva("posiciones"); cargarConsolidados(usuario.id); }}
              onVerResultados={() => setTabActiva("finalizados")}
              onTrivia={() => setMostrarTrivia(true)}
              enVivoDe={enVivoDe}
            />
          )}

          {/* PRONÓSTICOS DE LA FECHA */}
          {tabActiva === "partidos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--s-3)" }}>
                <div>
                  <span className="eyebrow">Liga BetPlay 2026-II</span>
                  <h2 className="titulo-seccion" style={{ marginTop: 4 }}>Pronósticos · Fecha {fechaParticipante}</h2>
                </div>
                <span className="caption">Marcador exacto 5 · Ganador o empate 3 · Goleador 2 · Cierre 30 min antes</span>
              </div>

              {cargandoMaestros ? (
                <div className="empty-state">
                  <button className="btn btn-secondary" onClick={cargarMaestros}>
                    <RefreshCw size={16} /> Cargar partidos
                  </button>
                </div>
              ) : (
                <MatchDayList
                  items={obtenerPartidosActivosParticipante()}
                  fecha={(p) => p.fecha_hora_partido}
                  render={(p) => <div key={p.id} id={`partido-${p.id}`}>{renderPartidoCard(p)}</div>}
                  vacio={<div className="empty-state">No hay partidos pendientes por jugar en esta fecha.</div>}
                />
              )}
            </div>
          )}

          {/* TAB: MIS RESULTADOS Y PUNTOS (fusiona "Partidos Terminados" y "Tus Puntuaciones") */}
          {(tabActiva === "finalizados" || tabActiva === "mis_pronosticos") && usuario && (
            <MisResultadosView usuarioId={usuario.id} />
          )}

          {/* TAB: PARTIDOS APLAZADOS */}
          {tabActiva === "aplazados" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
              <div>
                <span className="eyebrow">Dimayor 2026</span>
                <h2 className="titulo-seccion" style={{ marginTop: 4 }}>Partidos aplazados</h2>
                <p className="caption" style={{ margin: "var(--s-2) 0 0", maxWidth: "68ch" }}>
                  Partidos reprogramados (incluye Deportivo Pereira vs Independiente Santa Fe, Boyacá Chicó vs Atlético Nacional y Cúcuta Deportivo vs Internacional).
                  Puedes ingresar o modificar tu pronóstico hasta 30 minutos antes de su nuevo horario.
                </p>
              </div>

              {cargandoMaestros ? (
                <div className="empty-state">Cargando partidos aplazados…</div>
              ) : (
                (() => {
                  const partidosAplazados = partidos.filter((p) => p.estado === "aplazado");
                  if (partidosAplazados.length === 0) {
                    return <div className="empty-state">No hay partidos aplazados registrados actualmente.</div>;
                  }
                  const partidosPorJornada = partidosAplazados.reduce((acc, partido) => {
                    if (!acc[partido.jornada]) acc[partido.jornada] = [];
                    acc[partido.jornada].push(partido);
                    return acc;
                  }, {} as Record<number, typeof partidosAplazados>);
                  const jornadas = Object.keys(partidosPorJornada).sort((a, b) => Number(a) - Number(b));

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
                      <div className="tabs" role="tablist" aria-label="Filtrar por fecha" style={{ alignSelf: "flex-start", maxWidth: "100%" }}>
                        <button type="button" role="tab" className="tab" aria-selected={fechaFiltroAplazados === "todas"} onClick={() => setFechaFiltroAplazados("todas")}>
                          Todas
                        </button>
                        {jornadas.map((j) => (
                          <button key={`filtro-aplazado-${j}`} type="button" role="tab" className="tab" aria-selected={fechaFiltroAplazados === j} onClick={() => setFechaFiltroAplazados(j)}>
                            Fecha {j}
                          </button>
                        ))}
                      </div>

                      {jornadas
                        .filter((j) => fechaFiltroAplazados === "todas" || fechaFiltroAplazados === j)
                        .map((jornadaStr) => {
                          const partidosDeLaJornada = partidosPorJornada[Number(jornadaStr)];
                          return (
                            <section key={`aplazados-jornada-${jornadaStr}`} style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
                              <h4 style={{ margin: 0, display: "flex", alignItems: "baseline", gap: "var(--s-2)" }}>
                                Fecha {jornadaStr}
                                <span className="caption">{partidosDeLaJornada.length} {partidosDeLaJornada.length === 1 ? "partido" : "partidos"}</span>
                              </h4>
                              <MatchDayList
                                items={partidosDeLaJornada}
                                fecha={(p) => p.fecha_hora_partido}
                                render={(p) => <div key={p.id} id={`partido-${p.id}`}>{renderPartidoCard(p)}</div>}
                              />
                            </section>
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
                  background: "rgba(26, 31, 38, 0.9)",
                  border: "1px solid var(--cancha-borde)",
                  padding: "24px",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <span
                    className="badge badge-cancha"
                    style={{ fontSize: "0.85rem", textTransform: "uppercase", marginBottom: 8 }}
                  >
                    Sistema Oficial de Puntuación
                  </span>
                  <h2 style={{ fontSize: "1.4rem", margin: "4px 0 0 0", color: "#FFFFFF" }}>
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
                  {/* BOTÓN CAMPEÓN */}
                  <div
                    onClick={() => setModalPrediccionAbierto("campeon")}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(239, 204, 54, 0.3)",
                      borderRadius: 12,
                      padding: "16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: "none",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.background = "rgba(239, 204, 54, 0.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 4 }}></div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#FFFFFF" }}>Campeón del Torneo</div>
                    
                    {campeonId ? (
                      <div style={{ marginTop: 10, background: "rgba(116, 204, 16, 0.2)", padding: "6px", borderRadius: 8, color: "var(--cancha)", fontWeight: 800 }}>
                        {equipos.find(e => e.id === campeonId)?.nombre}
                      </div>
                    ) : (
                      <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--cancha)", marginTop: 6 }}>
                        30 <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>PTS</span>
                      </div>
                    )}
                  </div>

                  {/* BOTÓN FINALISTAS */}
                  <div
                    onClick={() => setModalPrediccionAbierto("finalistas")}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(67, 138, 255, 0.3)",
                      borderRadius: 12,
                      padding: "16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: "none",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.background = "rgba(67, 138, 255, 0.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 4 }}></div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#FFFFFF" }}>Finalistas</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--graderia)" }}>(por equipo acertado)</div>
                    
                    {(finalista1Id || finalista2Id) ? (
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                        {finalista1Id && <div style={{ background: "rgba(67, 138, 255, 0.15)", padding: "4px", borderRadius: 6, color: "#438AFF", fontWeight: 700, fontSize: "0.8rem" }}>{equipos.find(e => e.id === finalista1Id)?.nombre}</div>}
                        {finalista2Id && <div style={{ background: "rgba(67, 138, 255, 0.15)", padding: "4px", borderRadius: 6, color: "#438AFF", fontWeight: 700, fontSize: "0.8rem" }}>{equipos.find(e => e.id === finalista2Id)?.nombre}</div>}
                      </div>
                    ) : (
                      <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--cancha)", marginTop: 2 }}>
                        25 <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>PTS</span>
                      </div>
                    )}
                  </div>

                  {/* BOTÓN CLASIFICADOS */}
                  <div
                    onClick={() => setModalPrediccionAbierto("clasificados")}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(116, 204, 16, 0.3)",
                      borderRadius: 12,
                      padding: "16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: "none",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.background = "rgba(116, 204, 16, 0.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 4 }}></div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#FFFFFF" }}>Clasificados Cuadrangulares</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--graderia)" }}>(por equipo acertado)</div>
                    
                    {clasificadosIds.length > 0 ? (
                      <div style={{ marginTop: 10, background: clasificadosIds.length === 8 ? "rgba(116, 204, 16, 0.2)" : "rgba(255, 255, 255, 0.1)", padding: "6px", borderRadius: 8, color: clasificadosIds.length === 8 ? "var(--cancha)" : "#FFFFFF", fontWeight: 800 }}>
                        {clasificadosIds.length} / 8 Seleccionados
                      </div>
                    ) : (
                      <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--cancha)", marginTop: 2 }}>
                        20 <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>PTS</span>
                      </div>
                    )}
                  </div>

                  {/* BOTÓN GOLEADOR */}
                  <div
                    onClick={() => setModalPrediccionAbierto("goleador")}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(234, 61, 53, 0.3)",
                      borderRadius: 12,
                      padding: "16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: "none",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.background = "rgba(234, 61, 53, 0.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 4 }}></div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#FFFFFF" }}>Goleador del Torneo</div>
                    
                    {goleadorTorneoId ? (
                      <div style={{ marginTop: 10, background: "rgba(234, 61, 53, 0.15)", padding: "6px", borderRadius: 8, color: "#EA3D35", fontWeight: 800 }}>
                        {jugadores.find(j => j.id === goleadorTorneoId)?.nombre}
                      </div>
                    ) : (
                      <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--cancha)", marginTop: 6 }}>
                        15 <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>PTS</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* VENTANAS FLOTANTES (MODALS) PARA PREDICCIONES */}
              {modalPrediccionAbierto && (
                <div style={{
                  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                  background: "rgba(4, 6, 10, 0.8)", backdropFilter: "blur(4px)",
                  display: "flex", justifyContent: "center", alignItems: "center",
                  zIndex: 9999, padding: 20
                }}>
                  <div style={{
                    background: "#04060A", border: "1px solid var(--borde)", borderRadius: 16,
                    width: "100%", maxWidth: 500, overflow: "hidden", boxShadow: "none"}}>
                    {/* Header del Modal */}
                    <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--borde)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "1.2rem", fontWeight: 800 }}>
                        {modalPrediccionAbierto === "campeon" && "Elegir Campeón"}
                        {modalPrediccionAbierto === "finalistas" && "Elegir Finalistas"}
                        {modalPrediccionAbierto === "clasificados" && "Elegir Clasificados"}
                        {modalPrediccionAbierto === "goleador" && "Elegir Goleador"}
                      </h3>
                      <button onClick={() => setModalPrediccionAbierto(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                        <X size={24} />
                      </button>
                    </div>

                    {/* Contenido del Modal */}
                    <div style={{ padding: "24px", maxHeight: "60vh", overflowY: "auto" }}>
                      {modalPrediccionAbierto === "campeon" && (
                        <div>
                          <p style={{ color: "var(--graderia)", marginBottom: 16, fontSize: "0.9rem" }}>Selecciona al equipo que crees que ganará el campeonato (30 Pts).</p>
                          <select className="input" value={campeonId} onChange={(e) => setCampeonId(e.target.value ? Number(e.target.value) : "")}>
                            <option value="">-- Seleccionar Campeón --</option>
                            {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                          </select>
                        </div>
                      )}

                      {modalPrediccionAbierto === "finalistas" && (
                        <div>
                          <p style={{ color: "var(--graderia)", marginBottom: 16, fontSize: "0.9rem" }}>Selecciona a los 2 equipos que llegarán a la gran final (25 Pts c/u).</p>
                          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#E5E7EB" }}>Finalista 1</label>
                          <select className="input" style={{ marginBottom: 20 }} value={finalista1Id} onChange={(e) => setFinalista1Id(e.target.value ? Number(e.target.value) : "")}>
                            <option value="">-- Seleccionar Finalista 1 --</option>
                            {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                          </select>
                          
                          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#E5E7EB" }}>Finalista 2</label>
                          <select className="input" value={finalista2Id} onChange={(e) => setFinalista2Id(e.target.value ? Number(e.target.value) : "")}>
                            <option value="">-- Seleccionar Finalista 2 --</option>
                            {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                          </select>
                        </div>
                      )}

                      {modalPrediccionAbierto === "clasificados" && (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <p style={{ color: "var(--graderia)", margin: 0, fontSize: "0.9rem", flex: 1 }}>Selecciona los 8 equipos que avanzarán a cuadrangulares (20 Pts c/u).</p>
                            <span className={`badge ${clasificadosIds.length === 8 ? "badge-cancha" : "badge-trofeo"}`}>{clasificadosIds.length} / 8</span>
                          </div>
                          <div className="grid-clasificados" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                            {equipos.map(eq => {
                              const seleccionado = clasificadosIds.includes(eq.id);
                              return (
                                <div key={eq.id} onClick={() => toggleClasificado(eq.id)} style={{
                                  padding: "8px 10px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", fontWeight: 600,
                                  border: `1px solid ${seleccionado ? "var(--cancha)" : "var(--linea)"}`, background: seleccionado ? "var(--cancha-suave)" : "var(--noche-2)",
                                }}>
                                  <img src={eq.escudo_url || "https://placehold.co/30x30/1e3145/ffffff?text=FPC"} alt={eq.nombre} style={{ width: 22, height: 22, objectFit: "contain" }} />
                                  <span style={{ flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{eq.nombre}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {modalPrediccionAbierto === "goleador" && (
                        <div>
                          <p style={{ color: "var(--graderia)", marginBottom: 16, fontSize: "0.9rem" }}>Selecciona al jugador que terminará como máximo anotador (15 Pts).</p>
                          <select className="input" value={goleadorTorneoId} onChange={(e) => setGoleadorTorneoId(e.target.value ? Number(e.target.value) : "")}>
                            <option value="">-- Seleccionar Goleador --</option>
                            {Object.entries(
                              jugadores.reduce((acc: { [key: string]: Jugador[] }, j) => {
                                const eq = j.equipo?.nombre || "Otros / Sin Equipo";
                                if (!acc[eq]) acc[eq] = [];
                                acc[eq].push(j);
                                return acc;
                              }, {})
                            ).map(([equipoNombre, jugList]) => (
                              <optgroup key={equipoNombre} label={equipoNombre}>
                                {jugList.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Footer del Modal */}
                    <div style={{ padding: "16px 24px", background: "rgba(4, 6, 10, 0.2)", borderTop: "1px solid var(--borde)", textAlign: "right" }}>
                      <button className="btn btn-primary" onClick={() => setModalPrediccionAbierto(null)} style={{ padding: "10px 24px", borderRadius: 8, fontWeight: 700 }}>
                        Hecho
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                    boxShadow: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Save size={20} />
                  {guardandoInicial ? "Guardando..." : "Guardar predicciones"}
                </button>
              </div>

              {/* AFICHE DE PREDICCIONES DE TODOS LOS USUARIOS */}
              {consolidados?.prediccionesIniciales && consolidados.prediccionesIniciales.length > 0 && (
                <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24 }}>
                  <PronosticosTorneoAfiche predicciones={consolidados.prediccionesIniciales} />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MIS PRONÓSTICOS & TUS PUNTUACIONES */}
          {/* TAB 4: POSICIONES & PUNTOS EN VIVO */}
          {tabActiva === "posiciones" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--s-3)" }}>
                <div>
                  <span className="eyebrow">Polla Liga BetPlay 2026-II</span>
                  <h2 className="titulo-seccion" style={{ marginTop: 4 }}>Ranking</h2>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-2)" }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMostrarHistorialPuntos(true)}>
                    <BarChart3 size={16} /> De dónde salieron mis puntos
                  </button>
                  <button type="button" className="btn btn-text btn-sm" onClick={() => setMostrarAficheRanking((v) => !v)} aria-expanded={mostrarAficheRanking}>
                    {mostrarAficheRanking ? "Ocultar afiche" : "Afiche para compartir"}
                  </button>
                </div>
              </div>

              {cargandoConsolidados && !consolidados ? (
                <div className="empty-state">
                  <RefreshCw className="spin" size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />
                  Cargando ranking…
                </div>
              ) : !consolidados ? (
                <div className="empty-state" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--s-3)" }}>
                  No se pudo cargar el ranking.
                  <button className="btn btn-secondary btn-sm" onClick={() => cargarConsolidados(usuario.id)}>
                    <RefreshCw size={16} /> Reintentar
                  </button>
                </div>
              ) : (
                <>
                  <Leaderboard
                    tabla={consolidados.tablaPosiciones || []}
                    puntajes={consolidados.puntajes || []}
                    partidos={partidos}
                    usuarioId={usuario.id}
                  />
                  {mostrarAficheRanking && (
                    <TablaPosicionesAfiche
                      tabla={consolidados.tablaPosiciones || []}
                      prediccionesPartidos={consolidados.prediccionesPartidos || []}
                      prediccionesIniciales={consolidados.prediccionesIniciales || []}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB PRONÓSTICOS DE TODOS: se revela por partido una vez cierran los pronósticos */}
          {tabActiva === "pronosticos_todos" && (
            <div>
              {cargandoConsolidados ? (
                <div className="empty-state">
                  <RefreshCw className="spin" size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />
                  Cargando pronósticos…
                </div>
              ) : !consolidados ? (
                <div className="card" style={{ textAlign: "center", padding: 40 }}>
                  <p style={{ marginBottom: 16, color: "var(--text-muted)" }}>No se pudieron cargar los pronósticos.</p>
                  <button className="btn btn-primary" onClick={() => cargarConsolidados(usuario.id)}>
                    Recargar
                  </button>
                </div>
              ) : (
                (() => {
                  const fechaActivaVisual = fechaPronosticosTodos ?? fechaParticipante;
                  const fechasDisponibles = Array.from(new Set(partidos.map((p: any) => p.jornada))).sort((a: number, b: number) => a - b);
                  const listaFechas = fechasDisponibles.length > 0 ? fechasDisponibles : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

                  const partidosFecha = partidos
                    .filter((p) => {
                      const jornadaOrigen = p.jornada_original || p.jornada;
                      if (p.jornada === fechaActivaVisual || jornadaOrigen === fechaActivaVisual) return true;
                      if (fechaActivaVisual === fechaParticipante && jornadaOrigen < fechaParticipante && p.estado === "programado") return true;
                      return false;
                    })
                    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());

                  const estaFinalizado = (partido: any) => {
                    if (esPartidoFinalizadoReal(partido, partidosEnVivo)) return true;
                    return new Date().getTime() >= new Date(partido.fecha_hora_partido).getTime() + 2 * 60 * 60 * 1000;
                  };

                  const partidosPendientes = partidosFecha.filter((p) => !estaFinalizado(p));
                  const partidosFinalizados = partidosFecha.filter((p) => estaFinalizado(p));
                  const listaMostrada = filtroPronosticosTodos === "todos"
                    ? partidosFecha
                    : filtroPronosticosTodos === "pendientes"
                      ? partidosPendientes
                      : partidosFinalizados;

                  const esAdminOEsSamuel = esSamuel || usuario?.rol_id === 2;

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--s-3)" }}>
                        <div>
                          <span className="eyebrow">Comunidad</span>
                          <h2 className="titulo-seccion" style={{ marginTop: 4 }}>Pronósticos de todos</h2>
                          <p className="caption" style={{ margin: "var(--s-1) 0 0" }}>
                            Los pronósticos de cada partido se revelan 30 minutos antes del inicio.
                          </p>
                        </div>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => cargarConsolidados(usuario.id)}>
                          <RefreshCw size={14} className={cargandoConsolidados ? "spin" : ""} /> Recargar
                        </button>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--s-3)" }}>
                        <DateNavigator
                          valor={fechaActivaVisual}
                          opciones={listaFechas}
                          onCambio={(f) => setFechaPronosticosTodos(f)}
                          etiqueta={(f) => (f === fechaParticipante ? `Fecha ${f} · actual` : `Fecha ${f}`)}
                        />
                        <div className="tabs" role="tablist" aria-label="Filtrar partidos">
                          {([
                            ["todos", `Todos (${partidosFecha.length})`],
                            ["pendientes", `Pendientes (${partidosPendientes.length})`],
                            ["finalizados", `Finalizados (${partidosFinalizados.length})`],
                          ] as const).map(([k, t]) => (
                            <button key={k} type="button" role="tab" className="tab" aria-selected={filtroPronosticosTodos === k} onClick={() => setFiltroPronosticosTodos(k)}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <MatchDayList
                        items={listaMostrada}
                        fecha={(p) => p.fecha_hora_partido}
                        vacio={
                          <div className="empty-state">
                            {filtroPronosticosTodos === "pendientes"
                              ? `No hay partidos pendientes en la Fecha ${fechaActivaVisual}.`
                              : filtroPronosticosTodos === "finalizados"
                                ? `Todavía no hay partidos finalizados en la Fecha ${fechaActivaVisual}.`
                                : `No hay partidos en la Fecha ${fechaActivaVisual}.`}
                          </div>
                        }
                        render={(partido) => {
                          const horaCierre = new Date(new Date(partido.fecha_hora_partido).getTime() - 30 * 60 * 1000);
                          const cerrado = new Date() >= horaCierre || partido.estado === "finalizado";
                          const puedeVerPronosticos = cerrado || esAdminOEsSamuel;
                          const pronosticosPartido = (consolidados?.prediccionesPartidos || [])
                            .filter((p: any) => p.partido_id === partido.id)
                            .sort((a: any, b: any) => {
                              const timeA = a.timestamp_envio ? new Date(a.timestamp_envio).getTime() : 0;
                              const timeB = b.timestamp_envio ? new Date(b.timestamp_envio).getTime() : 0;
                              return timeA - timeB;
                            });
                          const desplegado = partidoPronosticosAbierto === partido.id;
                          const ro = partido.resultado_oficial;

                          return (
                            <MatchRow
                              key={partido.id}
                              fechaHora={partido.fecha_hora_partido}
                              local={partido.equipo_local}
                              visitante={partido.equipo_visitante}
                              marcador={ro && estaFinalizado(partido) ? `${ro.goles_local_real} – ${ro.goles_visitante_real}` : null}
                              abierto={puedeVerPronosticos && desplegado}
                              onToggle={puedeVerPronosticos ? () => setPartidoPronosticosAbierto(desplegado ? null : partido.id) : undefined}
                              etiquetaAccion="Ver pronósticos"
                              estado={
                                !puedeVerPronosticos ? (
                                  <span className="badge badge-neutral">
                                    <Lock size={12} aria-hidden="true" /> Se revela al cerrar
                                  </span>
                                ) : (
                                  <>
                                    {!cerrado && esAdminOEsSamuel && <span className="badge badge-warn">Admin</span>}
                                    <span className="badge badge-info">
                                      <Users size={12} aria-hidden="true" /> <span className="num">{pronosticosPartido.length}</span>
                                    </span>
                                  </>
                                )
                              }
                            >
                              {pronosticosPartido.length === 0 ? (
                                <div className="empty-state">Nadie envió pronóstico para este partido.</div>
                              ) : (
                                <PronosticosPartidoAfiche
                                  partido={partido}
                                  pronosticos={pronosticosPartido}
                                  obtenerNombreGoleador={obtenerNombreGoleador}
                                />
                              )}
                            </MatchRow>
                          );
                        }}
                      />
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* TAB EN VIVO: PARTIDOS Y ESTADÍSTICAS EN VIVO (SOLO SAMUEL) */}
          {tabActiva === "en_vivo" && esSamuel && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                className="card"
                style={{
                  background: "rgba(26, 31, 38, 0.95)",
                  border: "1px solid rgba(234, 61, 53, 0.4)",
                  borderRadius: 16,
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#EA3D35", boxShadow: "none"}} />
                      <h2 style={{ margin: 0, color: "#FFFFFF", fontSize: "1.3rem", fontWeight: 900 }}>
                        Partidos y Cancha 2D En Vivo
                      </h2>
                    </div>
                    <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.88rem" }}>
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
                    <RefreshCw className="spin" size={28} style={{ color: "#EA3D35" }} />
                  </div>
                ) : partidosEnVivo.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 36, background: "rgba(4, 6, 10, 0.2)", borderRadius: 12, border: "1px dashed var(--linea)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}></div>
                    <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>No hay partidos en curso en este momento</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
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
                            border: p.esEnVivo ? "1px solid rgba(234, 61, 53, 0.5)" : "1px solid var(--linea)",
                            borderRadius: 12,
                            padding: 18,
                            boxShadow: "none",
                          }}
                        >
                          {/* ENCABEZADO PARTIDO */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: "0.82rem", color: "var(--graderia)", borderBottom: "1px dashed var(--linea)", paddingBottom: 8, flexWrap: "wrap", gap: 8 }}>
                            <span style={{ fontWeight: 700, color: "var(--cancha)" }}>
                              {p.estadio}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {p.esEnVivo ? (
                                <span style={{ background: "rgba(234, 61, 53, 0.25)", color: "#EA3D35", border: "1px solid rgba(234, 61, 53, 0.6)", padding: "4px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "none"}}>
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EA3D35", boxShadow: "none"}} />
                                  EN VIVO {p.reloj}
                                </span>
                              ) : p.esFinalizado ? (
                                <span style={{ background: "rgba(116, 204, 16, 0.2)", color: "#74CC10", border: "1px solid rgba(116, 204, 16, 0.4)", padding: "4px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 800 }}>
                                  FINALIZADO
                                </span>
                              ) : (
                                <span style={{ background: "var(--noche-2)", color: "#FFFFFF", padding: "4px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 }}>
                                  {p.estadoDetail}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* TABLERO DE MARCADOR */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, margin: "14px 0" }}>
                            {/* LOCAL */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, textAlign: "right" }}>
                              <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#FFFFFF" }}>
                                {p.equipoLocal.nombre}
                              </span>
                              {p.equipoLocal.escudo && (
                                <img src={p.equipoLocal.escudo} alt={p.equipoLocal.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                              )}
                            </div>

                            {/* CAJA MARCADOR */}
                            <div style={{ background: "var(--noche-2)", padding: "8px 22px", borderRadius: 10, border: "1px solid var(--cancha-borde)", display: "flex", alignItems: "center", gap: 8, fontSize: "1.6rem", fontWeight: 900, color: "#FFFFFF" }}>
                              <span>{p.equipoLocal.goles}</span>
                              <span style={{ color: "var(--graderia)", fontSize: "1.2rem" }}>:</span>
                              <span>{p.equipoVisitante.goles}</span>
                            </div>

                            {/* VISITANTE */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 10, textAlign: "left" }}>
                              {p.equipoVisitante.escudo && (
                                <img src={p.equipoVisitante.escudo} alt={p.equipoVisitante.nombre} style={{ width: 36, height: 36, objectFit: "contain" }} />
                              )}
                              <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#FFFFFF" }}>
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
                                color: "#438AFF",
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
                              <span>Cancha 2D y Estadísticas</span>
                              <span>{estaDesplegado ? "▲" : "▼"}</span>
                            </button>
                          </div>

                          {/* CONTENIDO DESPLEGABLE */}
                          {estaDesplegado && (
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--linea)", background: "rgba(4, 6, 10, 0.2)", borderRadius: 10, padding: 16 }}>
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
                                    background: subTab === "cancha" ? "#74CC10" : "rgba(255,255,255,0.08)",
                                    color: subTab === "cancha" ? "#FFFFFF" : "var(--graderia)",
                                  }}
                                >
                                  Cancha 2D En Vivo
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
                                    background: subTab === "stats" ? "#438AFF" : "rgba(255,255,255,0.08)",
                                    color: subTab === "stats" ? "#FFFFFF" : "var(--graderia)",
                                  }}
                                >
                                  Estadísticas
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

          {/* CAZADOR DE PUNTOS: recomendaciones + tabla de la liga + asistente (fusiona "Recomendaciones y Datos") */}
          {tabActiva === "oraculo" && <CazadorDePuntosView partidos={partidos} />}

          {/* ESTADÍSTICAS INDIVIDUALES: efectividad por equipo, rachas y tipo de pronosticador */}
          {tabActiva === "estadisticas" && (
            <EstadisticasView usuarioId={usuario.id} predicciones={consolidados?.prediccionesPartidos ?? []} />
          )}

        </div>
      )}

      {/* MODAL DE TRIVIA */}
      {mostrarTrivia && <TriviaModal onClose={() => setMostrarTrivia(false)} />}
      {mostrarHistorialPuntos && usuario && (
        <HistorialPuntosModal
          usuarioId={usuario.id}
          nombreUsuario={usuario.nombre}
          onClose={() => setMostrarHistorialPuntos(false)}
        />
      )}

      {/* MODAL EMERGENTE: PLANTILLAS DE JUGADORES */}
      {mostrarModalPlantilla && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(4, 6, 10, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setMostrarModalPlantilla(false)}
        >
          <div
            style={{
              background: "rgba(26, 31, 38, 0.96)",
              border: "1px solid rgba(67, 138, 255, 0.4)",
              borderRadius: "24px",
              boxShadow: "none",
              maxWidth: "760px",
              width: "100%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(4, 6, 10, 0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {equipoModalId !== "todas" && (equipos.find(e => e.id === Number(equipoModalId))?.escudo_url) ? (
                  <img
                    src={equipos.find(e => e.id === Number(equipoModalId))?.escudo_url}
                    alt="Escudo"
                    style={{ width: 36, height: 36, objectFit: "contain" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "12px",
                      background: "#438AFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#04060A",
                      fontWeight: 900,
                    }}
                  >
                    
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "1.15rem", fontWeight: 900 }}>
                    {equipoModalId === "todas"
                      ? "Plantillas Registradas (Todos los Equipos)"
                      : `Plantilla: ${equipos.find(e => e.id === Number(equipoModalId))?.nombre || "Equipo"}`}
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#438AFF", fontWeight: 700 }}>
                    {equipoModalId === "todas"
                      ? `${jugadores.length} jugadores en total`
                      : `${jugadores.filter(j => j.equipo_id === Number(equipoModalId)).length} jugadores registrados`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalPlantilla(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "#FFFFFF",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontWeight: 900,
                  fontSize: "1rem",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(234, 61, 53, 0.4)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
              >
                ✕
              </button>
            </div>

            {/* Selector de equipo dentro del Modal */}
            <div
              style={{
                padding: "12px 24px",
                background: "rgba(4, 6, 10, 0.2)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 700 }}>
                Cambiar Equipo:
              </span>
              <select
                value={equipoModalId}
                onChange={(e) => setEquipoModalId(e.target.value === "todas" ? "todas" : Number(e.target.value))}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(26, 31, 38, 0.9)",
                  color: "#FFFFFF",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  flex: 1,
                  minWidth: 200,
                }}
              >
                <option value="todas">Todos los Equipos ({jugadores.length} jugadores)</option>
                {equipos.map((eq) => {
                  const cant = jugadores.filter((j) => j.equipo_id === eq.id).length;
                  return (
                    <option key={eq.id} value={eq.id}>
                      {eq.nombre} ({cant} jugadores)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Cuerpo / Lista de Jugadores */}
            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              {(() => {
                const listaAMostrar = equipoModalId === "todas"
                  ? jugadores
                  : jugadores.filter((j) => j.equipo_id === Number(equipoModalId));

                if (listaAMostrar.length === 0) {
                  return (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", background: "rgba(4, 6, 10, 0.2)", borderRadius: 16 }}>
                      No hay jugadores registrados en esta plantilla.
                    </div>
                  );
                }

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
                    {listaAMostrar.map((j) => {
                      const eq = j.equipo || equipos.find((e) => e.id === j.equipo_id);
                      return (
                        <div
                          key={j.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                            padding: "12px 14px",
                            borderRadius: "14px",
                            background: "rgba(26, 31, 38, 0.6)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            {eq?.escudo_url ? (
                              <img src={eq.escudo_url} alt={eq.nombre} style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "#FFFFFF", fontWeight: 900 }}>
                                
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: "0.9rem", color: "#FFFFFF", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {j.nombre}
                              </div>
                              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 600 }}>
                                {eq?.nombre || `Equipo ID: ${j.equipo_id}`}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEliminarJugador(j.id, j.nombre)}
                            title={`Eliminar ${j.nombre}`}
                            style={{
                              background: "rgba(234, 61, 53, 0.15)",
                              border: "1px solid rgba(234, 61, 53, 0.3)",
                              color: "#EA3D35",
                              width: 28,
                              height: 28,
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              flexShrink: 0,
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(234, 61, 53, 0.35)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(234, 61, 53, 0.15)")}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer del Modal */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(4, 6, 10, 0.3)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setMostrarModalPlantilla(false)}
                style={{
                  padding: "10px 22px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
      {mensajeEstado && (
        <div
          className="fixed-toast"
          style={{
            position: "fixed",
            bottom: "40px",
            right: "40px",
            zIndex: 999999,
            padding: "16px 24px",
            borderRadius: "16px",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: 14,
            background:
              mensajeEstado.tipo === "exito"
                ? "rgba(26, 31, 38, 0.95)"
                : mensajeEstado.tipo === "error"
                  ? "rgba(234, 61, 53, 0.95)"
                  : "rgba(67, 138, 255, 0.95)",
            backdropFilter: "blur(12px)",
            color: "#FFFFFF",
            border: `1px solid ${
              mensajeEstado.tipo === "exito"
                ? "rgba(116, 204, 16, 0.5)"
                : mensajeEstado.tipo === "error"
                  ? "rgba(234, 61, 53, 0.5)"
                  : "rgba(67, 138, 255, 0.5)"
            }`,
            boxShadow: "none",
            animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {mensajeEstado.tipo === "exito" && <CheckCircle2 size={26} style={{ color: "#74CC10", flexShrink: 0 }} />}
          {mensajeEstado.tipo === "error" && <ShieldAlert size={26} style={{ color: "#EA3D35", flexShrink: 0 }} />}
          {mensajeEstado.tipo === "info" && <ShieldAlert size={26} style={{ color: "#438AFF", flexShrink: 0 }} />}
          <div style={{ fontWeight: 600, letterSpacing: "0.2px" }}>{mensajeEstado.texto}</div>
        </div>
      )}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 768px) {
          /* En móviles lo ponemos arriba para que se vea mejor */
          .fixed-toast {
            top: 20px !important;
            bottom: auto !important;
            right: 20px !important;
            left: 20px !important;
            animation: slideInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        }
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
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
