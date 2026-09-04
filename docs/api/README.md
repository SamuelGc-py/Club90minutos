# Documentación de API — Club 90 Minutos

Referencia de todas las rutas API del proyecto. Todas son **Next.js Route Handlers** ubicadas en `src/app/api/`.

---

## Autenticación

No se usa JWT. La autenticación es por **sesión con token UUID** almacenado en `localStorage` del navegador y en el campo `sesion_token` de la tabla `usuario`.

---

## Endpoints

### 🔐 Auth — Autenticación y Registro

#### `POST /api/validar-usuario`

Login, consulta de cuenta, y re-sincronización de sesión.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `correo` | string | Correo del usuario (requerido) |
| `password` | string | Contraseña (requerido para login) |
| `sesionToken` | string | Token de sesión previo (para resync sin contraseña) |
| `soloConsulta` | boolean | Si `true`, solo verifica si la cuenta existe y tiene clave |

**Respuesta exitosa (login):**
```json
{
  "existe": true,
  "activo": true,
  "sesionToken": "uuid-v4",
  "usuario": { "id": 1, "nombre": "...", "correo": "...", "rol_id": 1 },
  "prediccionesGuardadas": { "inicial": {...}, "partidos": [...] }
}
```

**Comportamiento especial:**
- **Primer login**: Si la cuenta no tiene contraseña, la primera que se envíe queda asociada.
- **Migración de claves**: Si la contraseña estaba en texto plano (legacy), se re-hashea con bcrypt automáticamente.
- **Resync**: Si se envía `sesionToken`, se valida contra el token almacenado en BD sin pedir contraseña.

---

#### `POST /api/auth/register`

