# Guía Rápida para pgAdmin — Polla Express ⚽

Esta guía te muestra paso a paso cómo ubicar las tablas y cómo agregar o consultar participantes en **pgAdmin**.

---

## 📍 1. Dónde encontrar tus tablas en pgAdmin

1. En el panel izquierdo de pgAdmin (**Object Explorer**):
   - Haz clic en **Servers** (si te pide clave, ingresa la contraseña de PostgreSQL).
   - Despliega **Databases** -> Haz clic derecho sobre **`polla_fpc_local`** y selecciona **Refresh** (Refrescar).
   - Despliega **`polla_fpc_local`** -> **Schemas** -> **public** -> **Tables**.
2. Verás las siguientes tablas principales:
   - 👤 **`usuario`**: Lista de participantes autorizados.
   - ⚽ **`prediccion_partido`**: Marcadores exactos guardados por los participantes.
   - 👑 **`prediccion_inicial`**: Campeón y finalistas elegidos.
   - ⚡ **`prediccion_clasificado`**: Los 8 clasificados guardados.

---

## ➕ 2. Cómo agregar un nuevo participante desde pgAdmin

### Método A: Mediante consulta SQL (Recomendado y rápido) 🚀

1. Haz clic derecho sobre **`polla_fpc_local`** y selecciona **Query Tool** (Herramienta de Consulta).
2. Pega la siguiente sentencia SQL (modifica el nombre y el correo):

```sql
INSERT INTO usuario (nombre_completo, correo, rol_id, activo, fecha_registro)
VALUES ('Nombre del Participante', 'correo_del_participante@gmail.com', 1, true, NOW());
```

3. Presiona **F5** o el botón de **Play ▶️**.

---

### Método B: De forma visual (Editar celdas tipo Excel) 🖱️

1. Despliega **Tables**, haz clic derecho sobre la tabla **`usuario`**.
2. Selecciona **View/Edit Data** -> **All Rows**.
3. Ve a la última fila (con el icono `*`).
4. Llena los campos:
   - `nombre_completo`: Nombre del participante.
   - `correo`: Correo exacto para ingresar.
   - `rol_id`: Escribe `1`.
   - `activo`: Marca la casilla `true`.
5. Haz clic en el icono del **Disco 💾 (Save Changes)** o presiona **F6**.

---

## 📊 3. Consultas útiles para ver pronósticos guardados

```sql
-- 1. Ver todos los usuarios
SELECT id, nombre_completo, correo, activo FROM usuario;

-- 2. Ver los marcadores guardados por todos los participantes
SELECT 
    u.nombre_completo AS participante,
    el.nombre AS local,
    pp.goles_local_predicho AS goles_local,
    pp.goles_visitante_predicho AS goles_visitante,
    ev.nombre AS visitante
FROM prediccion_partido pp
JOIN usuario u ON u.id = pp.usuario_id
JOIN partido p ON p.id = pp.partido_id
JOIN equipo el ON el.id = p.equipo_local_id
JOIN equipo ev ON ev.id = p.equipo_visitante_id
ORDER BY u.nombre_completo;
```
