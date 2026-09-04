# Reglas de Puntuación — Club 90 Minutos

Este documento detalla cómo se asignan los puntos en la polla deportiva. La implementación técnica vive en [`src/lib/calculadorPuntos.ts`](../src/lib/calculadorPuntos.ts).

---

## Puntos por Partido

Cada partido liquidado puede otorgar hasta **10 puntos** a un participante:

| Categoría | Puntos | Condición |
|-----------|--------|-----------|
| **Ganador / Empate** | 3 | El participante acertó quién ganó el partido (o que fue empate). Se compara si la predicción da victoria local, visitante o empate, contra el resultado real. |
| **Marcador Exacto** | 5 | El participante acertó el marcador exacto (ej: predijo 2-1 y el partido terminó 2-1). **Se suma además de los 3 del ganador** → total 8 por marcador exacto. |
| **Goleador** | 2 | El participante acertó a uno de los jugadores que anotó gol en el partido. Caso especial: si predijo 0-0 sin goleador y el partido terminó 0-0, también recibe los 2 puntos. |

### Ejemplo

| Predicción | Resultado Real | Puntos |
|-----------|---------------|--------|
| Junior 2 - Nacional 1 (Goleador: Borja) | Junior 2 - Nacional 1 (Goleadores: Borja, Bacca) | **3** (ganador) + **5** (exacto) + **2** (goleador Borja) = **10** |
| Junior 1 - Nacional 0 (Goleador: Borja) | Junior 2 - Nacional 1 (Goleadores: Borja, Bacca) | **3** (ganador) + **2** (goleador Borja) = **5** |
| Junior 1 - Nacional 1 (Goleador: Bacca) | Junior 2 - Nacional 1 (Goleadores: Borja, Bacca) | **0** (no acertó ganador/empate) |
| Cali 0 - Tolima 0 (Sin goleador) | Cali 0 - Tolima 0 | **3** (empate) + **5** (exacto) + **2** (0-0 correcto) = **10** |

---

## Puntos de Torneo (Predicciones Iniciales)

Estos se liquidan al final del torneo o cuando se confirmen los clasificados/finalistas/campeón:

| Categoría | Puntos | Condición |
|-----------|--------|-----------|
| **Clasificados a Cuadrangulares** | 3 por acierto | Por cada equipo que el participante incluyó en sus 8 clasificados y efectivamente clasificó. Máximo: 24 pts (8 × 3). |
| **Finalistas** | 5 por acierto | Acertar cada uno de los 2 equipos que llegaron a la final. Máximo: 10 pts. |
| **Campeón** | 10 | Acertar el equipo que ganó el torneo. |
| **Goleador del Torneo** | 5 | Acertar al máximo goleador del torneo. |

**Máximo teórico de torneo:** 24 + 10 + 10 + 5 = **49 puntos**.

---

## Flujo de Liquidación

```
Partido en curso
    ↓
Partido finalizado (ESPN reporta STATUS_FULL_TIME o admin carga resultado manualmente)
    ↓
Se guarda ResultadoOficial (marcador + goleadores)
    ↓
Se cambia estado del partido → "resultado_cargado"
    ↓
Se recorren TODAS las PrediccionPartido de ese partido
    ↓
Por cada predicción:
  - ¿Acertó ganador/empate? → +3 puntos (categoría: ganador_partido)
  - ¿Acertó marcador exacto? → +5 puntos (categoría: resultado_exacto)
  - ¿Acertó goleador? → +2 puntos (categoría: goleador)
    ↓
Se borran los Puntaje previos del partido (para reliquidaciones)
    ↓
Se insertan los nuevos Puntaje en una transacción atómica
```

---

## Reliquidación

Si se detecta un error en el resultado o los goleadores:

1. Se puede usar `/api/admin/quitar-resultado` para revertir un partido individual.
2. Se puede usar `/api/admin/reliquidar-todo` para recalcular **todos** los partidos desde cero.
3. La liquidación siempre borra los puntajes previos del partido antes de recalcular (operación idempotente).

---

## Tabla de Posiciones

La tabla de posiciones es **100% dinámica**: se calcula sumando todos los registros de la tabla `Puntaje` agrupados por `usuario_id`. No hay campo "puntos totales" almacenado — siempre es un agregado en tiempo real.

Si se quita el resultado de un partido, los puntajes asociados se eliminan automáticamente y la tabla se actualiza sola.
