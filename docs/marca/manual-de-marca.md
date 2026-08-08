# Manual de Marca & Identidad Visual — CLUB90MINUTOS

**Versión:** 1.0 · **Fecha:** Agosto 2026

> Comunidad futbolera donde la pasión, el análisis y la estrategia se unen
> durante los 90 minutos del juego.
>
> **PREDICE · COMPITE · PERTENECE**

Transcrito del PDF `manual marca.pdf` provisto por el dueño del proyecto.
Los archivos utilizables directamente están en esta misma carpeta:
[`tokens.css`](./tokens.css), los 5 masters del logo en
[`assets/`](./assets/) (PNG + WebP) e [`integracion.html`](./integracion.html)
(snippet de referencia).

> Los 5 masters de `assets/` son los archivos reales exportados por el dueño
> del proyecto (no una reconstrucción), recortados automáticamente al
> contenido (se les quitó el margen blanco de página que traía la
> exportación original en PDF/WebP a tamaño carta).

---

## Índice

01. Paleta de Colores
02. Sistema Tipográfico
03. Arquitectura del Logotipo
04. Construcción y Espacios
05. Manual de Uso
06. Entregables Técnicos

---

## 01 — Paleta de colores

### Primarios

| Nombre | HEX | RGB | CMYK | HSL |
|---|---|---|---|---|
| Verde Club | `#74CC10` | 116, 204, 16 | 43, 0, 92, 20 | 88°, 85%, 43% |
| Negro Estadio | `#04060A` | 4, 6, 10 | 60, 40, 0, 96 | 220°, 43%, 3% |
| Blanco | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 | 0°, 0%, 100% |

### Acento

| Nombre | HEX | RGB | CMYK | HSL |
|---|---|---|---|---|
| Azul Eléctrico | `#438AFF` | 67, 138, 255 | 74, 46, 0, 0 | 217°, 100%, 63% |
| Amarillo Energía | `#EFCC36` | 239, 204, 54 | 0, 15, 77, 6 | 49°, 85%, 57% |
| Rojo Alerta | `#EA3D35` | 234, 61, 53 | 0, 74, 77, 8 | 3°, 81%, 56% |

### Neutros

| Nombre | HEX | RGB | CMYK | HSL |
|---|---|---|---|---|
| Gris Oscuro | `#1A1F26` | 26, 31, 38 | 32, 18, 0, 85 | 215°, 19%, 13% |
| Gris Medio | `#6B7280` | 107, 114, 128 | 16, 11, 0, 50 | 220°, 9%, 46% |
| Gris Claro | `#E5E7EB` | 229, 231, 235 | 3, 2, 0, 8 | 220°, 13%, 91% |

### Roles de color

- **Fondo principal** — Negro Estadio · pantallas oscuras, splash, cabeceras
- **Fondo secundario / superficies** — Gris Oscuro · tarjetas, modales, inputs
- **Texto principal (sobre oscuro)** — Blanco · titulares y cuerpo sobre fondo oscuro
- **Texto secundario** — Gris Claro · metadatos, subtítulos
- **Texto atenuado / placeholder** — Gris Medio · campos vacíos, ayuda
- **Botón CTA / acción primaria** — Verde Club · "Predecir", "Unirme al Club"
- **Enlace / interactivo secundario** — Azul Eléctrico · navegación, texto grande
- **Advertencia** — Amarillo Energía · pronóstico fallido, error de formulario
- **Error / alerta** — Rojo Alerta · pronóstico fallido, error de formulario

### Verificación de contraste · WCAG 2.1

| Combinación | Ratio | AA | AAA |
|---|---|---|---|
| Blanco sobre Negro Estadio | 20.28:1 | ✓ | ✓ |
| Gris Claro sobre Negro Estadio | 16.38:1 | ✓ | ✓ |
| Gris Medio sobre Blanco | 4.83:1 | ✓ | — |
| Negro Estadio sobre Blanco | 10.03:1 | ✓ | ✓ |
| Negro Estadio sobre Amarillo Energía | 12.90:1 | ✓ | ✓ |
| Negro Estadio sobre Rojo Alerta | 5.04:1 | ✓ | — |
| Negro Estadio sobre Azul Eléctrico | 6.10:1 | ✓ | — |
| Azul Eléctrico sobre Blanco (texto de enlace) | 3.32:1 | ✗ | — |

> Azul Eléctrico sobre Blanco: usar solo en texto ≥24px/bold o iconografía;
> para enlaces pequeños, sobre fondo oscuro.

---

## 02 — Sistema tipográfico

