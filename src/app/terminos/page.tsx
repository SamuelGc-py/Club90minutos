"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function TerminosPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#04060A", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <header style={{ 
        position: "sticky", top: 0, zIndex: 100, 
        background: "rgba(4, 6, 10, 0.8)", backdropFilter: "blur(12px)", 
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
            <img 
              src="/logo_principal_recortado.webp" 
              alt="Logo Club 90 Minutos" 
              style={{ height: 40, width: "auto" }}
            />
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.5px", color: "#FFF" }}>
              CLUB<span style={{ color: "#74CC10" }}>90</span>MINUTOS
            </span>
          </Link>
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{ 
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", background: "transparent", color: "#FFFFFF", 
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", 
            fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s"
          }}>
            <ArrowLeft size={16} /> Volver
          </button>
        </Link>
      </header>

      {/* CONTENT */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "60px 20px" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <ShieldCheck size={48} color="#74CC10" />
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "2.5rem", fontWeight: 900, margin: 0 }}>
            TÉRMINOS Y CONDICIONES
          </h1>
        </div>

        <div style={{ 
          background: "#1A1F26", borderRadius: 16, padding: "40px", border: "1px solid rgba(255,255,255,0.05)",
          color: "#E5E7EB", lineHeight: 1.7, fontSize: "1rem"
        }}>
          
          <h3 style={{ color: "#74CC10", fontSize: "1.3rem", fontWeight: 800, marginTop: 0, marginBottom: 16 }}>1. Objeto</h3>
          <p style={{ marginBottom: 32 }}>
            La Polla Liga BetPlay DIMAYOR 2026-II (y demás torneos organizados por Club 90 Minutos) es un juego de predicciones en el que los participantes pondrán a prueba sus conocimientos sobre el fútbol profesional pronosticando diferentes eventos del campeonato. Durante el desarrollo del torneo, los participantes acumularán puntos de acuerdo con la precisión de sus predicciones. Al finalizar la competencia, los participantes con mayor puntaje serán los ganadores de la bolsa de premios, de conformidad con el presente reglamento.
            La participación en el juego implica la aceptación total de los presentes términos y condiciones.
          </p>

          <h3 style={{ color: "#74CC10", fontSize: "1.3rem", fontWeight: 800, marginBottom: 16 }}>2. Inscripción</h3>
          <ul style={{ marginBottom: 32, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>El valor de la inscripción varía según el torneo y se comunicará previamente.</li>
            <li>Para habilitar su participación, cada jugador deberá cancelar el monto estipulado en las fechas acordadas.</li>
            <li>El participante que no complete el pago dentro del plazo establecido perderá automáticamente su cupo y no podrá continuar participando. Los puntos obtenidos hasta ese momento permanecerán registrados únicamente como histórico y no serán tenidos en cuenta para continuar compitiendo ni para optar por premios.</li>
            <li>Los valores abonados no serán reembolsables.</li>
          </ul>

          <h3 style={{ color: "#74CC10", fontSize: "1.3rem", fontWeight: 800, marginBottom: 16 }}>3. Bolsa de premios</h3>
          <p style={{ marginBottom: 32 }}>
            Todo el dinero efectivamente recaudado por concepto de inscripciones conformará la bolsa general de premios.
            De dicha bolsa se descontará previamente un porcentaje correspondiente a gastos de administración (generalmente 20%).
            El valor restante será distribuido entre los primeros lugares según la estructura de premios que se anuncie para cada torneo específico.
          </p>

          <h3 style={{ color: "#74CC10", fontSize: "1.3rem", fontWeight: 800, marginBottom: 16 }}>4. Sistema de puntuación</h3>
          <p style={{ marginBottom: 16 }}>Durante todo el torneo, los jugadores acumularán puntos según el nivel de acierto en sus predicciones.</p>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 16, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8, marginBottom: 8, fontWeight: 700 }}>
              <span>Predicción</span>
              <span>Puntaje</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Campeón</span><span style={{ color: "#74CC10", fontWeight: 800 }}>30 puntos</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Finalistas</span><span style={{ color: "#74CC10", fontWeight: 800 }}>25 puntos</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Clasificados (por equipo)</span><span style={{ color: "#74CC10", fontWeight: 800 }}>20 puntos</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Goleador del Torneo</span><span style={{ color: "#74CC10", fontWeight: 800 }}>15 puntos</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Resultado correcto del partido</span><span style={{ color: "#74CC10", fontWeight: 800 }}>5 puntos</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Ganador del partido</span><span style={{ color: "#74CC10", fontWeight: 800 }}>3 puntos</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Goleador del partido</span><span style={{ color: "#74CC10", fontWeight: 800 }}>2 puntos</span></div>
          </div>

          <h3 style={{ color: "#74CC10", fontSize: "1.3rem", fontWeight: 800, marginBottom: 16 }}>5. Tipos de predicciones y reglas</h3>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>5.1. Predicciones iniciales</p>
          <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
            <li>Estas predicciones podrán modificarse libremente hasta el cierre oficial de los pronósticos iniciales.</li>
            <li>Una vez finalizado este plazo, no podrán ser modificadas bajo ninguna circunstancia.</li>
          </ul>
          
          <p style={{ fontWeight: 700, marginBottom: 8 }}>5.2. Pronósticos de cada partido</p>
          <ul style={{ marginBottom: 32, paddingLeft: 20 }}>
            <li>Los pronósticos deberán registrarse como máximo <strong>una (1) hora o 30 minutos antes</strong> del inicio oficial del partido, según lo determine el sistema.</li>
            <li><strong>Resultado correcto:</strong> El resultado válido será el marcador al finalizar los 90 minutos reglamentarios, incluyendo tiempo de reposición.</li>
            <li><strong>Ganador del partido:</strong> Se otorgarán 3 puntos cuando el participante acierte el resultado general del encuentro.</li>
            <li><strong>Goleador:</strong> Se otorgarán 2 puntos cuando el jugador seleccionado marque al menos un (1) gol. Serán válidos todos los goles anotados durante los 90 minutos reglamentarios más el tiempo de adición. Los goles convertidos durante una tanda de penales no serán tenidos en cuenta. Los autogoles quedan excluidos.</li>
          </ul>

          <h3 style={{ color: "#74CC10", fontSize: "1.3rem", fontWeight: 800, marginBottom: 16 }}>6. Registro y Horario de cierre</h3>
          <ul style={{ marginBottom: 32, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>Una predicción se considerará oficialmente registrada únicamente cuando haya sido almacenada correctamente por la plataforma.</li>
            <li>Es responsabilidad exclusiva de cada jugador registrar sus predicciones dentro del plazo correspondiente.</li>
            <li>Todos los horarios de apertura y cierre de los pronósticos se publicarán y ejecutarán con base en la <strong>hora oficial de Colombia (COT)</strong>.</li>
          </ul>

          <h3 style={{ color: "#74CC10", fontSize: "1.3rem", fontWeight: 800, marginBottom: 16 }}>7. Cambios de horario y reprogramaciones</h3>
          <ul style={{ marginBottom: 32, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>Cuando un partido sea adelantado, el cierre de los pronósticos también será adelantado.</li>
            <li>Si un partido es suspendido después de haber iniciado, los pronósticos permanecerán en pausa hasta que este se reanude o se declare finalizado.</li>
            <li>Si un partido es cancelado definitivamente y no llega a disputarse, todas las predicciones correspondientes serán anuladas.</li>
          </ul>

          <h3 style={{ color: "#74CC10", fontSize: "1.3rem", fontWeight: 800, marginBottom: 16 }}>8. Criterio de desempate</h3>
          <p style={{ marginBottom: 16 }}>En caso de empate en el puntaje total entre dos o más participantes al finalizar el torneo, la posición final se definirá aplicando, en el siguiente orden:</p>
          <ol style={{ marginBottom: 32, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}><strong>Mayor cantidad de resultados correctos acertados:</strong> Tendrá prioridad el participante que haya obtenido el mayor número de aciertos en la categoría Resultado correcto.</li>
            <li><strong>Fecha y hora del registro de las predicciones iniciales:</strong> Si el empate persiste, tendrá prioridad el participante cuya última modificación registrada por la plataforma para las predicciones iniciales tenga la fecha y hora más antigua.</li>
          </ol>

          <h3 style={{ color: "#74CC10", fontSize: "1.3rem", fontWeight: 800, marginBottom: 16 }}>9. Información oficial y Reclamaciones</h3>
          <p style={{ marginBottom: 32 }}>
            Toda la información utilizada para la asignación de puntos tendrá como fuente oficial a la entidad organizadora del torneo real (ej. DIMAYOR).
            Si un participante detecta diferencias entre el pronóstico registrado y el visible en su cuenta, podrá presentar una reclamación desde el cierre del pronóstico hasta antes del inicio oficial del partido.
            La administración podrá corregir en cualquier momento errores materiales, aritméticos o de digitación detectados en la plataforma.
          </p>

          <div style={{ padding: 20, background: "rgba(255,255,255,0.05)", borderRadius: 12, marginTop: 40, borderLeft: "4px solid #74CC10" }}>
            <p style={{ margin: 0, fontStyle: "italic", fontSize: "0.95rem" }}>
              "La administración de CLUB 90 MINUTOS se reserva el derecho de validar cualquier situación no prevista expresamente en este documento, siempre bajo criterios de transparencia, equidad y respeto por las reglas aquí establecidas."
            </p>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ 
        borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 20px", 
        textAlign: "center", color: "#6B7280", fontSize: "0.85rem", background: "#04060A"
      }}>
        &copy; {new Date().getFullYear()} Club 90 Minutos. Todos los derechos reservados.
      </footer>
    </div>
  );
}
