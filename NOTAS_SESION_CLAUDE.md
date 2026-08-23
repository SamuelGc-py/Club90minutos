# Notas de la sesión — leer antes de tocar estos archivos

Este documento resume todo lo que se cambió en esta sesión sobre la landing de
inicio, la trivia, la Central de Datos/Oráculo, y varios bugs de datos. Si vas
a tocar alguno de estos archivos, lee esto primero para no revertir arreglos
que ya costaron varias vueltas.

## 1. Landing de "Inicio" (`src/app/dashboard/page.tsx`, `globals.css`)

- La landing (sidebar + hero de bienvenida/trivia) queda **estática, sin
  scroll de página**, tanto en PC como en celular. Esto se logra con las
  clases `app-fullscreen-lock` / `inicio-fullscreen` en `<body>`/`<html>` y
  una cadena flex (`participant-root` → `inicio-fullscreen-wrapper` →
  `inicio-layout-row`) que ocupa exactamente `100vh`. **No agregues
  `overflow: hidden` o alturas fijas sueltas por otro lado** sin revisar esta
  cadena, se rompe fácil.
- En celular, el menú del sidebar (`inicio-sidebar-nav`) está **colapsado por
  defecto** y se abre como **ventana flotante** (`position: absolute`) sobre
  el hero, no empuja el contenido. Tiene un backdrop invisible
  (`inicio-sidebar-menu-backdrop`) que lo cierra al tocar afuera.
  - El `.inicio-sidebar` tiene `overflow: visible !important` en celular
    a propósito — si le vuelves a poner `overflow: hidden/auto` ahí, el
    menú flotante se recorta y "desaparece".
- El sidebar y el hero **no tienen `border-radius`** en la landing (se sacó
  el ovalado a propósito, para que aprovechen el ancho completo).
- El ancho de la landing va **de borde a borde** en PC (sin el `maxWidth:
  1260` que sí tienen las demás pestañas) — es intencional, no es un bug.

## 2. Modales flotantes (Puntuaciones, Recomendaciones, Trivia)

- Los modales de "Tus Puntuaciones" y "Recomendaciones y Datos" usan un
  patrón de **cierre al hacer clic en el fondo** que hay que respetar: se
  trackea `mousedown` con un `useRef` y solo se cierra si tanto el
  `mousedown` como el `click` cayeron exactamente sobre el fondo
  (`e.target === e.currentTarget`). **No vuelvas al patrón simple de
  `onClick` + `stopPropagation`** — eso hacía que el modal se cerrara solo
  si el usuario seleccionaba texto o hacía scroll con el dedo y soltaba
  fuera del modal.

## 3. Trivia (`TriviaModal.tsx`, `api/ai/trivia/route.ts`)

- Colores: **verde/navy de marca** (`#1db954`, `#0f172a`), no rojo/negro.
- Logo: se usa `/marca/logo-club90-escudo-balon.webp` (el escudo con balón y
  velocímetro, recortado con `sharp`) con `border-radius: 50%` en vez de
  íconos genéricos.
- Tono: **nada de "perra" ni frases muy ñeras** — el público es ~80%
  costeño. Se usan frases tipo "¡Eche, esa te quedó grande!".
- El backend genera preguntas rotando entre 8 categorías al azar y
  **prohíbe explícitamente** la pregunta de manual "¿quién es el máximo
  goleador histórico?" — si vuelve a salir siempre esa pregunta, revisa que
  no se haya perdido esa instrucción del prompt.
- **Cero menciones a "IA" o "Gemini" en texto visible al usuario** en toda
  la app (trivia, Central de Datos, mensajes de error). El motor sigue
  siendo Gemini por debajo, pero no se nombra en la UI.

## 4. Central de Datos / Oráculo (`api/oraculo/route.ts`, `CentralDatosView.tsx`)

- **Usa la API pública de ESPN** (`site.api.espn.com/.../soccer/col.1/...`)
  para tabla de posiciones, marcadores y alineaciones — es gratis y sin
  límite real de cuota.
- La IA (Gemini) **ya NO usa la herramienta de búsqueda en Google**
  (`googleSearch` tool/grounding). Se probó y el plan gratuito de Gemini no
  tiene cuota estable para eso (daba 429 RESOURCE_EXHAUSTED todo el
  tiempo). La IA solo responde con su conocimiento entrenado, como
  respaldo cuando ESPN no tiene el dato (por ejemplo alineaciones no
  publicadas todavía).
- Se evaluó **API-Football** (api-sports.io) como alternativa: su plan
  gratuito **no da acceso a la temporada actual**, solo 2022-2024. No
  sirve para esto, no se integró. La API key ya no está en `.env`.
- No existe una "API de Google" pública para datos de fútbol (la cajita de
  estadísticas que sale al buscar en Google es propietaria, no
  desarrollable).
- Si la tabla de posiciones de ESPN sale vacía para la fase actual del
  torneo, es un problema de datos de ESPN (ya se comprobó pegándole
  directo), no un bug del código — por eso hay un mensaje de respaldo en
  vez de mostrar un modal vacío.

## 5. Bugs de datos corregidos (¡importante!)

- En el desglose de "Tus Puntuaciones" (Marcadores Exactos / Ganador /
  Goleador), el código comparaba campos que **no existen** en el schema:
  `miPred.goles_local` / `resultado_oficial.goles_local`. Los campos reales
  son `goles_local_predicho` / `goles_visitante_predicho` (predicción) y
  `goles_local_real` / `goles_visitante_real` (resultado oficial). Como
  ambos lados daban `undefined`, la comparación siempre era verdadera y
  marcaba TODOS los partidos como acertados. Ya corregido — **si alguna vez
  ves ese patrón de nombres de campo (`goles_local` a secas) en este
  archivo, es el bug viejo volviendo.**
- El botón "🔄 Extraer ESPN" del panel de Liquidación ahora **bloquea la
  extracción si el partido no está `STATUS_FULL_TIME` en ESPN** (antes solo
  mostraba un aviso pero dejaba guardar el marcador provisional como
  oficial).
- Se quitó "Puntos de Torneo" del desglose de puntuaciones (ya no se
  muestra ahí).

## 6. Pestañas nuevas / corregidas

- **"Pronósticos de Todos"** (nueva, en el menú de inicio): muestra los
  pronósticos de todos los participantes por partido, pero **solo se
  revelan cuando cierra el plazo de ese partido** (candado antes). Tiene
  botones "Pendientes" / "Finalizados". **Solo la fecha activa**
  (`fechaParticipante`), no arrastra partidos de otras jornadas.
- **"Partidos Finalizados"** (la pestaña original): también se restringió a
  **solo la fecha activa** — antes tenía un selector de "Fecha 1, 2, 3..."
  que mostraba el historial completo del torneo; eso se quitó a pedido del
  cliente.
- El parpadeo del login al recargar la página se arregló con una pantalla
  de carga (`isMounted`) mientras se restaura la sesión guardada — no
  quites ese gate o vuelve el parpadeo.

## 7. Otros

- `remark-gfm` está instalado para que las tablas markdown (la de
  posiciones que a veces genera la IA) se rendericen como tabla real, no
  como texto con `|`.
- El logo `public/marca/logo-club90-escudo-balon.webp` es nuevo (recortado
  del archivo que mandó el cliente) — es el que se usa en toda la trivia y
  en "Tus Puntuaciones".
