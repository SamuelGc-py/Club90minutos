-- Agregar constraint UNIQUE para prevenir duplicados de jugador en el mismo equipo
ALTER TABLE jugador ADD CONSTRAINT jugador_nombre_equipo_id_key UNIQUE (nombre, equipo_id);
