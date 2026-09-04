# NO ejecutar estos scripts

`ajustar-puntos.ts` y `sincronizar-maestro.ts` fueron la causa raíz de que la Tabla de Posiciones
mostrara el total correcto de cada participante pero con la distribución por categoría (Marcador
Exacto / Ganador Partido / Goleadores) equivocada.

## Qué hacían mal

Cuando el total calculado desde los partidos reales no coincidía con la tabla maestra, insertaban
**toda la diferencia como una sola fila `Puntaje` con `categoria: 'ganador_partido'` y
`partido_id: null`**. Eso deja el total bien (por eso el bug pasó desapercibido tanto tiempo) pero
infla artificialmente "Ganador Partido" y deja "Marcador Exacto" y "Goleadores" por debajo de su
valor real, porque un valor real de esas categorías **siempre** tiene un `partido_id` — nunca es
`null`.

## Qué usar en su lugar

- **Si un partido no suma puntos después de liquidarlo:** usa el botón "🔄 Reliquidar Todo" en el
  panel admin (sección Tabla de Posiciones), o el script `scripts/reliquidar-puntos.ts` /
  el endpoint `/api/admin/reliquidar-todo`. Recalculan los puntos reales partido por partido, sin
  inventar ajustes.
- **Si después de reliquidar todo el total sigue sin coincidir con tu tabla maestra** (porque a
  algún partido le falta un pronóstico, un resultado, o un goleador cargado en la base de datos):
  la causa está en los datos de ese partido específico, no en la lógica de puntos. Corrige el dato
  faltante (pronóstico/resultado/goleador) y vuelve a reliquidar — no fuerces el total con un ajuste
  a mano.
- **Si de verdad necesitas un ajuste manual puntual** (una corrección disputada, por ejemplo): usa
  `scripts/corregir-categorias-desde-maestro.ts`, que reparte el ajuste entre las tres categorías
  según `scripts/maestro-categorias.json` en vez de dumpearlo todo en una sola, y nunca usa
  `categoria: 'goleador'` con `partido_id: null` (eso se contaría como "goleador del torneo", una
  categoría totalmente distinta — ver `src/app/api/consolidados/route.ts`).

Estos dos archivos se quedan aquí solo como referencia histórica de qué pasó. No los borres al
menos hasta que la Fase de validación de la corrección (ver informe del 2026-09-04) esté cerrada,
pero **no los vuelvas a ejecutar**.
