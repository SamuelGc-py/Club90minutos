"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldAlert, Save, RefreshCw, Trophy, Calendar, LogOut, AlertTriangle, UserCheck, Lock, Clock, Eye, List, Download, Users, Menu, X, Flame } from "lucide-react";
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

function RelojCuentaRegresiva({ fechaHoraPartido }: { fechaHoraPartido: string }) {
  const [tiempoRestante, setTiempoRestante] = useState<string>("");
  const [cerrado, setCerrado] = useState<boolean>(false);

  useEffect(() => {
    function calcular() {
      const horaPartido = new Date(fechaHoraPartido).getTime();
      const horaCierre = horaPartido - 30 * 60 * 1000; // 30 minutos antes del inicio
      const ahora = new Date().getTime();
      const dif = horaCierre - ahora;

      if (dif <= 0) {
        setCerrado(true);
        setTiempoRestante("🔒 Cerrado (30m antes)");
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
  const [tabActiva, setTabActiva] = useState<"inicio" | "partidos" | "inicial" | "mis_pronosticos" | "admin" | "posiciones">("inicio");
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
  const [fechaParticipante, setFechaParticipante] = useState<number>(2); // Default Fecha 2 para participantes
  const [fechaAdmin, setFechaAdmin] = useState<number>(1); // Default Fecha 1 para admin

  // Sincronizar pronósticos en vivo con localStorage de sesión
  const actualizarSesionLocalStorage = (partidoId: number, local: number, visitante: number, goleadorId: number | null) => {
    try {
      const sesionStr = localStorage.getItem("polla_sesion");
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
      localStorage.setItem("polla_sesion", JSON.stringify(sesionData));
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
      if (!res.ok || data.error) {
        setMensajeEstado({ tipo: "error", texto: data.error || "Error al guardar el pronóstico." });
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

  const handleResultadoAdminChange = (partidoId: number, campo: "local" | "visitante", valor: string) => {
    setResultadosAdminInput((prev) => ({
      ...prev,
      [partidoId]: {
        ...(prev[partidoId] || { local: "", visitante: "", goleadores_ids: [] }),
        [campo]: valor,
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
      cargarMaestros();
      cargarConsolidados(usuario.id);
    } catch (err: any) {
      console.error(err);
      setMensajeEstado({ tipo: "error", texto: err.message || "Error al liquidar resultado." });
    }
  };

  const aplicarPrediccionesGuardadas = (prediccionesGuardadas: any) => {
    if (!prediccionesGuardadas) return;
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
  };

  // Cargar datos maestros (Equipos, Jugadores, Partidos)
  const cargarMaestros = async () => {
    setCargandoMaestros(true);
    try {
      const res = await fetch("/api/datos-maestros", { cache: "no-store" });
      const data = await res.json();
      if (data.equipos) setEquipos(data.equipos);
      if (data.jugadores) setJugadores(data.jugadores);
      if (data.partidos) setPartidos(data.partidos);
    } catch (err) {
      console.error("Error al cargar datos maestros:", err);
    } finally {
      setCargandoMaestros(false);
    }
  };

  const sincronizarSesionBackend = async (correo: string) => {
    try {
      const res = await fetch("/api/validar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, autoSync: true }),
      });
      const data = await res.json();
      if (res.ok && data.usuario && data.prediccionesGuardadas) {
        setUsuario(data.usuario);
        localStorage.setItem("polla_sesion", JSON.stringify({
          usuario: data.usuario,
          prediccionesGuardadas: data.prediccionesGuardadas,
        }));
        aplicarPrediccionesGuardadas(data.prediccionesGuardadas);
        if (data.usuario.rol_id === 2) {
          cargarConsolidados(data.usuario.id);
        }
      }
    } catch (e) {
      console.error("Error al sincronizar sesión backend:", e);
    }
  };

  // Persistencia de sesión y auto-sincronización con la base de datos
  useEffect(() => {
    const sesionGuardada = localStorage.getItem("polla_sesion");
    if (sesionGuardada) {
      try {
        const dataParsed = JSON.parse(sesionGuardada);
        const usr = dataParsed.usuario || dataParsed;
        setUsuario(usr);
        if (usr.rol_id === 2) {
          cargarConsolidados(usr.id);
        }
        if (dataParsed.prediccionesGuardadas) {
          aplicarPrediccionesGuardadas(dataParsed.prediccionesGuardadas);
        }
        if (usr.correo) {
          sincronizarSesionBackend(usr.correo);
        }
      } catch (e) {
        console.error("Error leyendo sesión", e);
        localStorage.removeItem("polla_sesion");
      }
    }
  }, []);

  useEffect(() => {
    cargarMaestros();
  }, []);

  // Borrar automáticamente los mensajes de estado/alertas tras 3 segundos
  useEffect(() => {
    if (mensajeEstado) {
      const timer = setTimeout(() => {
        setMensajeEstado(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mensajeEstado]);

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
      localStorage.setItem("polla_sesion", JSON.stringify({
        usuario: data.usuario,
        prediccionesGuardadas: data.prediccionesGuardadas
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

  // VALIDAR RESTRICCIÓN DE COHERENCIA ENTRE MARCADOR Y GANADOR (SOLO PARTIDOS ACTIVOS)
  const validarCoherenciaPronosticos = (): string | null => {
    for (const partido of partidos) {
      const horaCierrePartido = new Date(new Date(partido.fecha_hora_partido).getTime() - 30 * 60 * 1000);
      const esAplazado = partido.estado === "aplazado";
      const esAdmin = usuario?.rol_id === 2;
      const esExcepcionHarold = usuario?.correo === "hberdugodelosreyes0@gmail.com" && partido.id === 24;
      const esExcepcionSamu = usuario?.correo === "samucobaggg@gmail.com" && partido.id === 25;
      const esExcepcionIgnacio = usuario?.correo === "iangelbarrios16@gmail.com" && partido.id === 27;
      const esFinalizado = Boolean(partido.resultado_oficial) || partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado";
      const estaCerrado = (new Date() >= horaCierrePartido && !esAdmin && !esExcepcionHarold && !esExcepcionSamu && !esExcepcionIgnacio) || esAplazado || esFinalizado;

      // Ignorar validación para partidos acabados, cerrados o aplazados
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

  // Cerrar Sesión
  const handleCerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem("polla_sesion");
    setCorreoInput("");
    setPasswordInput("");
    setMensajeEstado(null);
  };

  // Descargar Excel de Pronósticos por Partido (Diseño exacto Imagen 2)
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
        setMensajeEstado({ tipo: "exito", texto: "¡Tus pronósticos se han guardado exitosamente!" });
        arrayPartidos.forEach((p) => {
          actualizarSesionLocalStorage(p.partido_id, p.goles_local, p.goles_visitante, p.jugador_goleador_id);
        });
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
              onDescargarExcelPronosticos={usuario.rol_id === 2 ? handleDescargarExcelPronosticos : undefined}
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

                      {/* LISTA DE PARTICIPANTES Y SUS PRONÓSTICOS DESPLEGADA */}
                      {partidoAdminVer === partido.id && (
                        <div style={{ marginTop: 16, padding: 16, background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                          <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "#38bdf8" }}>
                            📋 Pronósticos Registrados por los Participantes:
                          </h4>
                          {pronosticosPartido.length === 0 ? (
                            <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Nadie ha pronosticado este partido aún.</div>
                          ) : (
                            <div style={{ overflowX: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                                <thead>
                                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8" }}>
                                    <th style={{ padding: "8px" }}>Participante</th>
                                    <th style={{ padding: "8px", textAlign: "center" }}>Marcador Predicho</th>
                                    <th style={{ padding: "8px", textAlign: "center" }}>Ganador Predicho</th>
                                    <th style={{ padding: "8px" }}>Goleador Predicho</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pronosticosPartido.map((p: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: "1px dashed rgba(255,255,255,0.08)" }}>
                                      <td style={{ padding: "8px", fontWeight: 700, color: "#ffffff" }}>
                                        {p.usuario.nombre_completo} <span style={{ color: "#64748b", fontSize: "0.78rem" }}>({p.usuario.correo})</span>
                                      </td>
                                      <td style={{ padding: "8px", textAlign: "center", fontWeight: 900, color: "#34d399", fontSize: "1rem" }}>
                                        {p.goles_local_predicho} - {p.goles_visitante_predicho}
                                      </td>
                                      <td style={{ padding: "8px", textAlign: "center" }}>
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
                                            <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 800 }}>
                                              {ganadorTexto}
                                            </span>
                                          );
                                        })()}
                                      </td>
                                      <td style={{ padding: "8px", color: "#f5b000", fontWeight: 600 }}>
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

                      {/* SECCIÓN CARGAR MARCADOR OFICIAL (ADMIN) */}
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 700 }}>
                          ⚽ Cargar Marcador Oficial:
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="number"
                            placeholder="Local"
                            style={{ width: 60, padding: "6px", borderRadius: 6, border: "1px solid var(--linea)", background: "var(--noche)", color: "#fff", textAlign: "center" }}
                            value={resultadosAdminInput[partido.id]?.local || ""}
                            onChange={(e) => handleResultadoAdminChange(partido.id, "local", e.target.value)}
                          />
                          <span style={{ fontWeight: 800 }}>-</span>
                          <input
                            type="number"
                            placeholder="Vis"
                            style={{ width: 60, padding: "6px", borderRadius: 6, border: "1px solid var(--linea)", background: "var(--noche)", color: "#fff", textAlign: "center" }}
                            value={resultadosAdminInput[partido.id]?.visitante || ""}
                            onChange={(e) => handleResultadoAdminChange(partido.id, "visitante", e.target.value)}
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 320 }}>
                          <select
                            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--linea)", background: "var(--noche)", color: "#fff", fontSize: "0.85rem" }}
                            value=""
                            onChange={(e) => {
                              handleAgregarGoleadorAdmin(partido.id, e.target.value);
                              e.target.value = "";
                            }}
                          >
                            <option value="">+ Agregar Goleador Oficial (Opcional)</option>
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
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                              {resultadosAdminInput[partido.id].goleadores_ids.map((jId) => {
                                const todosJugadores = [...(partido.equipo_local.jugadores || []), ...(partido.equipo_visitante.jugadores || []), ...jugadores];
                                const jObj = todosJugadores.find((j) => j.id === jId);
                                return (
                                  <span
                                    key={jId}
                                    style={{
                                      background: "rgba(34, 197, 94, 0.2)",
                                      color: "#22c55e",
                                      border: "1px solid rgba(34, 197, 94, 0.4)",
                                      borderRadius: "12px",
                                      padding: "3px 10px",
                                      fontSize: "0.78rem",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 6,
                                      fontWeight: 700,
                                    }}
                                  >
                                    ⚽ {jObj?.nombre || `ID: ${jId}`}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoverGoleadorAdmin(partido.id, jId)}
                                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 900, padding: "0 2px", fontSize: "0.85rem" }}
                                    >
                                      ✕
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <button
                          className="btn btn-primary"
                          style={{ padding: "6px 12px", fontSize: "0.82rem", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", color: "#fff" }}
                          onClick={() => handleCargarResultadoOficial(partido.id)}
                        >
                          ⚽ Publicar Resultado & Liquidar Puntos
                        </button>
                      </div>
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
              <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
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
                className={`menu-drawer-item ${tabActiva === "inicio" ? "active" : ""}`}
                onClick={() => {
                  setTabActiva("inicio");
                  setMenuAbierto(false);
                }}
              >
                🏠 Inicio
              </div>
              <div
                className={`menu-drawer-item ${tabActiva === "partidos" ? "active" : ""}`}
                onClick={() => {
                  setTabActiva("partidos");
                  setMenuAbierto(false);
                }}
              >
                ⚽ Pronósticos Fecha 2
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
              {usuario.rol_id === 2 && (
                <div
                  className={`menu-drawer-item ${tabActiva === "admin" ? "active" : ""}`}
                  onClick={() => {
                    setTabActiva("admin");
                    setMenuAbierto(false);
                  }}
                >
                  👑 Panel Administrador
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



          {/* PESTAÑAS NAVEGACIÓN COMPUTADOR (desktop-tabs) - Oculto en la pantalla de Inicio */}
          {tabActiva !== "inicio" && (
            <div className="desktop-tabs" style={{ marginBottom: 24 }}>
              <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setTabActiva("inicio")}
                    style={{ padding: "10px 14px", fontSize: "0.85rem" }}
                  >
                    🏠 Inicio
                  </button>

                  <button
                    className={`btn ${tabActiva === "partidos" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setTabActiva("partidos")}
                    style={{ padding: "10px 14px", fontSize: "0.85rem" }}
                  >
                    ⚽ Pronósticos Fecha 2
                  </button>

                  <button
                    className={`btn ${tabActiva === "inicial" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setTabActiva("inicial")}
                    style={{ padding: "10px 14px", fontSize: "0.85rem" }}
                  >
                    🏆 Predicciones Torneo
                  </button>

                  <button
                    className={`btn ${tabActiva === "mis_pronosticos" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => {
                      setTabActiva("mis_pronosticos");
                      cargarConsolidados(usuario.id);
                    }}
                    style={{ padding: "10px 14px", fontSize: "0.85rem" }}
                  >
                    📋 Tabla de Pronósticos
                  </button>

                  <button
                    className={`btn ${tabActiva === "posiciones" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => {
                      setTabActiva("posiciones");
                      cargarConsolidados(usuario.id);
                    }}
                    style={{ padding: "10px 14px", fontSize: "0.85rem" }}
                  >
                    📊 Tabla de Posiciones
                  </button>

                  {usuario.rol_id === 2 && (
                    <button
                      className={`btn ${tabActiva === "admin" ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setTabActiva("admin")}
                      style={{ padding: "10px 14px", fontSize: "0.85rem", background: tabActiva === "admin" ? "#f5b000" : undefined, color: tabActiva === "admin" ? "#000" : undefined }}
                    >
                      👑 Panel Admin
                    </button>
                  )}
                </div>

                <button className="btn btn-logout" onClick={handleCerrarSesion} style={{ padding: "10px 14px", fontSize: "0.85rem" }}>
                  <LogOut size={16} /> Salir
                </button>
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

          {/* TAB 0: PANTALLA DE INICIO Y BIENVENIDA */}
          {tabActiva === "inicio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                className="card"
                style={{
                  background: "linear-gradient(135deg, rgba(14, 26, 39, 0.95) 0%, rgba(19, 32, 48, 0.95) 50%, rgba(16, 42, 33, 0.95) 100%)",
                  border: "1px solid var(--cancha-borde)",
                  borderRadius: 16,
                  padding: "32px 24px",
                  textAlign: "center",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
                }}
              >
                <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "#34d399", fontWeight: 800, marginBottom: 8 }}>
                  🔥 BIENVENIDO AL DESAFÍO LIGA BETPLAY 2026 🔥
                </div>
                <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 900, color: "#ffffff", marginBottom: 12 }}>
                  DEMUESTRA LO QUE SABES DE FÚTBOL
                </h1>
                <p style={{ maxWidth: 640, margin: "0 auto 24px", color: "var(--graderia)", fontSize: "1rem", lineHeight: 1.6 }}>
                  ¡Hola, <strong style={{ color: "#fff" }}>{usuario.nombre}</strong>! Selecciona la sección a la que deseas acceder para ingresar tus pronósticos o revisar la tabla de posiciones en vivo.
                </p>

                {/* TARJETAS DE ACCESO RÁPIDO */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, textAlign: "left" }}>
                  <div
                    onClick={() => setTabActiva("partidos")}
                    style={{
                      background: "linear-gradient(135deg, #0f291e 0%, #133a2a 100%)",
                      border: "1px solid #10b981",
                      borderRadius: 12,
                      padding: 20,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>⚽</div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff", marginBottom: 4 }}>Pronósticos Fecha 2</div>
                    <div style={{ fontSize: "0.82rem", color: "#a7f3d0" }}>Ingresa marcadores exactos, ganadores y goleadores de los partidos.</div>
                  </div>

                  <div
                    onClick={() => setTabActiva("inicial")}
                    style={{
                      background: "linear-gradient(135deg, #34290e 0%, #4a3b15 100%)",
                      border: "1px solid #f5b000",
                      borderRadius: 12,
                      padding: 20,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🏆</div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff", marginBottom: 4 }}>Predicciones Torneo</div>
                    <div style={{ fontSize: "0.82rem", color: "#fef08a" }}>Elige Campeón, Finalistas, Goleador General y 8 Clasificados.</div>
                  </div>

                  <div
                    onClick={() => {
                      setTabActiva("mis_pronosticos");
                      cargarConsolidados(usuario.id);
                    }}
                    style={{
                      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                      border: "1px solid #6366f1",
                      borderRadius: 12,
                      padding: 20,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📋</div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff", marginBottom: 4 }}>Tabla de Pronósticos</div>
                    <div style={{ fontSize: "0.82rem", color: "#c7d2fe" }}>Revisa los pronósticos cargados por los participantes.</div>
                  </div>

                  <div
                    onClick={() => {
                      setTabActiva("posiciones");
                      cargarConsolidados(usuario.id);
                    }}
                    style={{
                      background: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)",
                      border: "1px solid #38bdf8",
                      borderRadius: 12,
                      padding: 20,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📊</div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff", marginBottom: 4 }}>Tabla de Posiciones</div>
                    <div style={{ fontSize: "0.82rem", color: "#bae6fd" }}>Consulta la tabla general de posiciones y puntos acumulados.</div>
                  </div>
                </div>

                {/* BOTÓN CERRAR SESIÓN EN INICIO */}
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px dashed rgba(255,255,255,0.1)", display: "flex", justifyContent: "center" }}>
                  <button
                    className="btn btn-logout"
                    onClick={handleCerrarSesion}
                    style={{ padding: "10px 24px", fontSize: "0.9rem" }}
                  >
                    <LogOut size={18} /> Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PRONÓSTICOS DE PARTIDOS (FECHAS) */}
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
                  <button className="btn btn-primary" onClick={cargarMaestros} style={{ padding: "10px 18px" }}>
                    🔄 Cargar Partidos Ahora
                  </button>
                </div>
              ) : (
                (() => {
                  const estaSoloFinal = (partido: any) => {
                    const esAplazado = partido.estado === "aplazado";
                    const esFinalizado = Boolean(partido.resultado_oficial) || partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado";
                    const hace2Horas = new Date().getTime() >= new Date(partido.fecha_hora_partido).getTime() + 2 * 60 * 60 * 1000;
                    return esFinalizado || esAplazado || hace2Horas;
                  };

                  // Para los participantes, ÚNICAMENTE se muestran los partidos de la Fecha 2
                  const partidosFiltradosParticipante = partidos.filter((p) => p.jornada === 2);

                  const partidosActivos = partidosFiltradosParticipante
                    .filter((p) => !estaSoloFinal(p))
                    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());

                  const partidosFinalizados = partidosFiltradosParticipante
                    .filter((p) => estaSoloFinal(p))
                    .sort((a, b) => {
                      if (a.estado === "aplazado" && b.estado !== "aplazado") return 1;
                      if (a.estado !== "aplazado" && b.estado === "aplazado") return -1;
                      return new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime();
                    });

                  const renderPartidoCard = (partido: any) => {
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
                    const esAplazado = partido.estado === "aplazado";
                    const esAdmin = usuario?.rol_id === 2;
                    const esExcepcionHarold = usuario?.correo === "hberdugodelosreyes0@gmail.com" && partido.id === 24;
                    const esExcepcionSamu = usuario?.correo === "samucobaggg@gmail.com" && partido.id === 25;
                    const esExcepcionIgnacio = usuario?.correo === "iangelbarrios16@gmail.com" && partido.id === 27;

                    const estaCerradoGeneral = (new Date() >= horaCierrePartido && !esAdmin && !esExcepcionHarold && !esExcepcionSamu) || esAplazado;
                    const estaCerrado = (estaCerradoGeneral && !esExcepcionIgnacio) || esAplazado;
                    const deshabilitarMarcador = estaCerradoGeneral;

                    return (
                      <div
                        key={partido.id}
                        className="card"
                        style={{
                          borderLeft: esAplazado
                            ? "4px solid #f59e0b"
                            : estaCerrado
                            ? "4px solid var(--graderia)"
                            : inconsistencia
                            ? "4px solid var(--rojo)"
                            : "1px solid var(--linea)",
                          background: esAplazado
                            ? "rgba(245, 158, 11, 0.1)"
                            : estaCerrado
                            ? "rgba(255, 255, 255, 0.02)"
                            : inconsistencia
                            ? "var(--rojo-suave)"
                            : "var(--tribuna)",
                          opacity: estaCerrado && !esAplazado ? 0.85 : 1,
                        }}
                      >
                        {/* ENCABEZADO MATCH CON RELOJ CUENTA REGRESIVA */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: "0.82rem", color: "var(--graderia)", borderBottom: "1px dashed var(--linea)", paddingBottom: 8, flexWrap: "wrap", gap: 8 }}>
                          <span style={{ fontWeight: 700, color: "var(--cancha)" }}>
                            🏟️ {partido.estadio || "Liga BetPlay"}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {esAplazado ? (
                              <span style={{ background: "#f59e0b", padding: "4px 10px", borderRadius: 6, color: "#fff", fontWeight: 800 }}>
                                ⚠️ APLAZADO
                              </span>
                            ) : partido.estado === "resultado_cargado" || partido.resultado_oficial ? (
                              <span style={{ background: "#10b981", padding: "4px 10px", borderRadius: 6, color: "#fff", fontWeight: 800 }}>
                                ⚽ FINALIZADO
                              </span>
                            ) : (
                              <>
                                <RelojCuentaRegresiva fechaHoraPartido={partido.fecha_hora_partido} />
                                <span style={{ background: "var(--noche-2)", padding: "4px 10px", borderRadius: 6, color: "#ffffff", fontWeight: 600 }}>
                                  📅 {new Date(partido.fecha_hora_partido).toLocaleString("es-CO", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

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
                                width: 44,
                                height: 44,
                                textAlign: "center",
                                fontSize: "1.2rem",
                                fontWeight: 900,
                                background: "var(--noche-2)",
                                border: m.local !== "" ? "2px solid var(--cancha)" : "1px solid var(--linea)",
                                borderRadius: 8,
                                color: "#ffffff",
                                padding: 0,
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
                                width: 44,
                                height: 44,
                                textAlign: "center",
                                fontSize: "1.2rem",
                                fontWeight: 900,
                                background: "var(--noche-2)",
                                border: m.visitante !== "" ? "2px solid var(--cancha)" : "1px solid var(--linea)",
                                borderRadius: 8,
                                color: "#ffffff",
                                padding: 0,
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
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px 4px",
                                    borderRadius: 6,
                                    cursor: deshabilitarMarcador ? "not-allowed" : "pointer",
                                    background: ganadorEfectivo === "local" ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.04)",
                                    border: ganadorEfectivo === "local" ? "1px solid var(--cancha)" : "1px solid var(--linea)",
                                    color: ganadorEfectivo === "local" ? "#34d399" : "var(--graderia)",
                                    textAlign: "center",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`ganador-${partido.id}`}
                                    checked={ganadorEfectivo === "local"}
                                    onChange={() => handleGanadorChange(partido.id, "local")}
                                    disabled={deshabilitarMarcador}
                                    style={{ display: "none" }}
                                  />
                                  <span>Gana {partido.equipo_local.nombre}</span>
                                </label>

                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px 4px",
                                    borderRadius: 6,
                                    cursor: deshabilitarMarcador ? "not-allowed" : "pointer",
                                    background: ganadorEfectivo === "empate" ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.04)",
                                    border: ganadorEfectivo === "empate" ? "1px solid #38bdf8" : "1px solid var(--linea)",
                                    color: ganadorEfectivo === "empate" ? "#38bdf8" : "var(--graderia)",
                                    textAlign: "center",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`ganador-${partido.id}`}
                                    checked={ganadorEfectivo === "empate"}
                                    onChange={() => handleGanadorChange(partido.id, "empate")}
                                    disabled={deshabilitarMarcador}
                                    style={{ display: "none" }}
                                  />
                                  <span>Empate</span>
                                </label>

                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px 4px",
                                    borderRadius: 6,
                                    cursor: deshabilitarMarcador ? "not-allowed" : "pointer",
                                    background: ganadorEfectivo === "visitante" ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.04)",
                                    border: ganadorEfectivo === "visitante" ? "1px solid var(--cancha)" : "1px solid var(--linea)",
                                    color: ganadorEfectivo === "visitante" ? "#34d399" : "var(--graderia)",
                                    textAlign: "center",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`ganador-${partido.id}`}
                                    checked={ganadorEfectivo === "visitante"}
                                    onChange={() => handleGanadorChange(partido.id, "visitante")}
                                    disabled={deshabilitarMarcador}
                                    style={{ display: "none" }}
                                  />
                                  <span>Gana {partido.equipo_visitante.nombre}</span>
                                </label>
                              </div>
                            </div>
                          );
                        })()}

                        {/* BLOQUE SELECCIÓN DE GOLEADOR: 2 DROPDOWNS SEPARADOS + BOTÓN APARTE 'SIN GOLEADOR' */}
                        {(() => {
                          const esMarcadorCeroCero = m.local !== "" && m.visitante !== "" && Number(m.local || 0) === 0 && Number(m.visitante || 0) === 0;
                          const hayGolesSinGoleador = (m.local !== "" || m.visitante !== "") && (Number(m.local || 0) > 0 || Number(m.visitante || 0) > 0) && !m.goleador_id;
                          const marcadorIncompleto = m.local === "" || m.visitante === "";
                          const deshabilitarBotonGuardar = guardandoPartidoId === partido.id || marcadorIncompleto || hayGolesSinGoleador || Boolean(inconsistencia);

                          return (
                            <>
                              <div style={{ background: "var(--noche-2)", padding: "14px 16px", borderRadius: 8, marginBottom: 12, opacity: esMarcadorCeroCero ? 0.7 : 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--tiza)" }}>
                                    ⚽ Goleador del Partido (+2 Pts):
                                  </label>

                                  {/* BOTÓN APARTE 'SIN GOLEADOR (0 - 0)' */}
                                  <button
                                    type="button"
                                    disabled={estaCerrado || esMarcadorCeroCero}
                                    onClick={() => handleGoleadorChange(partido.id, "")}
                                    style={{
                                      padding: "6px 14px",
                                      borderRadius: 6,
                                      fontSize: "0.78rem",
                                      fontWeight: 700,
                                      cursor: (estaCerrado || esMarcadorCeroCero) ? "not-allowed" : "pointer",
                                      background: !m.goleador_id ? "rgba(239, 68, 68, 0.25)" : "rgba(255, 255, 255, 0.05)",
                                      border: !m.goleador_id ? "1px solid #ef4444" : "1px solid var(--linea)",
                                      color: !m.goleador_id ? "#fca5a5" : "var(--graderia)",
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    {!m.goleador_id ? "🚫 Sin Goleador (Activo para 0 - 0)" : "🚫 Cambiar a Sin Goleador"}
                                  </button>
                                </div>

                                {/* 2 DROPDOWNS SEPARADOS POR EQUIPO */}
                                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                  {/* GOLEADOR LOCAL */}
                                  <div style={{ flex: 1, minWidth: 200 }}>
                                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--cancha)", marginBottom: 4 }}>
                                      🏠 Goleador {partido.equipo_local.nombre}:
                                    </label>
                                    <select
                                      value={
                                        (partido.equipo_local.jugadores || []).some((j: any) => String(j.id) === String(m.goleador_id))
                                          ? String(m.goleador_id)
                                          : ""
                                      }
                                      onChange={(e) => handleGoleadorChange(partido.id, e.target.value)}
                                      disabled={estaCerrado || esMarcadorCeroCero}
                                      style={{
                                        width: "100%",
                                        padding: "9px 12px",
                                        background: "var(--noche-1)",
                                        border: (partido.equipo_local.jugadores || []).some((j: any) => String(j.id) === String(m.goleador_id))
                                          ? "1px solid var(--cancha)"
                                          : "1px solid var(--linea)",
                                        borderRadius: 8,
                                        color: "#ffffff",
                                        fontSize: "0.85rem",
                                        cursor: (estaCerrado || esMarcadorCeroCero) ? "not-allowed" : "pointer",
                                      }}
                                    >
                                      <option value="">-- Seleccionar de {partido.equipo_local.nombre} --</option>
                                      {(partido.equipo_local.jugadores || []).map((j: any) => (
                                        <option key={j.id} value={j.id}>
                                          {j.nombre}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* GOLEADOR VISITANTE */}
                                  <div style={{ flex: 1, minWidth: 200 }}>
                                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#38bdf8", marginBottom: 4 }}>
                                      ✈️ Goleador {partido.equipo_visitante.nombre}:
                                    </label>
                                    <select
                                      value={
                                        (partido.equipo_visitante.jugadores || []).some((j: any) => String(j.id) === String(m.goleador_id))
                                          ? String(m.goleador_id)
                                          : ""
                                      }
                                      onChange={(e) => handleGoleadorChange(partido.id, e.target.value)}
                                      disabled={estaCerrado || esMarcadorCeroCero}
                                      style={{
                                        width: "100%",
                                        padding: "9px 12px",
                                        background: "var(--noche-1)",
                                        border: (partido.equipo_visitante.jugadores || []).some((j: any) => String(j.id) === String(m.goleador_id))
                                          ? "1px solid #38bdf8"
                                          : "1px solid var(--linea)",
                                        borderRadius: 8,
                                        color: "#ffffff",
                                        fontSize: "0.85rem",
                                        cursor: (estaCerrado || esMarcadorCeroCero) ? "not-allowed" : "pointer",
                                      }}
                                    >
                                      <option value="">-- Seleccionar de {partido.equipo_visitante.nombre} --</option>
                                      {(partido.equipo_visitante.jugadores || []).map((j: any) => (
                                        <option key={j.id} value={j.id}>
                                          {j.nombre}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* INDICADOR DE ESTADO */}
                                {esMarcadorCeroCero ? (
                                  <div style={{ marginTop: 8, fontSize: "0.82rem", color: "#60a5fa", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                    🔒 Marcador 0 - 0: Selección de goleador bloqueada (en empate a cero no hay goles).
                                  </div>
                                ) : m.goleador_id ? (
                                  <div style={{ marginTop: 10, fontSize: "0.85rem", color: "var(--cancha)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                    ⚽ Goleador seleccionado: {[...(partido.equipo_local.jugadores || []), ...(partido.equipo_visitante.jugadores || []), ...jugadores].find((j: any) => String(j.id) === String(m.goleador_id))?.nombre || "Seleccionado"}
                                  </div>
                                ) : (
                                  <div style={{ marginTop: 8, fontSize: "0.78rem", color: "var(--graderia)", fontStyle: "italic" }}>
                                    ℹ️ Sin goleador seleccionado (válido sólo si el partido termina 0 - 0).
                                  </div>
                                )}
                              </div>

                              {/* INCONSISTENCIA SI INGRESÓ GOLES PERO NO SELECCIONÓ GOLEADOR (SOLO PARTIDOS ABIERTOS) */}
                              {!estaCerrado && hayGolesSinGoleador && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    padding: "10px 14px",
                                    background: "rgba(239, 68, 68, 0.15)",
                                    border: "1px solid rgba(239, 68, 68, 0.4)",
                                    borderRadius: 8,
                                    color: "#fca5a5",
                                    fontSize: "0.85rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontWeight: 700,
                                  }}
                                >
                                  <AlertTriangle size={18} style={{ flexShrink: 0, color: "#ef4444" }} />
                                  <span>❌ Debes seleccionar obligatoriamente el goleador del partido (o cambiar marcador a 0 - 0 si no hay goles).</span>
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
                            </>
                          );
                        })()}
                      </div>
                    );
                  };

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {partidosActivos.map((partido) => renderPartidoCard(partido))}

                      {partidosFinalizados.length > 0 && (
                        <>
                          <div style={{ marginTop: 28, marginBottom: 8, borderTop: "2px dashed var(--linea)", paddingTop: 20 }}>
                            <h3 style={{ color: "#34d399", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                              🏁 Partidos Finalizados y Aplazados (Orden Cronológico)
                            </h3>
                          </div>
                          {partidosFinalizados.map((partido) => renderPartidoCard(partido))}
                        </>
                      )}
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
                    const esAplazado = partido.estado === "aplazado";
                    const esFinalizado = Boolean(partido.resultado_oficial) || partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado";
                    const hace2Horas = new Date().getTime() >= new Date(partido.fecha_hora_partido).getTime() + 2 * 60 * 60 * 1000;
                    return esFinalizado || esAplazado || hace2Horas;
                  };

                  const partidosActivosPublicos = partidos
                    .filter((p) => !esPartidoCerrado(p))
                    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());

                  const partidosCerradosPublicos = partidos
                    .filter((p) => esPartidoCerrado(p))
                    .sort((a, b) => new Date(a.fecha_hora_partido).getTime() - new Date(b.fecha_hora_partido).getTime());

                  const renderTablaPronosticoPartido = (partido: any) => {
                    const horaCierre = new Date(new Date(partido.fecha_hora_partido).getTime() - 30 * 60 * 1000);
                    const estaCerrado = new Date() >= horaCierre || usuario?.rol_id === 2;

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
                      {consolidados?.tablaPosiciones?.[0]?.nombre_completo || "Cargando..."}
                    </strong>
                    {consolidados?.tablaPosiciones?.[0] && (
                      <span style={{ fontSize: "0.8rem", color: "#a5b4fc", fontWeight: 700 }}>
                        {consolidados.tablaPosiciones[0].pts_total} Pts acumulados
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
                />
              )}
            </div>
          )}

          {/* TAB 5: PANEL ADMINISTRADOR (SOLO PARA ADMINISTRADORES) */}
          {tabActiva === "admin" && usuario.rol_id === 2 && (
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
                      Partidos Programados
                    </div>
                    <strong style={{ fontSize: "1.6rem", color: "#ffffff", fontWeight: 900 }}>
                      {partidos.length}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECCIÓN GESTIÓN POR PARTIDO */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{ margin: 0 }}>Gestión por Partido</h2>
                    <p style={{ color: "var(--graderia)", margin: 0, fontSize: "0.85rem" }}>
                      Ingresa los resultados oficiales y selecciona los goleadores para liquidar los puntos de los participantes.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    {[1, 2].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFechaAdmin(f)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 20,
                          fontWeight: 800,
                          fontSize: "0.88rem",
                          background: fechaAdmin === f ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "rgba(255, 255, 255, 0.06)",
                          color: fechaAdmin === f ? "#ffffff" : "var(--graderia)",
                          border: fechaAdmin === f ? "1px solid #10b981" : "1px solid var(--linea)",
                          boxShadow: fechaAdmin === f ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none",
                          cursor: "pointer",
                        }}
                      >
                        ⚽ Fecha {f}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleDescargarExcelPronosticos(undefined, fechaAdmin)}
                      style={{ padding: "8px 16px", fontSize: "0.85rem", background: "linear-gradient(135deg, #059669 0%, #047857 100%)", color: "#fff", border: "1px solid #10b981", fontWeight: 800 }}
                    >
                      📥 Descargar Excel Fecha {fechaAdmin}
                    </button>
                  </div>
                </div>
              </div>

              {/* LISTA DE PARTIDOS EN ADMIN SEPARADOS POR ACTIVOS Y FINALIZADOS */}
              {(() => {
                const estaSoloFinal = (partido: any) => {
                  const esAplazado = partido.estado === "aplazado";
                  const esFinalizado = Boolean(partido.resultado_oficial) || partido.estado === "resultado_cargado" || partido.estado === "puntaje_calculado";
                  const hace2Horas = new Date().getTime() >= new Date(partido.fecha_hora_partido).getTime() + 2 * 60 * 60 * 1000;
                  return esFinalizado || esAplazado || hace2Horas;
                };

                const partidosAdminFiltrados = partidos.filter(
                  (p) => fechaAdmin === 0 || p.jornada === fechaAdmin
                );

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

                const renderPartidoAdminCard = (partido: any) => {
                  const pronosticosPartido = (consolidados?.prediccionesPartidos || []).filter((p: any) => p.partido_id === partido.id);

                  return (
                    <div key={partido.id} className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <h3 style={{ margin: 0, color: "#ffffff" }}>
                            {partido.equipo_local.nombre} VS {partido.equipo_visitante.nombre}
                          </h3>
                          <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                            {pronosticosPartido.length} pronósticos recibidos
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                            onClick={() => setPartidoAdminVer(partidoAdminVer === partido.id ? null : partido.id)}
                          >
                            <Users size={14} /> Ver Participantes
                          </button>

                          <button
                            className="btn btn-primary"
                            style={{ padding: "6px 12px", fontSize: "0.82rem", background: "#10b981", color: "#fff" }}
                            onClick={() => handleDescargarExcelPronosticos(partido.id)}
                          >
                            <Download size={14} /> Descargar Excel
                          </button>
                        </div>
                      </div>

                      {/* TABLA DE PRONÓSTICOS DE PARTICIPANTES */}
                      {partidoAdminVer === partido.id && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed rgba(255,255,255,0.15)" }}>
                          {pronosticosPartido.length === 0 ? (
                            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>No hay pronósticos registrados para este partido aún.</p>
                          ) : (
                            <div style={{ overflowX: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                                <thead>
                                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8" }}>
                                    <th style={{ padding: "8px" }}>Participante</th>
                                    <th style={{ padding: "8px", textAlign: "center" }}>Marcador Predicho</th>
                                    <th style={{ padding: "8px", textAlign: "center" }}>Ganador Predicho</th>
                                    <th style={{ padding: "8px" }}>Goleador Predicho</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pronosticosPartido.map((p: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: "1px dashed rgba(255,255,255,0.08)" }}>
                                      <td style={{ padding: "8px", fontWeight: 700, color: "#ffffff" }}>
                                        {p.usuario.nombre_completo} <span style={{ color: "#64748b", fontSize: "0.78rem" }}>({p.usuario.correo})</span>
                                      </td>
                                      <td style={{ padding: "8px", textAlign: "center", fontWeight: 900, color: "#34d399", fontSize: "1rem" }}>
                                        {p.goles_local_predicho} - {p.goles_visitante_predicho}
                                      </td>
                                      <td style={{ padding: "8px", textAlign: "center" }}>
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
                                            <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 800 }}>
                                              {ganadorTexto}
                                            </span>
                                          );
                                        })()}
                                      </td>
                                      <td style={{ padding: "8px", color: "#f5b000", fontWeight: 600 }}>
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

                      {/* SECCIÓN CARGAR MARCADOR OFICIAL (ADMIN) */}
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 700 }}>
                          ⚽ Cargar Marcador Oficial:
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="number"
                            placeholder="Local"
                            style={{ width: 60, padding: "6px", borderRadius: 6, border: "1px solid var(--linea)", background: "var(--noche)", color: "#fff", textAlign: "center" }}
                            value={resultadosAdminInput[partido.id]?.local || ""}
                            onChange={(e) => handleResultadoAdminChange(partido.id, "local", e.target.value)}
                          />
                          <span style={{ fontWeight: 800 }}>-</span>
                          <input
                            type="number"
                            placeholder="Vis"
                            style={{ width: 60, padding: "6px", borderRadius: 6, border: "1px solid var(--linea)", background: "var(--noche)", color: "#fff", textAlign: "center" }}
                            value={resultadosAdminInput[partido.id]?.visitante || ""}
                            onChange={(e) => handleResultadoAdminChange(partido.id, "visitante", e.target.value)}
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 320 }}>
                          <select
                            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--linea)", background: "var(--noche)", color: "#fff", fontSize: "0.85rem" }}
                            value=""
                            onChange={(e) => {
                              handleAgregarGoleadorAdmin(partido.id, e.target.value);
                              e.target.value = "";
                            }}
                          >
                            <option value="">+ Agregar Goleador Oficial (Opcional)</option>
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
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                              {resultadosAdminInput[partido.id].goleadores_ids.map((jId) => {
                                const todosJugadores = [...(partido.equipo_local.jugadores || []), ...(partido.equipo_visitante.jugadores || []), ...jugadores];
                                const jObj = todosJugadores.find((j) => j.id === jId);
                                return (
                                  <span
                                    key={jId}
                                    style={{
                                      background: "rgba(34, 197, 94, 0.2)",
                                      color: "#22c55e",
                                      border: "1px solid rgba(34, 197, 94, 0.4)",
                                      borderRadius: "12px",
                                      padding: "3px 10px",
                                      fontSize: "0.78rem",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 6,
                                      fontWeight: 700,
                                    }}
                                  >
                                    ⚽ {jObj?.nombre || `ID: ${jId}`}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoverGoleadorAdmin(partido.id, jId)}
                                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 900, padding: "0 2px", fontSize: "0.85rem" }}
                                    >
                                      ✕
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <button
                          className="btn btn-primary"
                          style={{ padding: "6px 12px", fontSize: "0.82rem", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", color: "#fff" }}
                          onClick={() => handleCargarResultadoOficial(partido.id)}
                        >
                          ⚽ Publicar Resultado & Liquidar Puntos
                        </button>
                      </div>
                    </div>
                  );
                };

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {partidosActivosAdmin.map((partido) => renderPartidoAdminCard(partido))}

                    {partidosFinalizadosAdmin.length > 0 && (
                      <>
                        <div style={{ marginTop: 28, marginBottom: 8, borderTop: "2px dashed var(--linea)", paddingTop: 20 }}>
                          <h3 style={{ color: "#34d399", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                            🏁 Partidos Finalizados y Aplazados (Orden Cronológico)
                          </h3>
                        </div>
                        {partidosFinalizadosAdmin.map((partido) => renderPartidoAdminCard(partido))}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
