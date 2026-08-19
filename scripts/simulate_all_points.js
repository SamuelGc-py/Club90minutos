const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const predicciones = await prisma.prediccionPartido.findMany({
    include: {
      usuario: true,
      partido: {
        include: {
          resultado_oficial: {
            include: {
              goleadores: true
            }
          }
        }
      }
    }
  });

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
    }
  });

  const mapaCalculado = new Map();
  for (const u of usuarios) {
    mapaCalculado.set(u.id, {
      nombre: u.nombre_completo,
      correo: u.correo,
      exactos: 0,
      ganadores: 0,
      goleadores: 0,
      total: 0
    });
  }

  for (const pred of predicciones) {
    const userStats = mapaCalculado.get(pred.usuario_id);
    if (!userStats) continue;

    const res = pred.partido.resultado_oficial;
    if (!res) continue;

    const gL_real = res.goles_local_real;
    const gV_real = res.goles_visitante_real;
    const gL_pred = pred.goles_local_predicho;
    const gV_pred = pred.goles_visitante_predicho;

    // 1. Marcador exacto (5 Pts)
    const esExacto = gL_real === gL_pred && gV_real === gV_pred;
    if (esExacto) {
      userStats.exactos += 5;
      userStats.total += 5;
    } else {
      // 2. Ganador o Empate (3 Pts)
      const signoReal = gL_real > gV_real ? "L" : gL_real < gV_real ? "V" : "E";
      const signoPred = gL_pred > gV_pred ? "L" : gL_pred < gV_pred ? "V" : "E";
      if (signoReal === signoPred) {
        userStats.ganadores += 3;
        userStats.total += 3;
      }
    }

    // 3. Goleador del partido (2 Pts)
    if (pred.jugador_goleador_predicho_id && res.goleadores && res.goleadores.length > 0) {
      const anotadorAcertado = res.goleadores.some(g => g.jugador_id === pred.jugador_goleador_predicho_id);
      if (anotadorAcertado) {
        userStats.goleadores += 2;
        userStats.total += 2;
      }
    }
  }

  const tablaFinal = Array.from(mapaCalculado.values())
    .sort((a, b) => b.total - a.total)
    .map((item, index) => ({
      pos: index + 1,
      ...item
    }));

  console.log("SIMULACIÓN DE PUNTOS TOTALES ACUMULADOS CON LOS 34 PARTIDOS FINALIZADOS (CON GOLEADORES CORREGIDOS):");
  console.table(tablaFinal.map(f => ({
    pos: f.pos,
    nombre: f.nombre,
    pts_exacto: f.exactos,
    pts_ganador: f.ganadores,
    pts_goleadores: f.goleadores,
    total: f.total
  })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
