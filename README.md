# ⚽ Club 90 Minutos — Polla Liga BetPlay

**Club 90 Minutos** es una aplicación web de pronósticos deportivos (quiniela/polla) para la Liga BetPlay colombiana. Los participantes pronostican resultados de partidos, goleadores, campeón, finalistas y clasificados a cuadrangulares, y acumulan puntos según la precisión de sus predicciones.

🌐 **Producción**: [club90minutos.com](https://club90minutos.com)

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) |
| Lenguaje | TypeScript 5 |
| Base de Datos | PostgreSQL ([Neon](https://neon.tech/)) |
| ORM | [Prisma 6](https://www.prisma.io/) |
| IA | [Google Gemini](https://ai.google.dev/) (trivia, oráculo, crónicas) |
| Email | [Resend](https://resend.com/) |
| Gráficos | [Recharts](https://recharts.org/) |
| Iconos | [Lucide React](https://lucide.dev/) |
| Datos en vivo | [ESPN API](https://site.api.espn.com/) (pública, sin autenticación) |
| Hosting | [Hostinger](https://hostinger.com/) (Node.js hosting) |

---

## Instalación Local

### Requisitos Previos

- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL (o cuenta en [Neon](https://neon.tech/) para BD en la nube)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/Club90minutos.git
cd Club90minutos

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (ver sección siguiente)

# 4. Generar el cliente de Prisma
npx prisma generate

# 5. Aplicar el esquema a la base de datos (primera vez)
npx prisma db push

# 6. Levantar en modo desarrollo
npm run dev
```

La app estará disponible en **http://localhost:3001**.

---

## Variables de Entorno

Crear un archivo `.env` basado en [`.env.example`](.env.example):

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL (pooled/connection pooler) | `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `DIRECT_URL` | URL directa a PostgreSQL (para migraciones Prisma) | `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (para links en emails) | `https://club90minutos.com` |
| `RESEND_API_KEY` | API Key de [Resend](https://resend.com/) para envío de emails | `re_xxxxxxx` |
| `SYNC_LIVE_SECRET` | Secreto para proteger el endpoint `/api/sync-live` | Generar con: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` |

---

## Estructura del Proyecto

```
Club90minutos/
├── prisma/
│   └── schema.prisma           # Esquema de base de datos (14 modelos)
├── public/
│   ├── images/                  # Imágenes generales
│   ├── marca/                   # Logos y branding
│   └── robots.txt
├── docs/
│   ├── api/                     # Documentación de endpoints
│   ├── guias/                   # Guías operativas (pgAdmin, etc.)
│   ├── internal/                # Notas técnicas de desarrollo
│   └── reglas-puntuacion.md     # Reglas del juego documentadas
├── scripts/
│   ├── mantenimiento/           # Scripts recurrentes (sync maestro, reliquidar)
│   └── hotfixes/                # Correcciones puntuales ya ejecutadas
├── src/
│   ├── middleware.ts            # Basic Auth para Vercel (staging)
│   ├── lib/
│   │   ├── db.ts                # Singleton de Prisma Client
│   │   ├── calculadorPuntos.ts  # ⭐ Motor de cálculo de puntos
│   │   ├── syncLive.ts          # Sincronización en vivo con ESPN
│   │   └── tablaFija.ts         # Datos fijos de tabla de posiciones
│   └── app/
│       ├── globals.css          # Estilos globales
│       ├── layout.tsx           # Layout raíz (metadata, fuentes, Toaster)
│       ├── page.tsx             # Landing pública (/)
│       ├── error.tsx            # Error boundary de ruta
│       ├── global-error.tsx     # Error boundary global
│       ├── not-found.tsx        # Página 404
│       ├── dashboard/
│       │   └── page.tsx         # ⭐ App principal (login + dashboard completo)
│       ├── components/
│       │   ├── TablaPosicionesAfiche.tsx
│       │   ├── PronosticosPartidoAfiche.tsx
│       │   ├── PronosticosTorneoAfiche.tsx
│       │   ├── CentralDatosView.tsx
│       │   ├── TriviaModal.tsx
│       │   └── TerminosCompletos.tsx
│       ├── api/                 # 24 endpoints (ver docs/api/)
│       │   ├── admin/           # Cargar/quitar resultados, reliquidar
│       │   ├── auth/            # Registro, login, reset password
│       │   ├── ai/              # Trivia, oráculo, crónica, noticias
│       │   ├── consolidados/    # Datos consolidados + export Excel
│       │   ├── cron/            # Sincronización automática ESPN
│       │   ├── datos-maestros/  # Equipos, partidos, jugadores
│       │   ├── guardar-pronosticos/
│       │   ├── sync-live/       # Marcadores en tiempo real
│       │   └── validar-usuario/ # Autenticación por sesión
│       ├── construccion/        # Página "en construcción"
│       ├── recuperar-password/
│       ├── restablecer-password/
│       └── terminos/            # Términos y condiciones
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## Esquema de Base de Datos

```mermaid
erDiagram
    Rol ||--o{ Usuario : tiene
    Usuario ||--o| PrediccionInicial : crea
    Usuario ||--o{ PrediccionPartido : envía
    Usuario ||--o{ Puntaje : acumula
    Usuario ||--o{ ResultadoOficial : ingresa

    Equipo ||--o{ Jugador : tiene
    Equipo ||--o{ Partido : "juega como local"
    Equipo ||--o{ Partido : "juega como visitante"

    Partido ||--o| ResultadoOficial : tiene
    Partido ||--o{ PrediccionPartido : recibe
    Partido ||--o{ Puntaje : genera

    ResultadoOficial ||--o{ ResultadoGoleador : registra
    Jugador ||--o{ ResultadoGoleador : anotó

    PrediccionInicial ||--o{ PrediccionClasificado : incluye
```

### Modelos Principales

| Modelo | Descripción |
|--------|-------------|
| `Usuario` | Participantes y administradores (con sesión por token) |
| `Equipo` | 20 equipos de la Liga BetPlay |
| `Jugador` | Jugadores por equipo (para predicción de goleador) |
| `Partido` | Calendario completo con estados (`programado` → `puntaje_calculado`) |
| `PrediccionInicial` | Predicciones de torneo (campeón, finalistas, clasificados, goleador) |
| `PrediccionPartido` | Marcador predicho + goleador por partido |
| `ResultadoOficial` | Marcador real + goleadores reales |
| `Puntaje` | Puntos otorgados por categoría por partido |

---

## Reglas de Puntuación

| Categoría | Puntos | Condición |
|-----------|--------|-----------|
| Ganador / Empate | **3** | Acertar quién gana (o empate) |
| Marcador Exacto | **5** | Acertar el marcador exacto (adicional al ganador) |
| Goleador | **2** | Acertar a uno de los goleadores del partido |
| Clasificados a Cuadrangulares | **3** c/u | Por cada equipo acertado de los 8 clasificados |
| Finalistas | **5** c/u | Acertar los 2 finalistas |
| Campeón | **10** | Acertar el campeón del torneo |
| Goleador del Torneo | **5** | Acertar al máximo goleador |

> ℹ️ Ver documentación detallada en [`docs/reglas-puntuacion.md`](docs/reglas-puntuacion.md).

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (puerto 3001) |
| `npm run build` | Build de producción (`prisma generate` + `next build`) |
| `npm run start` | Servidor de producción (puerto 3001) |
| `npm run db:generate` | Regenerar Prisma Client |
| `npm run db:studio` | Abrir Prisma Studio (GUI de BD) |

---

## Despliegue

### Hostinger (Producción)

El repositorio está conectado a **Hostinger** con deploy automático vía GitHub:

1. Push a la rama principal → Hostinger detecta el cambio
2. Ejecuta `npm run build` automáticamente
3. Reinicia el servidor Node.js

> ⚠️ **Importante**: El build de Hostinger puede fallar silenciosamente. Después de cada push, verificar que el sitio cargue correctamente en [club90minutos.com](https://club90minutos.com).

### Variables en Hostinger

Configurar las mismas variables del `.env` en el panel de hPanel → Node.js → Variables de entorno.

---

## Sincronización en Vivo

La app se conecta a la **API pública de ESPN** para:

1. **Marcadores en tiempo real** (`/api/sync-live`): Actualiza los marcadores de partidos en curso automáticamente.
2. **Liquidación automática**: Cuando ESPN reporta `STATUS_FULL_TIME`, el sistema calcula los puntos de todos los participantes automáticamente.
3. **Cron externo** (`/api/cron/espn`): Endpoint diseñado para ser llamado por un cron job externo cada N minutos durante la jornada.

---

## Seguridad

- **Autenticación**: Sesión por token almacenado en `localStorage` (sin JWT).
- **Middleware Vercel**: Basic Auth para proteger el entorno de staging en Vercel.
- **Headers de seguridad**: HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, configurados en `next.config.mjs`.
- **Contraseñas**: Hasheadas con `bcryptjs`.
- **Roles**: `participante` y `administrador` — el panel de admin solo es visible para rol `administrador`.

---

## Licencia

Proyecto privado. Todos los derechos reservados.
