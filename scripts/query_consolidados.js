const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const correosExcluidos = [
    "adminpollabetplay@gmail.com",
    "prueba.admin@pollabetplay.com",
    "pruebas@pollabetplay.com",
    "prueba@gmail.com",
    "PRUEBA@GMAIL.COM"
  ];

  const usuarios = await prisma.usuario.findMany({
    where: {
      activo: true,
      NOT: { correo: { in: correosExcluidos } },
    },
    select: { id: true, nombre_completo: true, correo: true },
    orderBy: { nombre_completo: "asc" },
  });

  const puntajes = await prisma.puntaje.findMany();

  const tablaPosicionesMap = new Map();
  for (const u of usuarios) {
    tablaPosicionesMap.set(u.id, {
      usuario_id: u.id,
      nombre_completo: u.nombre_completo,
      correo: u.correo,
      pts_campeon: 0,
      pts_finalistas: 0,
      pts_clasificados: 0,
      pts_goleador_torneo: 0,
      pts_resultado_exacto: 0,
      pts_ganador_partido: 0,
      pts_goleador_partido: 0,
      pts_total: 0,
    });
  }

  for (const p of puntajes) {
    const fila = tablaPosicionesMap.get(p.usuario_id);
    if (fila) {
      if (p.categoria === "campeon") fila.pts_campeon += p.puntos_obtenidos;
      else if (p.categoria === "finalistas") fila.pts_finalistas += p.puntos_obtenidos;
      else if (p.categoria === "clasificados_cuadrangulares") fila.pts_clasificados += p.puntos_obtenidos;
      else if (p.categoria === "goleador" && !p.partido_id) fila.pts_goleador_torneo += p.puntos_obtenidos;
      else if (p.categoria === "resultado_exacto") fila.pts_resultado_exacto += p.puntos_obtenidos;
      else if (p.categoria === "ganador_partido") fila.pts_ganador_partido += p.puntos_obtenidos;
      else if (p.categoria === "goleador" && p.partido_id) fila.pts_goleador_partido += p.puntos_obtenidos;

      fila.pts_total += p.puntos_obtenidos;
    }
  }

  const tablaPosiciones = Array.from(tablaPosicionesMap.values())
    .sort((a, b) => {
      if (b.pts_total !== a.pts_total) return b.pts_total - a.pts_total;
      if (b.pts_resultado_exacto !== a.pts_resultado_exacto) return b.pts_resultado_exacto - a.pts_resultado_exacto;
      if (b.pts_goleador_partido !== a.pts_goleador_partido) return b.pts_goleador_partido - a.pts_goleador_partido;
      if (b.pts_ganador_partido !== a.pts_ganador_partido) return b.pts_ganador_partido - a.pts_ganador_partido;
      return a.nombre_completo.localeCompare(b.nombre_completo);
    })
    .map((item, index) => ({
      pos: index + 1,
      ...item,
    }));

  console.log("TABLA ACTUAL EN BASE DE DATOS:");
  console.table(tablaPosiciones.map(f => ({
    pos: f.pos,
    nombre: f.nombre_completo,
    pts_exacto: f.pts_resultado_exacto,
    pts_ganador: f.pts_ganador_partido,
    pts_goleadores: f.pts_goleador_partido,
    total: f.pts_total
  })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
