# Plan de implementación — Rediseño visual Club 90 Minutos

Fecha: 2026-10-02 · Rama de trabajo: `redesign/sistema-visual` · Solo localhost.

Fuentes: documento "Rediseño Club90" y Manual de Marca e Identidad Visual v1.0 (agosto 2026).
Alcance: solo diseño y UI. No se toca lógica de negocio, puntuación, autenticación, APIs ni datos.
Fuera de alcance: todas las "Oportunidades" (recordatorios, imagen WhatsApp, puntos en vivo,
pollas privadas, comodín, estadísticas, rutas propias).

## Paso 0 — Backup (hecho)

- Rama `backup/pre-redesign-20261002` → commit `0d0b11b` (estado exacto antes del rediseño).
- Archivo `../Club90-backups/pre-redesign-20261002-src.tgz` (src, public, package.json, configs).
- Restaurar: `git switch main` (main no se toca) o `git checkout backup/pre-redesign-20261002 -- src`.

## Decisiones de sistema

| Decisión | Motivo |
| --- | --- |
| `src/app/tokens.css` con los 9 colores del manual + roles, importado en `layout.tsx` | Fuente única de verdad (manual, sección 06). |
| Variables heredadas (`--noche`, `--cancha`, `--azul`, …) se redefinen apuntando a los tokens | Las 1.257 líneas con estilo en línea que usan `var(--…)` cambian sin tocarlas una por una. |
| Texto atenuado sobre oscuro = Gris Claro al 64 % de opacidad, no Gris Medio | Gris Medio sobre Negro Estadio da ~4,3:1 (no pasa AA en texto pequeño). Gris Medio queda para placeholders, deshabilitados y texto sobre blanco (4,83:1, como dice el manual). |
| Bordes = Gris Claro al 10–14 % | El manual no define color de línea; la opacidad mantiene la paleta de 9. |
| Morados, rosados y cian no tienen equivalente → Azul Eléctrico | Son "colores no autorizados" (manual 05). |
| Primitivas como clases globales (`.btn`, `.badge`, `.tabs`) y componentes nuevos con CSS Modules | Sin dependencias nuevas. Radix no se instala. |
| Iconos: `lucide-react` (ya instalado) | Cero emojis como iconos o viñetas. ▲▼ se conservan como tipografía de movimiento. |

## Fase 1 — Base del sistema

1. `layout.tsx`: cargar Orbitron 700/800, Inter 400–700 y JetBrains Mono 400–600; quitar Montserrat.
2. `tokens.css`: colores, roles, `--r-chip 6px`, `--r-ctl 10px`, `--r-pill 999px`, espacio 4…64,
   `--shadow-glow` (solo "En vivo"), `--motion 150ms ease-out`, `--touch 44px`.
3. `globals.css`: remapear variables heredadas; base tipográfica (H1/H2 Orbitron, H3+ Inter, cuerpo Inter 16/1.6);
   `:focus-visible` verde; primitivas `.btn-primary` (Verde Club + Negro Estadio), `.btn-secondary` (borde),
   `.btn-text` (azul), `.badge-ok/warn/bad/live/neutral` (fondo al 10 %), `.tabs`.
4. Limpieza automática (script revisado, solo archivos de UI: `src/app/**/*.tsx` sin `api/`, y `globals.css`):
   - Cada hex/rgba fuera del manual → su equivalente de marca por familia (verdes → Verde Club, azules/morados → Azul Eléctrico,
     ámbar/dorado → Amarillo Energía, rojos → Rojo Alerta, slate oscuro → Gris Oscuro/Negro Estadio, slate texto → Gris Claro).
   - `linear-gradient`/`radial-gradient` decorativos → color sólido (primer tono) o `transparent` para orbes.
   - `textShadow` → `none`; `boxShadow` decorativo y `drop-shadow` → `none`.
   - Emojis en textos de interfaz → eliminados (o reemplazados por icono lucide donde aportan significado).
5. Barra superior nueva: isotipo 28px a la izquierda + "CLUB90", navegación con iconos lucide (sustituye el menú lateral de 7 tarjetas
   y la barra "← Inicio"), usuario y salir a la derecha. En móvil: barra de pestañas desplazable.

## Fase 2 — Partidos

- `Countdown`: "3 d 4 h", "4 h 12 min", "12:09" en el último hora; mono tabular; amarillo cuando faltan < 2 h.
  Reemplaza la salida de `RelojCuentaRegresiva` (mismos cálculos de estado).
- `MatchRow` (adaptado de scoreboardsweb · MatchCard, MIT): hora · local + escudo · marcador/vs · escudo + visitante · estado.
  Lista agrupada por día (`MatchDayGroup`). Sin barra lateral, sin tarjeta alta.
