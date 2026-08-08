# Nota: corrección de hallazgos de code review de seguridad (2026-08-07)

## Contexto
Se corrió `/code-review` sobre el proyecto y arrojó 14 hallazgos, varios críticos
(bypass de autenticación, contraseñas en texto plano, endpoint público que
reescribía resultados oficiales sin auth). Esta nota documenta qué se cambió,
por qué, y qué quedó pendiente — para que cualquier agente o persona que toque
este código después entienda el porqué sin tener que reconstruirlo del diff.

Commit: `ff9333b` en `main` de `SamuelGc-py/Club90minutos.git`.
Verificado en vivo contra `club90minutos.com` el mismo día tras el deploy de Hostinger.

---

## 1. Bypass de sesión en `/api/validar-usuario` (crítico)

**Problema:** si el body incluía `autoSync: true`, el endpoint se saltaba la
verificación de contraseña por completo. Cualquiera podía hacer
`POST {"correo": "cualquier_correo@x.com", "autoSync": true}` y recibir la
sesión completa de esa cuenta (incluida cualquier cuenta admin), sin conocer
la clave.

**Por qué existía:** el frontend usa `sincronizarSesionBackend()` para
refrescar los datos de un usuario que *ya* inició sesión (por ejemplo al
recargar la página). Como no había ningún mecanismo de sesión del lado del
servidor, ese refresco confiaba ciegamente en el correo enviado por el cliente.

**Fix:** se agregó una columna `sesion_token` (nullable) a `Usuario` en
`prisma/schema.prisma`, ya aplicada a la base de Neon con `prisma db push`
(no destructivo, no tocó filas existentes). En cada login real con contraseña
correcta se genera un `uuid` nuevo, se guarda en `usuario.sesion_token` y se
devuelve al cliente. El refresco de sesión (`sincronizarSesionBackend`) ahora
envía `{ correo, sesionToken }` en vez de `{ correo, autoSync: true }`, y el
servidor exige que ese token coincida con el guardado en BD.

Archivos: `src/app/api/validar-usuario/route.ts`, `src/app/dashboard/page.tsx`
(estado `sesionToken`, se guarda junto a `usuario` en `sessionStorage`).

**Limitación conocida y aceptada:** cerrar sesión (`handleCerrarSesion`) solo
limpia el estado del cliente; no invalida el token en el servidor. Un token
robado seguiría siendo válido hasta el próximo login real de esa cuenta (que
sí rota el token) o un reset de contraseña (que sí lo invalida, ver abajo).
No se implementó invalidación server-side en logout por ser una mejora fuera
del alcance de los hallazgos reportados.

---

## 2. Contraseñas en texto plano (crítico)

**Problema:** `reset-password` y el login comparaban/guardaban la contraseña
tal cual, sin hash.

**Fix:** se agregó `bcryptjs` (sin compilación nativa, seguro para el hosting
compartido de Hostinger). Migración **perezosa y transparente**:
- Contraseña nueva (reset o primer login) → se guarda ya hasheada con bcrypt.
- Login con una contraseña que todavía está en texto plano → se compara igual
  que antes (`===`), y si coincide, se re-hashea y se guarda automáticamente
  en ese mismo request. El usuario no nota nada, nadie pierde acceso.
- Login con una contraseña que ya es un hash bcrypt (`$2...`) → se usa
  `bcrypt.compare`.

Archivos: `src/app/api/validar-usuario/route.ts`,
`src/app/api/auth/reset-password/route.ts` (también invalida `sesion_token`
al resetear clave, para forzar cierre de sesiones viejas).

**Estado real verificado el 2026-08-07:** las 18 cuentas de usuario tenían
contraseña propia (ninguna en `NULL`), pero **todas seguían en texto plano**
porque nadie había vuelto a iniciar sesión desde el deploy. Se irán
re-hasheando solas conforme cada quien haga login. Si se quiere forzar que
las 18 queden hasheadas de inmediato sin esperar, hay que escribir un script
puntual en `scripts/` — no se hizo porque no se pidió explícitamente.

---

## 3. Primer login sin contraseña (decisión: sin cambios)

Cuentas creadas por el admin en pgAdmin (ver `GUIA_PGADMIN.md`) quedan sin
`password`. Quien primero inicie sesión con cualquier clave, esa clave queda
asociada a la cuenta ("reclamo"). Es una condición de carrera real, pero
Samuel decidió **dejarlo tal cual** por ser un grupo pequeño y de confianza
(~16 participantes que el admin activa uno por uno). No se tocó el flujo de
onboarding.

