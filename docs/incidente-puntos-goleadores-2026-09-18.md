# Nota: pérdida recurrente de puntos de goleador — causa raíz y solución (2026-09-18)

## Síntoma

La tabla de posiciones de la app mostraba menos puntos que el respaldo manual verificado
("tabla blanca"). Ejemplo: Juan Hernández 223 en la app vs 229 en el respaldo.

## Diagnóstico (hecho con datos reales de producción, no con suposiciones)

1. Se comparó columna por columna la tabla de producción contra el respaldo:
   **"Resultados Correctos" y "Ganador Partido" coincidían EXACTAMENTE en los 16
   participantes.** El 100% de la diferencia (66 pts = 33 aciertos) estaba en la
   columna **Goleadores**.

2. Se recalcularon los puntos desde los datos crudos de producción con el mismo
   algoritmo: dieron **exactamente** lo mismo que lo almacenado (0 diferencias en los
   16 participantes). Conclusión: **el motor de cálculo no estaba fallando; faltaban
   los datos de entrada.**

3. De los 85 partidos liquidados, **10 tenían goles pero cero goleadores válidos**:
   toda la jornada 1 (partidos 21, 22, 24-30) y el partido 79. En la base quedaban
   registros "fantasma" en `resultado_goleador` con `jugador_id = NULL`, así que el
   partido *parecía* liquidado con goleadores, pero nadie podía sumar por goleador.

## Causa raíz (dos fallas encadenadas)

**A. El cron de ESPN leía un campo que no existe.**
En `src/app/api/cron/espn/route.ts` se leía:

```ts
detail.participants?.[0]?.athlete?.displayName   // NO EXISTE en esa respuesta
```

El campo real de la API de ESPN es `detail.athletesInvolved[0].displayName` (verificado
contra la API en vivo). El nombre salía siempre `undefined`, así que `goleadoresIds`
quedaba **siempre vacío**.

**B. `calcularPuntosPartido` borraba los goleadores a partir de esa lista vacía.**
El motor hacía `deleteMany` de `ResultadoGoleador` y los recreaba desde el *parámetro*
recibido, y además calculaba los puntos con ese parámetro en vez de con lo persistido.
Resultado: cada vez que el cron tocaba un partido, **borraba sus goleadores oficiales y
los puntos derivados**. Por eso la falla era *recurrente*: volvía a aparecer después de
cada corrección manual.

Agravante histórico: la tabla `jugador` fue recreada en algún momento (ver regla 9 de
`AGENTS.md`), lo que generó IDs nuevos y dejó huérfanas las referencias viejas; esas
referencias terminaron en `NULL`, que es lo que quedó como registro fantasma.

Agravante adicional: `fix-table` hacía `puntaje.deleteMany()` **sin filtro**, borrando
también las filas de ajuste manual. Por eso las homologaciones anteriores se perdían.

## Solución estructural aplicada

### 1. Motor (`src/lib/calculadorPuntos.ts`) — reescrito con 4 garantías

- **No destrucción implícita**: si el llamador no envía goleadores (`undefined`), se
  preservan los guardados. Si envía lista vacía para un partido **con goles** que ya
  tenía goleadores, también se preservan, salvo `forzarVaciarGoleadores: true`.
- **Fuente única de verdad**: los puntos se calculan leyendo los goleadores **ya
  persistidos**, no el parámetro. Reliquidar dos veces da siempre lo mismo.
- **Atomicidad total**: resultado oficial + goleadores + estado + puntajes se escriben
  en **una sola** `$transaction` (antes el borrado de puntajes estaba en una transacción
  y el resto fuera; un OOM a mitad dejaba puntos borrados sin recrear).
- **Detección de fantasmas**: si un partido con goles queda sin ningún goleador válido,
  se registra una advertencia explícita en el log y en la respuesta de la API.

### 2. Llamadores corregidos

| Archivo | Cambio |
|---|---|
| `api/cron/espn/route.ts` | Lee `athletesInvolved` (con *fallback*); ignora autogoles; si no extrae ninguno y hubo goles, pasa `undefined` para preservar |
| `api/admin/cargar-resultado/route.ts` | Ya no borra/recrea goleadores por su cuenta: delega en el motor (una sola transacción) |
| `api/admin/reliquidar-todo/route.ts` | Pasa `undefined`: reliquidar recalcula con los datos guardados, nunca los reescribe |
| `api/fix-table/route.ts` | Igual; y su `deleteMany()` ahora filtra `partido_id: { not: null }` para no borrar los ajustes |
| `lib/syncLive.ts` | Si el scraping no encuentra goleadores y hubo goles, preserva |

