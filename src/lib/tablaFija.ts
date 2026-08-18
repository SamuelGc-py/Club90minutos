import { FilaTablaPosiciones } from "@/app/components/TablaPosicionesAfiche";

// TABLA FIJA — actualizada manualmente por el dueño de la polla (Samuel).
// NINGÚN AGENTE debe recalcular ni sobrescribir estos valores automáticamente.
// Ver regla 13 en .agents/AGENTS.md.
// Se exporta para que otras vistas (ej. panel admin) muestren al líder real
// sin mantener una copia separada de estos números.
// Fecha 4 liquidada: Santa Fe 2-0 Boyaca Chico (gol de Hugo Rodallega; el segundo gol fue autogol y no cuenta para goleador).
// Fecha 5 liquidada: Fortaleza 2-0 Cucuta Deportivo (goleador correcto: Richardson Rivas; Harold Berdugo lo acerto).
// Fecha 6 liquidada: Deportes Tolima 2-1 Internacional de Bogota (goles de Ever Valencia y Adrian Parra; descuento de Sanguinetti; nadie predijo a ninguno de los 3).
// Fecha 6 liquidada: Deportivo Cali 2-0 Deportivo Pasto (goles de Steven Rodriguez y Eduard Bello; nadie predijo a Eduard Bello).
export const TABLA_POSICIONES_FIJA: FilaTablaPosiciones[] = [
  { posicion: 1, usuario_id: 2, nombre_completo: "Pedro Cantero", correo: "pedrocanterojr@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 30, pts_ganador_partido: 45, pts_goleador_partido: 24, pts_total: 99 },
  { posicion: 2, usuario_id: 1, nombre_completo: "Nelson Berdugo", correo: "nelson.berdugo05@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 25, pts_ganador_partido: 54, pts_goleador_partido: 16, pts_total: 95 },
  { posicion: 3, usuario_id: 3, nombre_completo: "Juan Hernandez", correo: "juanhermon24@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 25, pts_ganador_partido: 48, pts_goleador_partido: 18, pts_total: 91 },
  { posicion: 4, usuario_id: 6, nombre_completo: "Rene Osorio", correo: "rene26203@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 20, pts_ganador_partido: 45, pts_goleador_partido: 18, pts_total: 83 },
  { posicion: 5, usuario_id: 4, nombre_completo: "Hernando Davila", correo: "nandorafa@hotmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 20, pts_ganador_partido: 42, pts_goleador_partido: 10, pts_total: 72 },
  { posicion: 6, usuario_id: 5, nombre_completo: "Lucas Saavedra", correo: "moisessaavedra496@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 15, pts_ganador_partido: 42, pts_goleador_partido: 14, pts_total: 71 },
  { posicion: 7, usuario_id: 8, nombre_completo: "Ricardo Vanegas", correo: "ricardo101228@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 20, pts_ganador_partido: 36, pts_goleador_partido: 10, pts_total: 66 },
  { posicion: 8, usuario_id: 7, nombre_completo: "Romario Gomez", correo: "gomezromario24@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 10, pts_ganador_partido: 33, pts_goleador_partido: 18, pts_total: 61 },
  { posicion: 9, usuario_id: 9, nombre_completo: "Harold Berdugo", correo: "hberdugodelosreyes0@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 20, pts_ganador_partido: 27, pts_goleador_partido: 14, pts_total: 61 },
  { posicion: 10, usuario_id: 15, nombre_completo: "Ignacio Barrios", correo: "iangelbarrios16@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 10, pts_ganador_partido: 27, pts_goleador_partido: 10, pts_total: 47 },
  { posicion: 11, usuario_id: 10, nombre_completo: "Ricardo Soto", correo: "ricardosotogom@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 5, pts_ganador_partido: 27, pts_goleador_partido: 14, pts_total: 46 },
  { posicion: 12, usuario_id: 13, nombre_completo: "Erick Andrade", correo: "andradeferrer@hotmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 0, pts_ganador_partido: 30, pts_goleador_partido: 14, pts_total: 44 },
  { posicion: 13, usuario_id: 11, nombre_completo: "Samuel Gutierrez", correo: "samucobaggg@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 5, pts_ganador_partido: 30, pts_goleador_partido: 8, pts_total: 43 },
  { posicion: 14, usuario_id: 14, nombre_completo: "Luis Betancourt", correo: "luismibetara15@hotmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 5, pts_ganador_partido: 24, pts_goleador_partido: 14, pts_total: 43 },
  { posicion: 15, usuario_id: 12, nombre_completo: "Andres Del Toro", correo: "pipedeltoro@hotmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 10, pts_ganador_partido: 21, pts_goleador_partido: 4, pts_total: 35 },
  { posicion: 16, usuario_id: 16, nombre_completo: "Manuel Cabarcas", correo: "stherton@gmail.com", pts_campeon: 0, pts_finalistas: 0, pts_clasificados: 0, pts_goleador_torneo: 0, pts_resultado_exacto: 0, pts_ganador_partido: 18, pts_goleador_partido: 2, pts_total: 20 },
];