---

## 4. Fuga de `resetUrl` en `request-reset` (crítico)

**Problema:** si Resend fallaba al enviar el correo, el endpoint devolvía el
`resetUrl` (el link con el token para cambiar la contraseña) directamente en
la respuesta JSON. Cualquiera que pidiera "olvidé mi contraseña" para el
correo de otra persona podía tomar control total de esa cuenta sin que le
llegara ningún correo.

**Fix:** en ese caso ahora se responde el mismo mensaje genérico que cuando
el correo no existe (`"Si el correo existe, se ha enviado un enlace."`), sin
el token, y el error real queda solo en los logs del servidor. También se
normalizó el correo a minúsculas antes de buscarlo (antes `AAA@x.com` no
encontraba la cuenta de `aaa@x.com`, aunque el login sí la encontraba).

Archivo: `src/app/api/auth/request-reset/route.ts`.

---

## 5. `GET /api/sync-live` sin autenticación (crítico)

**Problema:** cualquiera que conociera la URL podía reescribir
`ResultadoOficial` y `Partido.estado` de todo el fixture sin ningún tipo de
autenticación.

**Fix:** ahora exige un secreto compartido, por header `x-sync-secret` o
query param `?secret=`, comparado contra la variable de entorno
`SYNC_LIVE_SECRET`. Sin esa variable configurada, el endpoint rechaza *todo*
(fail-closed, no fail-open).

**Valor usado en este proyecto** (ya configurado en `.env` local y en las
variables de entorno de Hostinger):
```
SYNC_LIVE_SECRET=e5f3389ccc12e5a6c8c0039b427756e1c0ee5be30f87231d
```

**Importante:** no se encontró en el código ninguna referencia a quién llama
este endpoint (no hay cron config en el repo). Si existe un cron externo
(cron-job.org, UptimeRobot, etc.) apuntándole, **debe actualizarse** para
incluir `?secret=...`, o dejará de sincronizar en vivo sin ningún aviso.

Archivo: `src/app/api/sync-live/route.ts`.

---

## 6. `syncLive.ts`: emparejamiento débil y sobrescritura de resultados ya liquidados

**Problema 1:** los partidos de ESPN se emparejaban con los de la BD solo por
nombre de equipo. Si el mismo cruce (ej. Millonarios vs Nacional) se repetía
en otra fase del torneo, un evento de ESPN podía actualizar el partido
equivocado.

**Fix:** ahora también exige que la fecha del evento de ESPN esté a menos de
±1 día de `fecha_hora_partido` en la BD.

**Problema 2:** no había ningún guard contra partidos que el admin ya había
liquidado manualmente (`estado === "resultado_cargado"`). Un sync en vivo
podía pisar ese resultado oficial con un marcador parcial y desincronizarlo
de los `Puntaje` ya otorgados.

**Fix:** se agregó `if (partido.estado === "resultado_cargado") continue;`
antes de tocar ese partido.

Archivo: `src/lib/syncLive.ts`.

---

## 7. `calculadorPuntos.ts`: recálculo de puntos sin transacción

**Problema:** se borraban todos los `Puntaje` del partido y se recreaban uno
por uno en un loop, sin transacción. Un crash a mitad de camino (hay riesgo
documentado de OOM en Hostinger, ver `NOTA_FIX_SITIO_CAIDO.md`) dejaba el
partido sin puntos, en silencio.

**Fix:** se junta la lista completa de puntajes nuevos en memoria y se hace
`prisma.$transaction([deleteMany, createMany])` — atómico, o se aplican
todos o ninguno.

Archivo: `src/lib/calculadorPuntos.ts`.

---

## 8. Botón "quitar goleador" del admin no hacía nada

**Problema:** `handleRemoverGoleadorAdmin(partidoId, indexToRemove)` esperaba
un índice y hacía `splice(indexToRemove, 1)`, pero el botón `✕` le pasaba el
**ID del jugador**, no su posición en el arreglo. `splice()` con un ID grande
como índice es un no-op silencioso: el botón nunca quitaba nada.

**Fix:** el `.map()` que renderiza los chips de goleadores ahora expone el
índice real (`idxGoleador`) y se lo pasa al handler.

Archivo: `src/app/dashboard/page.tsx`.

---

## 9. Sobre-consulta a la API de ESPN en `/api/partidos-en-vivo`