### 3. Recuperación de los datos destruidos

Los goleadores de los 10 partidos se recuperaron desde la **API oficial de ESPN**
(`?dates=YYYYMMDD`) y quedaron en `src/data/goleadores-recuperados-espn.json`
con su trazabilidad. 26 goles recuperados = exactamente los 26 goles que faltaban.

**Validación cruzada**: se comparó contra una copia de la base anterior a la pérdida
(snapshot del 2026-08-07). Los goleadores que ahí sobrevivían **coinciden por nombre**
con los de ESPN en los 9 partidos comparables, incluidos los 3 que necesitaron mapeo
manual por diferencias de nombre:

| Nombre en ESPN | Nombre en la BD | Equipo |
|---|---|---|
| Johan Andrés Martínez | Johan Martinez | Deportivo Cali |
| Enmerson Batalla (errata de ESPN) | Emerson Batalla | Atlético Bucaramanga |
| Jorge Cabezas | Jorge Hurtado | Deportes Tolima (es Jorge Cabezas Hurtado) |

Los `jugador_id` del snapshot son distintos (273 vs 1231, etc.), lo que confirma que la
recreación de la tabla `jugador` fue lo que dejó huérfanas las referencias. ESPN además
resultó **más completo**: el partido 24 tenía 3 de 5 goleadores y el 29 tenía 1 de 2.

### 4. Ajustes de homologación que ya no se pierden

Se agregaron dos campos a `Puntaje` (cambio aditivo, sin riesgo):

```prisma
es_ajuste  Boolean  @default(false)
motivo     String?
```

Un ajuste se guarda con `partido_id = null` **a propósito**: las reliquidaciones solo
borran filas con `partido_id` no nulo, así que ya no se pierden. `consolidados`
atribuye `goleador + sin partido + es_ajuste` a la columna *Goleadores* (no a *Goleador
del Torneo*, que es lo que significa `goleador` sin partido cuando no es ajuste).

### 5. Transparencia para los participantes

- `GET /api/historial-puntos?usuario_id=N` — desglose partido por partido: qué
  pronosticó, qué pasó, y cuántos puntos dio cada concepto.
- `&formato=excel` — descarga el historial en `.xlsx` (exceljs).
- `src/app/components/HistorialPuntosModal.tsx` — modal accesible desde la vista de
  Posiciones con el botón *"Ver de dónde salieron mis puntos"*.
- Los ajustes se muestran **aparte y con su motivo**, nunca disfrazados de acierto.

## Cómo aplicar la homologación

```bash
npx tsx scripts/hotfixes/ajustar_puntos_backup.ts                      # dry-run
npx tsx scripts/hotfixes/ajustar_puntos_backup.ts --aplicar            # aplica todo
npx tsx scripts/hotfixes/ajustar_puntos_backup.ts --aplicar --solo-restauracion
```

El script respalda a `backups/<timestamp>/` antes de escribir, es idempotente, y la
Fase C **exige coincidencia exacta** con `src/data/maestro-categorias.json` (sale con
código 1 si algo no cuadra).

## Estado y pendientes

- Verificado: `tsc --noEmit` y `npm run build` sin errores.
- Probado de extremo a extremo contra una base real: se simuló el daño exacto
  (goleador fantasma con `jugador_id` nulo) y el script lo restauró correctamente; la
  Fase C dio OK en los 16 participantes; el endpoint de historial y el Excel funcionan.
- **PENDIENTE — ejecución en producción**: no se pudo ejecutar contra la base de
  producción porque las credenciales del `.env` local apuntan a una copia vieja
  (19 partidos liquidados vs 85 en producción). Hace falta correr, con la
  `DATABASE_URL` de producción:
  1. `npx prisma db push` (agrega `es_ajuste` y `motivo`; es aditivo)
  2. `npx tsx scripts/hotfixes/ajustar_puntos_backup.ts` (dry-run, revisar)
  3. `npx tsx scripts/hotfixes/ajustar_puntos_backup.ts --aplicar`
- Al simular con datos de producción, la restauración desde ESPN deja **10 de 16**
  participantes coincidiendo exactamente con el respaldo; los 6 restantes difieren en
  1-2 aciertos de goleador y los cuadra la Fase B con ajustes explícitos y auditables.
  (Cuatro de esos seis predijeron *Yony González* en el partido 24, a quien ESPN no
  registra como goleador de ese partido. Si el respaldo manual es correcto, conviene
  revisar ese partido con Samuel.)