Registro de nueva cuenta de participante.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nombre_completo` | string | Nombre del participante |
| `correo` | string | Correo electrónico |
| `telefono` | string | Teléfono (opcional) |
| `password` | string | Contraseña |

---

#### `POST /api/auth/request-reset`

Solicita un email de recuperación de contraseña. Genera un token en la tabla `PasswordResetToken` y envía el link vía Resend.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `correo` | string | Correo de la cuenta a recuperar |

---

#### `POST /api/auth/reset-password`

Restablece la contraseña usando un token de recuperación.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `token` | string | Token de recuperación (del link enviado por email) |
| `password` | string | Nueva contraseña |

---

### 📊 Datos — Consulta de Información

#### `GET /api/datos-maestros`

Retorna **todos los equipos, jugadores y partidos** del torneo con relaciones incluidas. Es la llamada principal que carga el dashboard.

**Respuesta:**
```json
{
  "equipos": [...],
  "jugadores": [...],
  "partidos": [
    {
      "id": 1,
      "fase": "fase_1",
      "jornada": 1,
      "equipo_local": { "nombre": "...", "jugadores": [...] },
      "equipo_visitante": { "nombre": "...", "jugadores": [...] },
      "resultado_oficial": { "goles_local_real": 2, "goleadores": [...] }
    }
  ]
}
```

> ⚠️ Usa `force-dynamic` y headers `no-store` para evitar que Hostinger cache datos viejos.

---

#### `GET /api/consolidados`

Retorna datos consolidados de todos los participantes: predicciones iniciales, predicciones por partido, y puntajes acumulados.

---

#### `GET /api/consolidados/excel`

Genera y descarga un archivo Excel (.xlsx) con todas las predicciones y puntajes. Usa la librería `exceljs`.

---

#### `GET /api/partidos-en-vivo`

Retorna marcadores en vivo desde la API de ESPN para partidos de la Liga BetPlay que estén actualmente en curso.

---

### 💾 Pronósticos — Guardar Predicciones

#### `POST /api/guardar-pronosticos`

Guarda predicciones de torneo (campeón, finalistas, clasificados, goleador) y/o marcadores por partido.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `usuario_id` | number | ID del usuario |
| `campeon_equipo_id` | number | Equipo pronosticado como campeón |
| `finalista_1_equipo_id` | number | Primer finalista |
| `finalista_2_equipo_id` | number | Segundo finalista |
| `goleador_torneo_jugador_id` | number | Goleador del torneo |
| `clasificados_ids` | number[] | IDs de los 8 equipos clasificados |
| `partidos` | array | Lista de pronósticos por partido |

**Cada elemento de `partidos`:**
```json
{
  "partido_id": 1,
  "goles_local": 2,
  "goles_visitante": 1,
  "jugador_goleador_id": 45
}
```

**Validaciones:**
- Cierre automático: 30 minutos antes del inicio del partido.
- Los administradores pueden guardar pronósticos después del cierre.
- Existen excepciones manuales (hardcoded) para participantes específicos que solicitaron prórroga.

---

### ⚙️ Admin — Administración de Resultados

> Todos los endpoints de admin verifican que el usuario tenga `rol.nombre === "administrador"`.

#### `POST /api/admin/cargar-resultado`

Carga el resultado oficial de un partido **y calcula los puntos** de todos los participantes automáticamente.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `usuario_id` | number | ID del administrador |
| `partido_id` | number | ID del partido |
| `goles_local` | number | Goles del equipo local |
| `goles_visitante` | number | Goles del equipo visitante |
| `goleadores_ids` | number[] | IDs de los jugadores que anotaron |

**Flujo interno:**
1. Valida permisos de admin
2. Upsert en `ResultadoOficial`
3. Registra goleadores en `ResultadoGoleador`
4. Cambia estado del partido a `resultado_cargado`
5. Llama a `calcularPuntosPartido()` → calcula y guarda `Puntaje`

---

#### `POST /api/admin/cargar-marcador-pantalla`

Carga el marcador y goleadores de un partido **sin calcular puntos**. Útil para mostrar el resultado en pantalla antes de la liquidación oficial.

---

#### `POST /api/admin/quitar-resultado`

Revierte un resultado oficial: elimina el `ResultadoOficial`, los `ResultadoGoleador`, y todos los `Puntaje` asociados al partido. Cambia el estado del partido de vuelta.

---

#### `POST /api/admin/reliquidar-todo`

Recalcula los puntos de **todos** los partidos que tengan resultado cargado. Útil después de correcciones masivas.

---

#### `POST /api/admin/reprogramar-partido`

Cambia la fecha/hora de un partido (usado para partidos aplazados).

---

#### `POST /api/admin/extraer-resultado-externo`

Extrae el resultado de un partido específico desde la API de ESPN (scoreboard + summary) para pre-llenar el formulario del admin.

---

### 🤖 AI — Funcionalidades de IA (Gemini)

#### `POST /api/ai/trivia`

Genera una pregunta de trivia sobre fútbol colombiano usando Google Gemini. Rota entre 8 categorías al azar.

---

#### `POST /api/ai/oraculo` y `POST /api/oraculo`

El "Oráculo" del fútbol: responde preguntas sobre la Liga BetPlay usando datos de ESPN como contexto y Gemini para generar la respuesta.

> Nota: hay dos rutas (`/api/ai/oraculo` y `/api/oraculo`). Verificar cuál está en uso.

---

#### `POST /api/ai/cronica`

Genera una crónica deportiva con estilo periodístico de un partido finalizado.

---

#### `POST /api/ai/noticias`

Genera noticias y análisis sobre la liga usando Gemini.

---

### 🔄 Live — Sincronización en Tiempo Real

#### `GET /api/sync-live`

Sincroniza marcadores en vivo desde ESPN. **Protegido con `SYNC_LIVE_SECRET`** — se debe enviar como query parameter o header.

**Flujo:**
1. Consulta el scoreboard de ESPN (`col.1`)
2. Matchea eventos de ESPN con partidos en BD por nombre de equipo + fecha (±1 día)
3. Si el partido está `STATUS_FULL_TIME`: liquida puntos automáticamente
4. Si está en curso: solo actualiza el marcador provisional

---

#### `GET /api/cron/espn`

Endpoint diseñado para ser llamado por un cron job externo. Ejecuta la sincronización con ESPN.

---

### 🛠️ Utilidades

#### `GET /api/test-db`

Endpoint de prueba para verificar conectividad con la base de datos.

#### `GET /api/fix-table`

Endpoint de corrección para la tabla de posiciones.
