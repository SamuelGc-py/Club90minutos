"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldAlert, Save, RefreshCw, Trophy, Calendar, LogOut, AlertTriangle, UserCheck, Lock, Clock, Eye, List, Download, Users } from "lucide-react";
import Link from "next/link";
import TablaPosicionesAfiche from "./components/TablaPosicionesAfiche";

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

function RelojCuentaRegresiva({ fechaHoraPartido }: { fechaHoraPartido: string }) {
  const [tiempoRestante, setTiempoRestante] = useState<string>("");
  const [cerrado, setCerrado] = useState<boolean>(false);

  useEffect(() => {
    function calcular() {
      const horaPartido = new Date(fechaHoraPartido).getTime();
      const horaCierre = horaPartido - 60 * 60 * 1000; // 1 hora antes del inicio
      const ahora = new Date().getTime();
      const dif = horaCierre - ahora;

      if (dif <= 0) {
        setCerrado(true);
        setTiempoRestante("🔒 Cerrado (1h antes)");
      } else {
        setCerrado(false);
        const hrs = Math.floor(dif / (1000 * 60 * 60));
        const mins = Math.floor((dif % (1000 * 60 * 60)) / (1000 * 60));
        const segs = Math.floor((dif % (1000 * 60)) / 1000);
        setTiempoRestante(`⏳ Cierra en: ${hrs}h ${mins}m ${segs}s`);
      }
    }

    calcular();
    const interval = setInterval(calcular, 1000);
    return () => clearInterval(interval);
  }, [fechaHoraPartido]);

  return (
    <span
      style={{
        fontSize: "0.78rem",
        fontWeight: 800,
        padding: "4px 10px",
        borderRadius: "20px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: cerrado ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
        color: cerrado ? "#ef4444" : "#22c55e",
        border: `1px solid ${cerrado ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
      }}
    >
      <Clock size={13} /> {tiempoRestante}
    </span>
  );
}

export default function ExpressPage() {
  // Estado de sesión
  const [correoInput, setCorreoInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [cargandoValidacion, setCargandoValidacion] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<{ tipo: "error" | "info" | "exito"; texto: string } | null>(null);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  // Estado de datos maestros
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargandoMaestros, setCargandoMaestros] = useState(false);

  // Estado del Formulario (Pestañas)
  const [tabActiva, setTabActiva] = useState<"partidos" | "inicial" | "mis_pronosticos" | "admin">("partidos");
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

  // Cargar datos maestros (Equipos, Jugadores, Partidos)
  useEffect(() => {
    async function cargarMaestros() {
      setCargandoMaestros(true);
      try {
        const res = await fetch("/api/datos-maestros");
        const data = await res.json();
        if (data.equipos) setEquipos(data.equipos);
        if (data.jugadores) setJugadores(data.jugadores);
        if (data.partidos) setPartidos(data.partidos);
      } catch (err) {
        console.error("Error al cargar datos maestros:", err);
      } finally {
        setCargandoMaestros(false);
      }
    }
    cargarMaestros();
  }, []);

  // Validar correo y contraseña en PostgreSQL
  const handleValidarCorreo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correoInput.trim() || !passwordInput.trim()) return;

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
      setMensajeEstado({ tipo: "exito", texto: `¡Bienvenido(a) ${data.usuario.nombre}! Acceso concedido.` });

      if (data.usuario.rol_id === 2) {
        cargarConsolidados(data.usuario.id);
      }

      // Cargar pronósticos previos si existen
      if (data.prediccionesGuardadas) {
        const { inicial, partidos: predsPartidos } = data.prediccionesGuardadas;
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
            const gLocal = String(p.goles_local_predicho);
            const gVisitante = String(p.goles_visitante_predicho);
            let ganadorCalc: "local" | "empate" | "visitante" = "empate";
            if (Number(gLocal) > Number(gVisitante)) ganadorCalc = "local";
            else if (Number(gLocal) < Number(gVisitante)) ganadorCalc = "visitante";

            mapMarcadores[p.partido_id] = {
              local: gLocal,
              visitante: gVisitante,
              ganador: ganadorCalc,
              goleador_id: p.jugador_goleador_predicho_id ? String(p.jugador_goleador_predicho_id) : "",
            };
          });
          setMarcadores(mapMarcadores);
        }
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
      if (nuevoLocal !== "" && nuevoVisitante !== "") {
        const nL = Number(nuevoLocal);
        const nV = Number(nuevoVisitante);
        if (nL > nV) nuevoGanador = "local";
        else if (nL < nV) nuevoGanador = "visitante";
        else nuevoGanador = "empate";
      }

      return {
        ...prev,
        [partidoId]: {
          ...actual,
          local: nuevoLocal,
          visitante: nuevoVisitante,
          ganador: nuevoGanador,
        },
      };
    });
  };

  // Cambio manual del ganador predicho
  const handleGanadorChange = (partidoId: number, nuevoGanador: "local" | "empate" | "visitante") => {
    setMarcadores((prev) => ({
      ...prev,
      [partidoId]: {
        ...(prev[partidoId] || { local: "", visitante: "", goleador_id: "" }),
        ganador: nuevoGanador,
      },
    }));
  };

  // Cambio de goleador predicho
  const handleGoleadorChange = (partidoId: number, goleadorId: string) => {
    setMarcadores((prev) => ({
      ...prev,
      [partidoId]: {
        ...(prev[partidoId] || { local: "", visitante: "", ganador: "" }),
        goleador_id: goleadorId,
      },
    }));
  };

  // VALIDAR RESTRICCIÓN DE COHERENCIA ENTRE MARCADOR Y GANADOR
  const validarCoherenciaPronosticos = (): string | null => {
    for (const partido of partidos) {
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
      }
    }
    return null;
  };

  // Cerrar Sesión
  const handleCerrarSesion = () => {
    setUsuario(null);
    setCorreoInput("");
    setPasswordInput("");
    setMensajeEstado(null);
  };

  // Descargar Excel de Pronósticos por Partido (Diseño exacto Imagen 2)
  const handleDescargarExcelPronosticos = async (partidoId?: number) => {
    if (!usuario) return;
    try {
      setMensajeEstado({ tipo: "info", texto: "Generando Excel con formato... Esto puede tardar unos segundos." });
      const url = partidoId 
        ? `/api/consolidados/excel?usuario_id=${usuario.id}&partido_id=${partidoId}`
        : `/api/consolidados/excel?usuario_id=${usuario.id}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al descargar el archivo");
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Pronosticos_Partidos_Polla_BetPlay_${new Date().toISOString().slice(0, 10)}.xlsx`;
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
        setMensajeEstado({ tipo: "exito", texto: "¡Tus pronósticos se han guardado exitosamente!" });
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
    <div style={{ paddingBottom: 80 }}>
      {/* PANTALLA DE INGRESO PRIVADA */}
      {!usuario ? (
        <div style={{ maxWidth: 440, margin: "60px auto 0" }}>
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "40px 32px",
              background: "linear-gradient(180deg, var(--tribuna) 0%, var(--noche-2) 100%)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              border: "1px solid var(--linea-fuerte)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--cancha-suave)",
                border: "1px solid var(--cancha-borde)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--cancha)",
                marginBottom: 16,
              }}
            >
              <Lock size={28} />
            </div>

            <h1 style={{ fontSize: "1.75rem", marginBottom: 6 }}>Acceso Privado</h1>
            <p style={{ color: "var(--graderia)", fontSize: "0.9rem", marginBottom: 28 }}>
              Ingresa el correo electrónico con el que fuiste registrado para acceder a tus pronósticos.
            </p>

            <form onSubmit={handleValidarCorreo} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "left" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--graderia)", marginBottom: 6, display: "block" }}>
                  Correo electrónico autorizado:
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="ejemplo@correo.com"
                  value={correoInput}
                  onChange={(e) => setCorreoInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--graderia)", margin: 0 }}>
                    Contraseña de acceso:
                  </label>
                  <Link href="/recuperar-password" style={{ fontSize: "0.75rem", color: "var(--cesped)", textDecoration: "none", fontWeight: 600 }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={cargandoValidacion} style={{ width: "100%", padding: "14px 20px" }}>
                {cargandoValidacion ? (
                  <>
                    <RefreshCw className="spin" size={18} /> Validando acceso...
                  </>
                ) : (
                  "Ingresar a mis Pronósticos"
                )}
              </button>
            </form>

            {mensajeEstado && (
              <div
                style={{
                  marginTop: 20,
                  padding: "14px 16px",
                  borderRadius: 10,
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
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
                  border: `1px solid ${
                    mensajeEstado.tipo === "exito"
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
      ) : usuario.rol_id === 2 ? (
        /* ================= VISTA EXCLUSIVA DASHBOARD ADMINISTRADOR ================= */
        <div>
          {/* BARRA SUPERIOR DASHBOARD ADMIN */}
          <div
            className="card"
            style={{
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              background: "linear-gradient(135deg, #0b1e36 0%, #153b66 100%)",
              border: "1px solid #1e3a8a",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  background: "#f5b000",
                  color: "#0b1e36",
                  fontWeight: 900,
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                👑 Dashboard Administrador
              </span>
              <h2 style={{ marginBottom: 4, color: "#ffffff", fontSize: "1.6rem" }}>
                Polla Liga BetPlay Dimayor
              </h2>
              <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                {usuario.nombre} • ({usuario.correo})
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={() => handleDescargarExcelPronosticos()}
                disabled={!consolidados}
                style={{ padding: "10px 16px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff" }}
              >
                <Download size={16} /> Descargar Pronósticos (Excel)
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => cargarConsolidados()}
                disabled={cargandoConsolidados}
                style={{ padding: "10px 16px" }}
              >
                <RefreshCw size={16} className={cargandoConsolidados ? "spin" : ""} /> Actualizar Datos
              </button>

              <button
                className="btn btn-logout"
                onClick={handleCerrarSesion}
                style={{ padding: "10px 16px" }}
                title="Cerrar Sesión y Salir"
              >
                <LogOut size={16} /> Salir
              </button>
            </div>
          </div>

          {/* TARJETAS DE RESUMEN KPI ESTÉTICAS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* TARJETA 1: PARTICIPANTES */}
            <div
              className="card"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "linear-gradient(130deg, #0f172a 0%, #1e293b 100%)",
                border: "1px solid #334155",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <UserCheck size={26} />
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
                  Participantes Registrados
                </div>
                <strong style={{ fontSize: "1.6rem", color: "#ffffff", fontWeight: 900 }}>
                  {consolidados?.usuarios?.length || 0}
                </strong>
              </div>
            </div>

            {/* TARJETA 2: LÍDER ACTUAL */}
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
                  Líder General
                </div>
                <strong style={{ fontSize: "1.1rem", color: "#ffd700", fontWeight: 900, display: "block" }}>
                  {consolidados?.tablaPosiciones?.[0]?.nombre_completo || "Sin definir"}
                </strong>
                {consolidados?.tablaPosiciones?.[0] && (
                  <span style={{ fontSize: "0.8rem", color: "#a5b4fc", fontWeight: 700 }}>
                    {consolidados.tablaPosiciones[0].pts_total} Pts acumulados
                  </span>
                )}
              </div>
            </div>

            {/* TARJETA 3: PARTIDOS */}
            <div
              className="card"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "linear-gradient(130deg, #064e3b 0%, #065f46 100%)",
                border: "1px solid #047857",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  background: "rgba(52, 211, 153, 0.2)",
                  color: "#34d399",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Calendar size={26} />
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#a7f3d0", fontWeight: 600 }}>
                  Partidos Fecha 1
                </div>
                <strong style={{ fontSize: "1.6rem", color: "#ffffff", fontWeight: 900 }}>
                  {partidos.length} Partidos
                </strong>
              </div>
            </div>
          </div>

          {/* AFICHE OFICIAL TABLA DE POSICIONES CON EXPORTACIÓN A EXCEL */}
          {cargandoConsolidados ? (
            <div className="card" style={{ textAlign: "center", padding: 50 }}>
              <RefreshCw className="spin" size={36} style={{ color: "#38bdf8", marginBottom: 16 }} />
              <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>Cargando Dashboard Admin...</div>
            </div>
          ) : !consolidados ? (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              No se pudieron cargar los datos del Dashboard.
            </div>
          ) : (
            <TablaPosicionesAfiche
              tabla={consolidados.tablaPosiciones || []}
              onDescargarExcelPronosticos={handleDescargarExcelPronosticos}
            />
          )}

          {/* LISTA DE PARTIDOS PARA DESCARGAR O VER PARTICIPANTES */}
          {usuario.rol_id === 2 && partidos.length > 0 && consolidados && (
            <div className="card" style={{ marginTop: 24, padding: "24px" }}>
              <h3 style={{ marginBottom: 16, fontSize: "1.4rem", color: "var(--cancha)" }}>
                Gestión por Partido
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {partidos.map((partido) => {
                  const pronosticosPartido = consolidados.prediccionesPartidos.filter(
                    (p) => p.partido.equipo_local.nombre === partido.equipo_local.nombre && 
                           p.partido.equipo_visitante.nombre === partido.equipo_visitante.nombre
                  );

                  return (
                    <div
                      key={partido.id}
                      style={{
                        padding: 16,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <strong style={{ fontSize: "1.2rem", display: "block", marginBottom: 4 }}>
                            {partido.equipo_local.nombre} VS {partido.equipo_visitante.nombre}
                          </strong>
                          <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                            {pronosticosPartido.length} pronósticos recibidos
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                            onClick={() => setPartidoAdminVer(partidoAdminVer === partido.id ? null : partido.id)}
                          >
                            <Users size={14} style={{ marginRight: 6, display: "inline" }} />
                            Ver Participantes
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ padding: "8px 12px", fontSize: "0.85rem", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff" }}
                            onClick={() => handleDescargarExcelPronosticos(partido.id)}
                          >
                            <Download size={14} style={{ marginRight: 6, display: "inline" }} />
                            Descargar Excel
                          </button>
                        </div>
                      </div>

                      {/* LISTA DE PARTICIPANTES DESPLEGADA */}
                      {partidoAdminVer === partido.id && (
                        <div style={{ marginTop: 16, padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
                          {pronosticosPartido.length === 0 ? (
                            <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Nadie ha pronosticado este partido aún.</div>
                          ) : (
                            <ul style={{ margin: 0, paddingLeft: 20, color: "#cbd5e1", fontSize: "0.95rem" }}>
                              {pronosticosPartido.map((p, idx) => (
                                <li key={idx} style={{ marginBottom: 4 }}>
                                  {p.usuario.nombre_completo} <span style={{ color: "#64748b", fontSize: "0.8rem" }}>({p.usuario.correo})</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= VISTA NORMAL DE PARTICIPANTE ================= */
        <div>
          {/* BARRA SUPERIOR DEL PARTICIPANTE */}
          <div
            className="card"
            style={{
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <span className="badge badge-cancha" style={{ marginBottom: 8 }}>
                ✓ Participante Activo
              </span>
              <h2 style={{ marginBottom: 4 }}>{usuario.nombre}</h2>
              <span style={{ color: "var(--graderia)", fontSize: "0.85rem" }}>{usuario.correo}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button
                className={`btn ${tabActiva === "partidos" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setTabActiva("partidos")}
                style={{ padding: "10px 14px", fontSize: "0.85rem" }}
              >
                ⚽ Pronósticos Fecha 1
              </button>

              <button
                className={`btn ${tabActiva === "inicial" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setTabActiva("inicial")}
                style={{ padding: "10px 14px", fontSize: "0.85rem" }}
              >
                🏆 Predicciones Torneo (30P / 25P)
              </button>

              <button
                className={`btn ${tabActiva === "mis_pronosticos" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => {
                  setTabActiva("mis_pronosticos");
                  cargarConsolidados(usuario.id);
                }}
                style={{ padding: "10px 14px", fontSize: "0.85rem" }}
              >
                📋 Mis Pronósticos & Públicos
              </button>

              <button
                className="btn btn-primary"
                onClick={handleGuardarTodo}
                disabled={guardando}
                style={{ padding: "10px 16px", fontSize: "0.85rem" }}
              >
                <Save size={16} /> {guardando ? "Guardando..." : "Guardar Todo"}
              </button>

              <button
                className="btn btn-logout"
                onClick={handleCerrarSesion}
                style={{ padding: "10px 14px", fontSize: "0.85rem" }}
                title="Cerrar Sesión y Salir"
              >
                <LogOut size={16} /> Salir
              </button>
            </div>
          </div>

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

          {/* TAB 1: FECHA 1 DE LIGA BETPLAY */}
          {tabActiva === "partidos" && (
            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <h2>⚽ Pronósticos de Fecha 1</h2>
                <p style={{ color: "var(--graderia)", margin: 0, fontSize: "0.85rem" }}>
                  Ingresa el <strong>Marcador Exacto (5 Pts)</strong>, el <strong>Equipo Ganador (3 Pts)</strong> y opcionalmente el <strong>Goleador del Partido (2 Pts)</strong>.
                </p>
              </div>

              {cargandoMaestros ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--graderia)" }}>
                  Cargando partidos de la Fecha 1...
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {partidos.map((partido) => {
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

                    const horaCierrePartido = new Date(new Date(partido.fecha_hora_partido).getTime() - 60 * 60 * 1000);
                    const estaCerrado = new Date() >= horaCierrePartido;

                    return (
                      <div
                        key={partido.id}
                        className="card"
                        style={{
                          borderLeft: estaCerrado
                            ? "4px solid var(--graderia)"
                            : inconsistencia
                            ? "4px solid var(--rojo)"
                            : "1px solid var(--linea)",
                          background: estaCerrado
                            ? "rgba(255, 255, 255, 0.02)"
                            : inconsistencia
                            ? "var(--rojo-suave)"
                            : "var(--tribuna)",
                          opacity: estaCerrado ? 0.85 : 1,
                        }}
                      >
                        {/* ENCABEZADO MATCH CON RELOJ CUENTA REGRESIVA */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: "0.82rem", color: "var(--graderia)", borderBottom: "1px dashed var(--linea)", paddingBottom: 8, flexWrap: "wrap", gap: 8 }}>
                          <span style={{ fontWeight: 700, color: "var(--cancha)" }}>
                            🏟️ {partido.estadio || "Liga BetPlay"}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <RelojCuentaRegresiva fechaHoraPartido={partido.fecha_hora_partido} />
                            <span style={{ background: "var(--noche-2)", padding: "4px 10px", borderRadius: 6, color: "#ffffff", fontWeight: 600 }}>
                              📅 {new Date(partido.fecha_hora_partido).toLocaleString("es-CO", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>

                        {/* FILA PRINCIPAL: LOCAL VS VISITANTE */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16, marginBottom: 16 }}>
                          {/* LOCAL */}
                          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
                            <span style={{ fontWeight: 800, fontSize: "1.05rem" }}>{partido.equipo_local.nombre}</span>
                            <img
                              src={partido.equipo_local.escudo_url || "https://placehold.co/40x40/1e3145/ffffff?text=FPC"}
                              alt={partido.equipo_local.nombre}
                              style={{ width: 36, height: 36, objectFit: "contain" }}
                            />
                          </div>

                          {/* MARCADOR INPUTS */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="text"
                              maxLength={2}
                              className="marcador-input"
                              value={m.local}
                              onChange={(e) => handleMarcadorChange(partido.id, "local", e.target.value)}
                              placeholder="-"
                              disabled={estaCerrado}
                            />
                            <span style={{ fontWeight: 900, color: "var(--graderia)", fontSize: "1.1rem" }}>:</span>
                            <input
                              type="text"
                              maxLength={2}
                              className="marcador-input"
                              value={m.visitante}
                              onChange={(e) => handleMarcadorChange(partido.id, "visitante", e.target.value)}
                              placeholder="-"
                              disabled={estaCerrado}
                            />
                          </div>

                          {/* VISITANTE */}
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img
                              src={partido.equipo_visitante.escudo_url || "https://placehold.co/40x40/1e3145/ffffff?text=FPC"}
                              alt={partido.equipo_visitante.nombre}
                              style={{ width: 36, height: 36, objectFit: "contain" }}
                            />
                            <span style={{ fontWeight: 800, fontSize: "1.05rem" }}>{partido.equipo_visitante.nombre}</span>
                          </div>
                        </div>

                        {/* GANADOR PREDICHO */}
                        <div style={{ background: "var(--noche-2)", padding: "12px 16px", borderRadius: 8, marginBottom: 12 }}>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--graderia)", marginBottom: 6 }}>
                            🏆 Equipo Ganador del Partido (3 Pts):
                          </label>
                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.9rem" }}>
                              <input
                                type="radio"
                                name={`ganador-${partido.id}`}
                                checked={m.ganador === "local"}
                                onChange={() => handleGanadorChange(partido.id, "local")}
                                disabled={estaCerrado}
                              />
                              Gana {partido.equipo_local.nombre}
                            </label>

                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.9rem" }}>
                              <input
                                type="radio"
                                name={`ganador-${partido.id}`}
                                checked={m.ganador === "empate"}
                                onChange={() => handleGanadorChange(partido.id, "empate")}
                                disabled={estaCerrado}
                              />
                              Empate
                            </label>

                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.9rem" }}>
                              <input
                                type="radio"
                                name={`ganador-${partido.id}`}
                                checked={m.ganador === "visitante"}
                                onChange={() => handleGanadorChange(partido.id, "visitante")}
                                disabled={estaCerrado}
                              />
                              Gana {partido.equipo_visitante.nombre}
                            </label>
                          </div>
                        </div>

                        {/* SELECTOR DE GOLEADOR */}
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--graderia)", marginBottom: 4 }}>
                            ⚽ Goleador del Partido (Opcional - 2 Pts):
                          </label>
                          <select
                            className="input"
                            style={{ padding: "8px 12px", fontSize: "0.9rem" }}
                            value={m.goleador_id}
                            onChange={(e) => handleGoleadorChange(partido.id, e.target.value)}
                            disabled={estaCerrado}
                          >
                            <option value="">-- Sin Goleador / Seleccionar Jugador --</option>
                            {jugadoresPartido.length > 0 ? (
                              jugadoresPartido.map((j) => (
                                <option key={j.id} value={j.id}>
                                  {j.nombre}
                                </option>
                              ))
                            ) : (
                              jugadores.map((j) => (
                                <option key={j.id} value={j.id}>
                                  {j.nombre} ({j.equipo ? j.equipo.nombre : "FPC"})
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        {inconsistencia && (
                          <div style={{ marginTop: 10, color: "var(--rojo)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                            <AlertTriangle size={16} /> {inconsistencia}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                    {jugadores.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.nombre} ({j.equipo?.nombre || "FPC"})
                      </option>
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
                    <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Pronósticos Públicos por Partido</h2>
                    <p style={{ color: "var(--graderia)", margin: 0, fontSize: "0.85rem" }}>
                      Los pronósticos de todos los participantes se liberan públicamente <strong>1 HORA ANTES</strong> del inicio de cada partido.
                    </p>
                  </div>
                </div>

                {partidos.map((partido) => {
                  const horaCierre = new Date(new Date(partido.fecha_hora_partido).getTime() - 60 * 60 * 1000);
                  const estaCerrado = new Date() >= horaCierre;

                  // Pronósticos de este partido entre todos los usuarios
                  const pronosticosDeEstePartido = consolidados?.prediccionesPartidos?.filter(
                    (p: any) => p.partido_id === partido.id
                  ) || [];

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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <strong style={{ fontSize: "1rem", color: "#ffffff" }}>
                          ⚽ {partido.equipo_local.nombre} vs {partido.equipo_visitante.nombre}
                        </strong>
                        <RelojCuentaRegresiva fechaHoraPartido={partido.fecha_hora_partido} />
                      </div>

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
                                      <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                                        {p.ganador_predicho === "local" ? partido.equipo_local.nombre : p.ganador_predicho === "visitante" ? partido.equipo_visitante.nombre : "Empate"}
                                      </span>
                                    </td>
                                    <td style={{ padding: "8px", color: "var(--graderia)" }}>
                                      {p.jugador_goleador?.nombre || "N/A"}
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
                          🔒 Los pronósticos de todos los participantes permanecen ocultos hasta 1 hora antes del partido.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BARRA DE GUARDADO AL FINAL DE LA PÁGINA */}
          <div
            style={{
              marginTop: 30,
              background: "rgba(19, 32, 48, 0.95)",
              border: "1px solid var(--linea-fuerte)",
              borderRadius: "var(--radio-card)",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>¿Listo para guardar tus pronósticos?</div>
              <div style={{ fontSize: "0.8rem", color: "var(--graderia)" }}>
                {totalPronosticados} partidos de Fecha 1 diligenciados.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button className="btn btn-primary" onClick={handleGuardarTodo} disabled={guardando}>
                <Save size={18} /> {guardando ? "Guardando..." : "Guardar Todos los Pronósticos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