| Fuente | Uso | Google Fonts |
|---|---|---|
| **Orbitron** | Principal · Titulares | pesos 700/800/900 |
| **Inter** | Secundaria · Subtítulos y cuerpo | pesos 400/500/600/700/800 |
| **JetBrains Mono** | Monoespaciada · Código y datos | pesos 400/500/600 |

### Escala tipográfica web

| Uso | Fuente | Tamaño | Line-height | Peso |
|---|---|---|---|---|
| H1 / Hero | Orbitron 800 | 56px / 3.5rem | 1.1 | 800 |
| H2 | Orbitron 700 | 40px / 2.5rem | 1.15 | 700 |
| H3 | Inter 700 | 28px / 1.75rem | 1.25 | 700 |
| Body Large | Inter 400 | 18px / 1.125rem | 1.6 | 400 |
| Body | Inter 400 | 16px / 1rem | 1.6 | 400 |
| Caption | Inter 500 | 13px / 0.8125rem | 1.5 | 500 |
| Mono / Código | JetBrains Mono 400 | 14px / 0.875rem | 1.6 | 400 |

---

## 03 — Arquitectura del logotipo

El isotipo condensa tres símbolos del club en una sola marca: el **escudo**,
el **balón** y el **velocímetro** con el check en verde.

- **Escudo** — Pertenencia y comunidad del club
- **Balón** — El juego y la pasión por el fútbol
- **Velocímetro + check** — Los 90 minutos, el análisis y la predicción acertada

### Variaciones oficiales

- **Versión principal** — sobre fondo claro
- **Sobre fondo oscuro** — Negro Estadio
- **Monocromática** — una sola tinta
- **Isotipo / Favicon** — app icon, 32–512px

---

## 04 — Construcción y espacios de protección

### Zona de protección

El espacio mínimo alrededor del isotipo equivale a **"X"** — la altura del
ojo del velocímetro. Ningún elemento gráfico o de texto puede invadir esta zona.

### Cuadrícula de construcción

El isotipo se construye sobre una retícula modular de 19 columnas; el
círculo del balón ocupa 4×4 módulos centrados sobre el eje vertical del escudo.

### Tamaño mínimo

| Contexto | Tamaño mínimo |
|---|---|
| Digital · pantallas | 32px |
| Impreso · papelería | 12mm |

Por debajo de estos tamaños se pierde el detalle del velocímetro; usar el
monograma "C90" como alternativa.

---

## 05 — Manual de uso y normativa

### ✓ Usos correctos

- Sobre fotografía (con protección/producto)
- Sobre color de marca (Verde Club)
- Sobre negro
- Sobre blanco

### ✗ Usos incorrectos

- Añadir sombras / efecto 3D
- Bajo contraste (ej. isotipo sobre verde muy oscuro)
- Color no autorizado (ej. morado/violeta)
- Rotar el isotipo
- Estirar o deformar

### Aplicación en interfaces digitales

- El isotipo en la barra de navegación se ancla siempre a la izquierda,
  a 26–32px de alto.
- El botón CTA usa Verde Club con texto Negro Estadio (ratio 10.03:1).
- Los estados de éxito, advertencia y error usan las variantes semánticas
  de la paleta a 10% de opacidad como fondo de badge.

Ejemplo de referencia (barra superior):

```
[isotipo] CLUB90        Predicciones   Tabla   Comunidad      [Unirme al Club]

Partido de hoy                          Cierra en
River — Boca                            02:14:09
✓ Pronóstico acertado                   ⚠ Falta tu pronóstico

Envío fallido
Verifica tu conexión
✗ Error al guardar
```

---

## 06 — Entregables técnicos

- [`tokens.css`](./tokens.css) — variables CSS listas para importar
  (`:root { --color-verde-club: ...; }`).
- [`integracion.html`](./integracion.html) — snippet de referencia: preconnect
  de Google Fonts, hoja de tokens, isotipo inline, botón CTA con las
  variables, y `<picture>` con WebP/PNG.
- `assets/` — los 5 masters del logo, cada uno en PNG y WebP:
  - `logo-club90-principal` — escudo completo con "CLUB 90 MINUTOS", versión
    principal sobre fondo oscuro.
  - `logo-club90-circular` — el principal insertado en un círculo, para
    avatares/redes sociales.
  - `logo-club90-escudo` — solo el isotipo (escudo + velocímetro + balón +
    check), sin texto. El más cercano al "isotipo" de la sección 03.
  - `logo-club90-monograma` — el monograma "C90", para tamaños muy pequeños
    (favicon, app icon).
  - `logo-club90-blanco-negro` — versión monocromática.
