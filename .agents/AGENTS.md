# Reglas Obligatorias del Proyecto - Polla Liga BetPlay

1. **Despliegue Dual Automático a GitHub**:
   - Todo cambio aprobado DEBE subirse a ambos repositorios de GitHub (`polla-express.git` y `Club90minutos.git`) ejecutando `git push` a ambos remotos. Un push a uno solo de los dos deja el sitio desincronizado (ya pasó, ver incidente del 2026-08-05 abajo).

2. **Verificación de Compilación Antes de Confirmar**:
   - Ejecutar `npm run build` localmente antes de confirmar cualquier cambio al usuario para garantizar 0 errores de TypeScript o sintaxis.

3. **Prevención Total de Pantallas de Error**:
   - Todo componente o vista client-side en Next.js debe estar protegido con `GlobalErrorBoundary` y bloques `try-catch` para evitar fallos de caché o hidratación.

4. **Diseño e Interfaz**:
   - Mantener tarjetas colapsadas por defecto al iniciar sesión.
   - Ocultar botón de despliegue en partidos terminados (`🏁 Terminado`).
   - Ubicación fija de botones en barra de navegación superior.

5. **Pruebas QA Estrictas (Hostinger)**:
   - Nunca asumir que un build local exitoso garantiza que funcione en Hostinger. Validar las restricciones de Hostinger (archivos estáticos, proxy Apache, límites de RAM/CPU del hosting compartido) y probar la interfaz en localhost antes de dar una tarea por terminada. Cero excusas.
   - Nunca usar `export const dynamic = 'force-dynamic'` en `layout.tsx` ni en rutas con componentes grandes (como `/dashboard`, ~4700 líneas): ya causó una caída total del sitio en Hostinger por sobrecarga del proceso Node al renderizar todo en el servidor en cada request (ver `.agents/NOTA_FIX_SITIO_CAIDO.md`).

---

# Reglas de Comportamiento del Agente

Esto aplica a cualquier IA/agente que trabaje en este repositorio (Antigravity, Claude Code, o cualquier otro). El dueño del proyecto es Samuel — estas reglas existen porque ya se perdió trabajo y tiempo por no seguirlas.

6. **La palabra del usuario es la única autoridad final.**
   Ante cualquier duda o instrucción previa que parezca contradictoria, manda la instrucción explícita MÁS RECIENTE del usuario. Nunca reinterpretes, "mejores" ni reviertas en silencio una decisión que el usuario ya tomó explícitamente.
   - Caso real: el 2026-08-04 el usuario pidió expresamente ocultar la landing pública y dejar `/` como redirect directo a `/dashboard` (acceso privado). El 2026-08-05, sin que el usuario lo pidiera, un agente revirtió ese cambio y restauró la landing pública, deshaciendo trabajo ya aprobado. Esto no debe repetirse: si no hay una instrucción nueva y explícita que pida deshacer algo, no se deshace.

7. **No seas lambón.**
   No le digas al usuario lo que quiere oír ni actúes solo para parecer productivo o quedar bien. Si una petición tiene un problema técnico, un riesgo, o contradice algo ya decidido antes, dilo directamente ANTES de ejecutar el cambio, no después de romper algo. Es preferible hacer una pregunta incómoda que dar una sorpresa destructiva.

8. **Antes de sobrescribir o eliminar algo que ya existe y funciona:**
   - Revisa `git log` / `git diff` de ese archivo para entender por qué está como está. Puede ser una decisión deliberada reciente, no un descuido o un bug.
   - Si no estás 100% seguro de que el cambio es lo que el usuario quiere, pregunta antes de aplicarlo. No asumas.
   - Esto aplica especialmente a: la pantalla principal (`src/app/page.tsx`), el login (`src/app/dashboard/page.tsx`), y cualquier cosa relacionada con la base de datos.

9. **Respaldo obligatorio antes de cambios riesgosos.**
   - Antes de tocar código que afecta pantallas completas, autenticación o la base de datos, deja un punto de retorno claro: un commit separado del estado previo, o una nota en `.agents/` (como `NOTA_FIX_SITIO_CAIDO.md`) explicando qué había antes y por qué se cambia.
   - Nunca ejecutar operaciones destructivas sobre la base de datos (DELETE, TRUNCATE, recrear tablas, resetear IDs/autoincrement) sin un respaldo explícito primero y sin avisarle al usuario antes de hacerlo.
   - Caso real: el incidente de los goleadores perdidos (agosto 2026) fue causado por recrear la tabla `jugador` sin respaldo previo. Eso generó IDs nuevos para los mismos jugadores y dejó huérfanas todas las referencias de goleador guardadas en las predicciones de los usuarios (más de 300 registros afectados). Se recuperó cruzando manualmente por nombre+equipo contra un respaldo de Neon, pero pudo evitarse por completo con un backup antes de tocar esa tabla.

10. **Compórtate como un desarrollador senior, no como uno junior ansioso por mostrar resultados.**
    - Cambios pequeños, quirúrgicos y verificables — no reescrituras masivas de archivos que ya funcionan.
    - "Probar de verdad" antes de decir "listo" significa: build local sin errores, Y cuando sea posible, verificar directamente en el sitio real (Hostinger y/o Vercel), no solo confiar en que "compiló".
    - Si vas a tocar un archivo que otro agente tocó recientemente, revisa los últimos commits primero — probablemente hay contexto e intención detrás que no es obvia solo mirando el código.
    - Cuando dudes entre "arreglar rápido" y "arreglar bien" (o entre dos formas distintas de resolver algo), pregúntale al usuario cuál prefiere en vez de decidir solo y asumir que acertaste.

11. **Despliegue dual real, no solo en el mensaje al usuario.**
    Si vas a decir "ya quedó desplegado" o "ya está en producción", confirma primero que el `git push` se hizo de verdad a AMBOS repos (`polla-express.git` y `Club90minutos.git`). Decir que algo está listo sin haberlo verificado es peor que no decir nada.

12. **URGENTE — verificar Hostinger en vivo después de CADA cambio de código, siempre, sin excepción.**
    `git push` no es lo mismo que "ya está en producción". Hostinger (club90minutos.com) tiene su propio pipeline de build conectado a GitHub y **ya falló silenciosamente al menos una vez** (deploy del commit `47ec10ae`, agosto 2026) sin que nadie se diera cuenta hasta que el usuario lo reportó.
    - Ningún agente (Antigravity, Claude Code, u otro) tiene acceso directo a hPanel/SSH de Hostinger para forzar un deploy o leer sus logs de build. Si el agente en turno sí tiene ese acceso, debe usarlo para revisar el estado del último deploy antes de decir que algo quedó listo.
    - Después de cada push, hay que confirmar con evidencia real que el cambio llegó a Hostinger — por ejemplo, descargando el HTML/JS servido en `https://club90minutos.com` y buscando ahí un texto o marca del cambio recién hecho — en vez de asumir que el pipeline automático funcionó.
    - Si no se puede confirmar (por build fallido, caché, o lo que sea), decírselo al usuario de inmediato con el error concreto, no quedarse callado ni reportar éxito a medias.
