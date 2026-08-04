# Nota para Antigravity: fix del sitio en blanco (2026-08-03)

## Síntoma
El sitio en Hostinger (https://club90minutos.com/) quedaba en blanco. Al probar
desde fuera (curl y fetch externo) el servidor ni siquiera respondía: la
conexión HTTPS se cerraba sin devolver contenido. No era solo el login, era
la app completa caída.

## Causa más probable
El commit `28c55f8` agregó esto a `src/app/layout.tsx`:

```ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

La intención era evitar que el HTML quedara cacheado con referencias a chunks
JS viejos (ChunkLoadError). Pero el efecto real fue forzar a Next.js a
renderizar en el servidor, **desde cero, en cada request**, la página
completa (`src/app/page.tsx`, ~4600 líneas, un solo componente con muchísimo
estado). En el hosting compartido de Hostinger (RAM/CPU limitados) eso es
suficiente para tumbar el proceso Node bajo carga, sobre todo si el usuario
recarga varias veces seguidas.

Esto explica la progresión del bug:
1. Antes: bug de formulario GET → aparecía un `?` en la URL (ya arreglado en
   commits anteriores, `6bc8eda` / `dfeb195`).
2. Después de agregar `force-dynamic`: el servidor se sobrecargaba y el sitio
   quedaba directamente en blanco / sin responder.

## Qué se cambió (commit `6c19805`)
En `src/app/layout.tsx`:
- Se removieron `export const dynamic = 'force-dynamic'` y
  `export const revalidate = 0'`. Sin esto, Next.js vuelve a poder
  pre-renderizar `/` como página estática (confirmado con `npm run build`:
  la ruta `/` pasó a `○ (Static)`), mucho más liviano para Hostinger.
- Se mantuvo (ya estaba sin commitear) una mejora al listener de errores que
  también detecta fallos de carga de `<script>` de `/_next/static/chunks/`,
  no solo el mensaje de error, y usa `window.location.reload(true)` para
  forzar bypass de caché en el reintento.

El caché del **navegador** para el HTML se sigue evitando vía los headers
`Cache-Control: no-cache, no-store` en `next.config.mjs` (eso no se tocó y
no tiene el mismo costo de servidor que `force-dynamic`).

Build local verificado con `npm run build` sin errores antes de hacer commit
(regla del `AGENTS.md`).

## Pendiente / para revisar
1. **Reiniciar la app en Hostinger** (hPanel → Node.js → Restart) y revisar
   los logs de esa sección para confirmar si hubo un crash por memoria
   (OOM) justo después del deploy de `28c55f8`. Esto no se pudo verificar
   desde acá porque no hay acceso al panel de Hostinger.
2. **Repo duplicado**: `AGENTS.md` dice que todo cambio debe subirse a
   `polla-express.git` y `Club90minutos.git`. Solo `Club90minutos.git`
   está configurado como remoto local (`origin`). El fix ya se pusheó ahí
   (`28c55f8..6c19805`). Si Hostinger despliega desde `polla-express.git`,
   falta agregar ese remoto y pushear ahí también.
3. Si el problema de servidor caído persiste después del restart, sospechar
   de límites de memoria/recursos del plan de Hostinger en sí, no del
   código — puede requerir revisar el plan de hosting.
