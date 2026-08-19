const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usuarios = await prisma.usuario.findMany({
    where: { activo: true, rol: { nombre: 'participante' } },
    include: {
      puntajes: true
    }
  });

  const correosExcluidos = ["prueba@gmail.com", "PRUEBA@GMAIL.COM"];

  const tabla = usuarios
    .filter(u => !correosExcluidos.includes(u.correo.toLowerCase()))
    .map(u => {
      const ptsExacto = u.puntajes.reduce((acc, p) => acc + (p.pts_resultado_exacto || 0), 0);
      const ptsGanador = u.puntajes.reduce((acc, p) => acc + (p.pts_ganador_partido || 0), 0);
      const ptsGoleador = u.puntajes.reduce((acc, p) => acc + (p.pts_goleador_partido || 0), 0);
      const ptsCampeon = u.puntajes.reduce((acc, p) => acc + (p.pts_campeon || 0), 0);
      const ptsFinalistas = u.puntajes.reduce((acc, p) => acc + (p.pts_finalistas || 0), 0);
      const ptsClasificados = u.puntajes.reduce((acc, p) => acc + (p.pts_clasificados || 0), 0);
      const ptsGoleadorTorneo = u.puntajes.reduce((acc, p) => acc + (p.pts_goleador_torneo || 0), 0);
      const total = ptsExacto + ptsGanador + ptsGoleador + ptsCampeon + ptsFinalistas + ptsClasificados + ptsGoleadorTorneo;
      return {
        nombre: u.nombre,
        correo: u.correo,
        ptsExacto,
        ptsGanador,
        ptsGoleador,
        ptsCampeon,
        ptsFinalistas,
        ptsClasificados,
        ptsGoleadorTorneo,
        total
      };
    })
    .sort((a, b) => b.total - a.total);

  console.log("TABLA CALCULADA DESDE BASE DE DATOS (Puntaje table):");
  console.table(tabla.slice(0, 16));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
