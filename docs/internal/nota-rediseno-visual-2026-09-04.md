# Nota — Rediseño visual (2026-09-04)

## Qué es esto

A partir del commit `5cb802e` empieza un rediseño visual del sitio para alinearlo con el
Manual de Marca real (`docs/marca/manual-de-marca.md`, `docs/marca/tokens.css`). El sitio tenía
dos sistemas de diseño sin relación en `src/app/globals.css`: uno viejo "Noche de estadio"
(navy/verde/dorado, tipografía del sistema) que mueve casi todo el producto real
(`dashboard/page.tsx`), y el bloque de tokens de marca real pegado al final del archivo, usado
solo en la landing/términos/construcción, sin ni siquiera cargar las fuentes reales (Orbitron/
Inter) en `layout.tsx`.

## Punto de restauración

- **Tag**: `PRE_REDESIGN_20260904`
- **Commit exacto**: `5cb802e5291d2b1a923a9277d0f8e4e8d7a8fac6`
- Empujado a ambos remotos (`origin` y `personal`).

## Cómo revertir

De menor a mayor severidad:

1. **Apagar el toggle**: el sistema viejo (`data-design="current"`, valor por defecto) nunca se
   edita durante este rediseño — solo se le agregan reglas nuevas bajo `[data-design="redesign"]`.
   Si algo se ve mal, basta con no activar el flag; el diseño de siempre sigue intacto.
2. **Revertir commits puntuales**: `git revert <sha>` de los commits de rediseño específicos —
   son aditivos (CSS/JSX nuevo, no se tocan reglas existentes), así que revierten limpio incluso
   con otros commits de scoring/datos entremezclados en `main`.
3. **Comparar contra el tag**: `git diff PRE_REDESIGN_20260904..HEAD` para ver todo lo que cambió
   desde el punto de restauración antes de decidir cualquier cosa más agresiva. No usar
   `git reset --hard` al tag directamente — para cuando alguien necesite revertir, seguramente
   habrá commits legítimos de otras sesiones (scoring, datos) mezclados que no se deben perder.

## Alcance de este rediseño (ver plan completo para detalle)

Cubre: tokens + fuentes + mecanismo de preview (`data-design` attribute, cliente, sin cookies ni
`force-dynamic` — ver por qué en `docs/internal/notas-decisiones-tecnicas.md`, incidente de
caída de Hostinger), los 3 componentes "Afiche" descargables, landing/términos/construcción, y
`CentralDatosView`/`TriviaModal`.

**NO cubre `dashboard/page.tsx`** (5,667 líneas, un solo componente, lógica de liquidación de
puntos activa) — queda como una fase futura separada, sección por sección, para no repetir el
patrón de reescritura masiva que ya causó problemas en este proyecto.

No se tocó en ningún punto: cálculo de puntaje, base de datos, autenticación, APIs, datos de
pronósticos/resultados/ranking.
