import React from "react";

export function TerminosCompletos() {
  return (
    <div style={{ textAlign: "left", lineHeight: 1.6, color: "#E5E7EB", fontSize: "0.95rem" }}>
      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>1. Objeto</h3>
      <p>
        La Club 90 Minutos DIMAYOR 2026-II es un juego de predicciones en el que los participantes
        pondrán a prueba sus conocimientos sobre el fútbol profesional colombiano pronosticando
        diferentes eventos del campeonato. Durante el desarrollo del torneo, los participantes
        acumularán puntos de acuerdo con la precisión de sus predicciones. Al finalizar la
        competencia, los tres participantes con mayor puntaje serán los ganadores de la bolsa de
        premios, de conformidad con el presente reglamento.
      </p>
      <p>
        La participación en el juego implica la aceptación total de los presentes términos y condiciones.
      </p>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>2. Inscripción</h3>
      <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        <li>El valor de la inscripción será de <strong>$50.000 COP por cada cupo.</strong></li>
        <li>Las inscripciones estarán habilitadas hasta el <strong>23 de julio de 2026</strong>, un día antes del inicio oficial de la Liga BetPlay DIMAYOR 2026-II.</li>
        <li>Para habilitar su participación, cada jugador deberá cancelar como mínimo el <strong>50 % del valor de la inscripción ($25.000 COP).</strong></li>
        <li>El saldo restante deberá ser cancelado, como plazo máximo, antes del inicio del primer partido correspondiente a la <strong>fecha 6</strong> del campeonato.</li>
        <li>El participante que no complete el pago dentro del plazo establecido perderá automáticamente su cupo y no podrá continuar participando. Los puntos obtenidos hasta ese momento permanecerán registrados únicamente como histórico y no serán tenidos en cuenta para continuar compitiendo ni para optar por premios.</li>
        <li>Los valores abonados no serán reembolsables.</li>
      </ul>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>3. Bolsa de premios</h3>
      <p>Todo el dinero efectivamente recaudado por concepto de inscripciones conformará la bolsa general de premios.</p>
      <p>De dicha bolsa se descontará previamente un <strong>20 % correspondiente a gastos de administración.</strong></p>
      <p>El valor restante será distribuido entre los cinco (5) primeros lugares de la siguiente manera:</p>
      <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        <li><strong>Primer puesto:</strong> 40 %</li>
        <li><strong>Segundo puesto:</strong> 30 %</li>
        <li><strong>Tercer puesto:</strong> 15 %</li>
        <li><strong>Cuarto puesto:</strong> 10%</li>
        <li><strong>Quinto puesto:</strong> 5%</li>
      </ul>
      <p>Los pagos parciales realizados por participantes que posteriormente pierdan su cupo también harán parte de la bolsa general de premios.</p>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>4. Sistema de puntuación</h3>
      <p>Durante todo el torneo, los jugadores acumularán puntos según el nivel de acierto en sus predicciones.</p>
      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 400 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
              <th style={{ padding: 12 }}>Predicción</th>
              <th style={{ padding: 12 }}>Puntaje</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: 12 }}>Campeón</td>
              <td style={{ padding: 12, fontWeight: 800, color: "#74CC10" }}>30 puntos</td>
            </tr>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: 12 }}>Finalistas</td>
              <td style={{ padding: 12, fontWeight: 800, color: "#74CC10" }}>25 puntos</td>
            </tr>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: 12 }}>Equipos clasificados a cuadrangulares (por equipo acertado)</td>
              <td style={{ padding: 12, fontWeight: 800, color: "#74CC10" }}>20 puntos</td>
            </tr>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: 12 }}>Goleador del Torneo</td>
              <td style={{ padding: 12, fontWeight: 800, color: "#74CC10" }}>15 puntos</td>
            </tr>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: 12 }}>Resultado correcto del partido</td>
              <td style={{ padding: 12, fontWeight: 800, color: "#74CC10" }}>5 puntos</td>
            </tr>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: 12 }}>Ganador del partido</td>
              <td style={{ padding: 12, fontWeight: 800, color: "#74CC10" }}>3 puntos</td>
            </tr>
            <tr>
              <td style={{ padding: 12 }}>Goleador del partido</td>
              <td style={{ padding: 12, fontWeight: 800, color: "#74CC10" }}>2 puntos</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>5. Tipos de predicciones y reglas</h3>
      <h4 style={{ fontWeight: 700, color: "#38bdf8", marginTop: 16 }}>5.1. Predicciones iniciales</h4>
      <p>Las siguientes predicciones deberán realizarse antes del cierre oficial de esta etapa que será al finalizar el último partido de la fecha 5 del torneo:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Campeón del torneo.</li>
        <li>Dos (2) equipos finalistas.</li>
        <li>Ocho equipos clasificados a los cuadrangulares semifinales.</li>
        <li>Goleador del torneo</li>
      </ul>
      <p>Estas predicciones podrán modificarse libremente hasta el cierre oficial de los pronósticos iniciales. Una vez finalizado este plazo, no podrán ser modificadas bajo ninguna circunstancia.</p>
      
      <h4 style={{ fontWeight: 700, color: "#E5E7EB", marginTop: 12 }}>5.1.1. Campeón</h4>
      <p>El participante deberá pronosticar el club que obtendrá el título de campeón. Se otorgarán <strong>30 puntos</strong> únicamente si acierta exactamente el campeón. Esta categoría es <strong>acumulable</strong> con la predicción de finalistas.</p>
      
      <h4 style={{ fontWeight: 700, color: "#E5E7EB", marginTop: 12 }}>5.1.2. Finalistas</h4>
      <p>Se otorgarán <strong>25 puntos</strong> por cada equipo finalista acertado, para un máximo de <strong>50 puntos</strong> si acierta ambos. El orden en que sean registrados no tendrá ninguna incidencia. El puntaje se asignará sin importar cuál de los dos ocupe la condición de local o visitante.</p>
      
      <h4 style={{ fontWeight: 700, color: "#E5E7EB", marginTop: 12 }}>5.1.3. Equipos clasificados</h4>
      <p>Se otorgarán <strong>20 puntos por cada equipo acertado</strong>, para un máximo de <strong>160 puntos</strong>. El orden no tiene incidencia.</p>
      
      <h4 style={{ fontWeight: 700, color: "#E5E7EB", marginTop: 12 }}>5.1.4. Goleador del Torneo</h4>
      <p>Se otorgarán <strong>15 puntos</strong> a los participantes que acierten el goleador oficial. En caso de empate de goleadores, se considerará válida cualquiera de esas selecciones.</p>

      <h4 style={{ fontWeight: 700, color: "#38bdf8", marginTop: 16 }}>5.2. Pronósticos de cada partido</h4>
      <p>Para cada encuentro, el participante deberá registrar: Resultado exacto, Ganador del partido y Jugador que marcará al menos un gol. Los pronósticos deberán registrarse como máximo <strong>una (1) hora antes del inicio oficial del partido</strong>.</p>

      <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        <li><strong>5.2.1. Resultado correcto:</strong> Se otorgarán <strong>5 puntos</strong> por marcador exacto acertado. Válido al finalizar los 90 minutos reglamentarios, incluyendo reposición.</li>
        <li><strong>5.2.2. Ganador del partido:</strong> Se otorgarán <strong>3 puntos</strong>. Independiente y acumulable con resultado correcto. No será válido registrar un ganador diferente al reflejado en el marcador exacto pronosticado.</li>
        <li><strong>5.2.3. Goleador:</strong> Se otorgarán <strong>2 puntos</strong>. La cantidad de goles no incrementará el puntaje. Disponible opción "Ninguno" (0-0). Válidos todos los goles anotados en 90 min + adición. Penales y autogoles quedan excluidos.</li>
      </ul>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>6. Registro de pronósticos</h3>
      <p>Una predicción se considerará oficialmente registrada únicamente cuando haya sido almacenada correctamente por la plataforma y quede visible en la cuenta del participante antes del cierre. Si no queda registrado, se entenderá como no presentado. Es <strong>responsabilidad exclusiva</strong> del jugador registrar sus predicciones dentro del plazo.</p>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>7. Horario oficial de cierre de predicciones</h3>
      <p>Horario oficial aplicable será el de Colombia (COT - UTC-5). El cierre para predicciones por partido será <strong>1 hora antes</strong> del inicio oficial del encuentro.</p>
      <p>No se aceptarán reclamaciones por diferencias horarias derivadas de la ubicación geográfica, cambios automáticos de reloj o errores de sincronización.</p>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>8. Cambios de horario y reprogramaciones</h3>
      <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        <li>Si se adelanta un partido, el cierre se adelanta para conservar una hora de anticipación.</li>
        <li>Si se reprograma con diferencia superior a <strong>72 horas</strong>, la administración podrá reabrir los pronósticos. Si es inferior a 72 horas, permanecen los registrados.</li>
        <li>Si un partido es suspendido después de iniciado, los pronósticos permanecen en pausa hasta que se reanude o DIMAYOR lo declare finalizado.</li>
        <li>Si es cancelado definitivamente, todas las predicciones serán anuladas.</li>
      </ul>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>9. Clasificación general</h3>
      <p>Determinada por la suma total de puntos obtenidos durante todo el campeonato.</p>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>10. Criterio de desempate</h3>
      <p>En caso de empate en el puntaje total, se definirá aplicando en el siguiente orden:</p>
      <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        <li><strong>Mayor cantidad de resultados correctos acertados</strong> (marcador exacto) durante todo el campeonato.</li>
        <li><strong>Fecha y hora del registro</strong> de las predicciones iniciales (quien lo hizo antes). Se tomará en cuenta: Fecha, Hora, Minutos y Segundos.</li>
      </ol>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>11. Información oficial</h3>
      <p>La fuente oficial será la <strong>DIMAYOR</strong>. Esto incluye Resultados oficiales, Marcadores, Goleadores, Calendario, Reprogramaciones, Suspensiones, etc.</p>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>12. Casos no previstos</h3>
      <p>En situaciones extraordinarias, la administración adoptará la decisión que mejor preserve la equidad y transparencia.</p>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>13. Reclamaciones</h3>
      <p>Podrá presentar una reclamación <strong>desde el cierre del pronóstico hasta antes del inicio oficial del partido</strong>. Una vez iniciado, no se recibirán reclamaciones sobre registros correspondientes a ese partido.</p>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>14. Corrección de errores</h3>
      <p>La administración podrá corregir en cualquier momento errores materiales, aritméticos o de digitación detectados en la plataforma.</p>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>15. Responsable de la administración del juego</h3>
      <p>A cargo de: <strong>Nelson Berdugo de los Reyes, Juan Hernández, Andrés del Toro y Samuel Gutiérrez</strong>.</p>
      
      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>16. Transparencia</h3>
      <p>Cada participante podrá visualizar únicamente sus propios pronósticos mientras el periodo de registro permanezca abierto. Una vez finalizado el plazo, todos los participantes podrán consultar los pronósticos de los demás jugadores.</p>

      <h3 style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 24 }}>17. y 18. Disposición final</h3>
      <p>Los ejemplos en este reglamento son ilustrativos. La administración se reserva el derecho de validar cualquier situación no prevista bajo criterios de equidad y respeto.</p>
    </div>
  );
}