**Problema:** `if (event.id)` es prácticamente siempre verdadero, así que se
pedía el resumen detallado de ESPN (`/summary?event=...`) para **todos** los
partidos del scoreboard en cada request — y el cliente hace poll cada 15s.
Innecesario para partidos que ni siquiera han empezado.

**Fix:** ahora solo se pide el resumen si el partido está en vivo o recién
finalizado: `if (event.id && (esEnVivo || esFinalizado))`.

Archivo: `src/app/api/partidos-en-vivo/route.ts`.

---

## 10. Guardado silencioso de pronósticos rechazados por cierre de plazo

**Problema:** si un pronóstico llegaba después del cierre (30 min antes del
partido, o después de la Fecha 5 para las predicciones iniciales), el
backend simplemente lo descartaba **y respondía éxito igual**. El frontend
mostraba "¡Guardado exitosamente!" y hasta guardaba el partido rechazado en
`sessionStorage` como si sí se hubiera guardado.

**Fix:**
- El backend ahora devuelve `partidosGuardados`, `partidosRechazados` y
  `prediccionInicialRechazada` en la respuesta.
- El dashboard solo escribe en `sessionStorage` lo que el servidor confirmó
  como guardado, y muestra un mensaje de error específico listando qué
  partidos no se guardaron por cierre de plazo (en los tres puntos donde se
  llama este endpoint: guardado de un solo partido, predicciones iniciales,
  y envío completo del fixture).

Archivos: `src/app/api/guardar-pronosticos/route.ts`,
`src/app/dashboard/page.tsx`.

---

## 11. Limpieza de infraestructura (sin impacto funcional)

- `src/lib/db.ts`: logging de queries de Prisma (`log: ["query", ...]`) solo
  en desarrollo, no en producción (ruido y costo en un host con RAM limitada).
- `src/app/api/auth/request-reset/route.ts` y `reset-password/route.ts`:
  usaban `new PrismaClient()` propio en vez del singleton de `src/lib/db.ts`
  — cada request abría una conexión extra a la BD. Ahora usan el singleton.
- `next.config.mjs`: se quitó `typescript: { ignoreBuildErrors: true }` (se
  verificó primero con `tsc --noEmit` que no había ningún error oculto). Se
  dejó `eslint: { ignoreDuringBuilds: true }` porque el proyecto no tiene
  ESLint configurado (ni `.eslintrc` ni la dependencia instalada); forzarlo
  hubiera roto el build por un motivo ajeno al hallazgo real.

---

## 12. Lo que se revisó y NO se tocó (confirmado que no son bugs)

- `TablaPosicionesAfiche.tsx` ignora su prop `tabla` y usa el arreglo
  `tablaFinal` fijo — es la decisión explícita de la regla 13 de `AGENTS.md`
  (Samuel actualiza esa tabla a mano).
- `src/app/layout.tsx` no tiene `force-dynamic` — correcto, ver
  `NOTA_FIX_SITIO_CAIDO.md`.

---

## Verificación realizada

- `tsc --noEmit` y `npm run build` sin errores, tanto antes como después de
  rebasar sobre 3 commits nuevos que llegaron al repo mientras se trabajaba
  (feature de "aplazados" en el panel admin, sin conflicto de archivos real).
- Flujo completo probado contra la base de Neon real con un usuario de
  prueba temporal (creado y eliminado en la misma sesión): login con clave
  en texto plano → se re-hashea a bcrypt automáticamente → resync con el
  token real funciona → segundo login contra el hash sigue funcionando.
- Tras el deploy a Hostinger, se verificó **contra el sitio en vivo**
  (`club90minutos.com`) con requests reales:
  - `GET /api/sync-live` sin secreto → `401` ✅
  - `GET /api/sync-live?secret=...` con el secreto correcto → `200`,
    sincroniza ✅ (una vez que se agregó `SYNC_LIVE_SECRET` en las
    variables de entorno de Hostinger — al principio también daba 401
    porque la variable no existía ahí)
  - `POST /api/validar-usuario` con `autoSync:true` y sin clave → `400
    "Contraseña requerida"` (antes devolvía la sesión completa sin pedir
    clave) ✅

## Pendiente / a considerar más adelante

- Si existe un cron externo llamando `/api/sync-live`, hay que confirmarle
  el nuevo `?secret=`.
- Las contraseñas de usuarios que no vuelvan a iniciar sesión seguirán en
  texto plano hasta que lo hagan (migración perezosa, por diseño).
- No hay invalidación de `sesion_token` en logout del lado del servidor.