- `PredictionForm` (patrón de fwc-2026 · match-result-form, MIT): se despliega bajo la fila; incrementadores −/+ (44px),
  ganador como control segmentado, goleador por equipo, un solo botón verde "Guardar pronóstico".
  Usa los mismos manejadores (`handleMarcadorChange`, `handleGanadorChange`, `handleGoleadorChange`, `handleGuardarPronosticoPartido`).
- `DateNavigator` (adaptado de scoreboardsweb · DateNavigator, MIT): ‹ Fecha N › para "Pronósticos de todos".

## Fase 3 — Ranking

- `Leaderboard`: posición, movimiento ▲▼ frente a la fecha anterior, nombre, puntos, distancia al líder.
  Tu fila resaltada (borde izquierdo verde) y fijada abajo si no está a la vista.
- Filtro General / Fecha N (cálculo solo de presentación con `puntajes` + `partidos` que ya llegan; mismos desempates del servidor).
- Columnas por categoría solo si alguien tiene puntos en ella.
- Acción primaria única: "De dónde salieron mis puntos" pasa a secundaria; afiche/descarga como acción de texto.

## Fase 4 — Mi jornada (inicio con sesión)

1. Aviso de pendientes: "Te faltan X pronósticos · el primero cierra en …" + botón "Pronosticar" (único primario).
2. Tu posición: puesto, puntos, movimiento, distancia al líder.
3. Próximos partidos en `MatchRow` con estado del pronóstico.
4. Último resultado liquidado (dato de `/api/historial-puntos`, ya existente).
5. Mini ranking: top 5 + tu fila.
6. Trivia como módulo secundario al final.

## Fase 5 — Limpieza transversal

- Escala tipográfica del manual en `globals.css`; Orbitron solo en H1, H2 y marca.
- Login: panel de marca con el escudo completo a tamaño real (sin marca de agua, sin texto encima), formulario con primitivas.
  El texto "Crea tu polla…" se cambia porque promete una función que no existe.
- Landing pública (`src/app/page.tsx`), mantenimiento, recuperar/restablecer contraseña: tokens y fuentes.
- Botones: frase en minúscula inicial ("Guardar pronóstico"), sin emoji + icono + flecha juntos.
- Estilos en línea: los componentes nuevos no usan ninguno. El resto (panel admin, afiches) queda migrado de color,
  pero su estructura en línea se migra pantalla por pantalla en sesiones posteriores (riesgo bajo, archivo de 6.128 líneas).

## Verificación

- `npx tsc --noEmit` y `npm run build` sin errores.
- Capturas en localhost (escritorio 1280 y móvil 390): Login, Mi jornada, Pronósticos, Ranking.
- Recuento final: hex fuera de marca, emojis, gradientes y sombras en archivos de UI.
- Sin push ni deploy hasta aprobación.

## Resultado (2026-10-02, localhost)

| Síntoma del diagnóstico | Antes | Después |
| --- | --- | --- |
| Colores hex distintos en la UI | 110 | 10 (los 9 del manual + `#1F5FD1`, variante de enlace sobre claro) |
| `rgba()` fuera de la paleta | ~40 familias | 0 |
| Gradientes | 85 | 0 |
| Sombras de texto / sombras con brillo | 12 / 14 | 0 / 0 (el glow queda solo en el badge "En vivo") |
| Emojis como iconos o viñetas | 191 | 0 |
| Fuentes del manual cargadas | 0 de 2 (Orbitron, Inter) | 3 de 3 |
| Estilos en línea (`style={{`) | 1.257 | 1.141 (los componentes nuevos no usan ninguno) |

Componentes nuevos en `src/app/components/c90/`: `tokens` (en `src/app/tokens.css`), `Brand` (isotipo SVG y logotipo),
`AppTopBar`, `Countdown`, `MatchRow` + `MatchDayList`, `PredictionForm`, `DateNavigator`, `Leaderboard` (+ `ranking.ts`), `MiJornada`.

### Cómo probar

1. `git switch redesign/sistema-visual`
2. `npx next build && npx next start -p 3001` (o `npx next dev -p 3001`)
3. Abrir `http://localhost:3001/dashboard` (cuenta QA: qa.participante@test.local).
4. Revisar: login, Mi jornada, Pronósticos (desplegar un partido), Ranking (General / Por fecha), Aplazados, De todos, y la landing `/`, a 1280 px y 390 px.

### Pendiente para sesiones posteriores

- Panel admin: solo recibió la limpieza de color/sombras/emojis; conserva su estructura con estilos en línea.
- Cazador de puntos, Mis resultados y Predicciones del torneo: heredan tokens y colores, pero no se rediseñaron por dentro.
- Migrar el resto de estilos en línea del dashboard a CSS Modules, pantalla por pantalla.
