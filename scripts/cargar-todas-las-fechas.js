const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseFechaHora(fechaStr, horaStr) {
  if (!fechaStr || !horaStr) {
    // Si no hay fecha/hora definida, poner fecha futura por defecto (e.g. aplazado)
    return { fechaISO: '2026-09-30T20:00:00-05:00', esAplazado: true };
  }

  // fechaStr ej: "7/24/2026" (M/D/YYYY) o "8/3/2026"
  const [m, d, y] = fechaStr.split('/').map(n => parseInt(n, 10));
  if (!m || !d || !y) return { fechaISO: '2026-09-30T20:00:00-05:00', esAplazado: true };

  // horaStr ej: "6:10 p.m." o "2:00 p.m." o "8:00 p.m." o "4:05 p.m."
  let hora24 = 0;
  let min = 0;
  const match = horaStr.match(/(\d+):(\d+)\s*(a\.m\.|p\.m\.|am|pm)/i);
  if (match) {
    let h = parseInt(match[1], 10);
    min = parseInt(match[2], 10);
    const ampm = match[3].toLowerCase();
    if (ampm.includes('p') && h < 12) h += 12;
    if (ampm.includes('a') && h === 12) h = 0;
    hora24 = h;
  }

  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  const hh = String(hora24).padStart(2, '0');
  const minStr = String(min).padStart(2, '0');

  return {
    fechaISO: `${y}-${mm}-${dd}T${hh}:${minStr}:00-05:00`,
    esAplazado: false
  };
}

async function main() {
  const equipos = await prisma.equipo.findMany();
  console.log(`Cargados ${equipos.length} equipos de la DB.`);

  const normalizar = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/f\.c\.|fc|d\.a\.f\.|c\.d\.|ceif|de barranquilla|de cordoba/gi, '')
      .trim();

  const getEquipoId = (nombre) => {
    const normBuscado = normalizar(nombre);
    const eq = equipos.find((e) => {
      const normDb = normalizar(e.nombre);
      return normDb === normBuscado || normDb.includes(normBuscado) || normBuscado.includes(normDb);
    });
    return eq ? eq.id : null;
  };

  const htmlPath = path.join(__dirname, '..', 'temp_jugadores', 'Maestro_Liga BetplayII.xlsx', 'Partidos.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  const partidosParsed = [];

  $('table.waffle tbody tr').each((i, row) => {
    const cells = $(row).find('td');
    if (cells.length < 10) return;

    const partidoNum = $(cells[0]).text().trim();
    const faseJornada = $(cells[1]).text().trim(); // e.g. J-1, J-2...
    const fechaStr = $(cells[3]).text().trim();
    const horaStr = $(cells[4]).text().trim();
    const local = $(cells[6]).text().trim();
    const visitante = $(cells[9]).text().trim();

    if (faseJornada && faseJornada.startsWith('J-') && local && visitante) {
      const jornada = parseInt(faseJornada.replace('J-', ''), 10);
      const localId = getEquipoId(local);
      const visitanteId = getEquipoId(visitante);

      if (localId && visitanteId) {
        const { fechaISO, esAplazado } = parseFechaHora(fechaStr, horaStr);
        partidosParsed.push({
          num: partidoNum,
          jornada,
          local,
          localId,
          visitante,
          visitanteId,
          fechaISO,
          esAplazado
        });
      } else {
        console.warn(`⚠️ No se encontró equipo para: ${local} (ID ${localId}) vs ${visitante} (ID ${visitanteId})`);
      }
    }
  });

  console.log(`✅ Partidos parseados exitosamente: ${partidosParsed.length}`);

  let creados = 0;
  let actualizados = 0;

  for (const p of partidosParsed) {
    const fechaHora = new Date(p.fechaISO);
    const horaCierre = new Date(fechaHora.getTime() - 60 * 60 * 1000); // 1 hora antes

    // Si el partido es en el pasado y no tiene estado, mantenemos o asignamos estado
    const estado = p.esAplazado ? 'aplazado' : 'programado';

    const existente = await prisma.partido.findFirst({
      where: {
        fase: 'fase_1',
        equipo_local_id: p.localId,
        equipo_visitante_id: p.visitanteId,
      }
    });

    if (existente) {
      await prisma.partido.update({
        where: { id: existente.id },
        data: {
          jornada: p.jornada,
          fecha_hora_partido: fechaHora,
          hora_cierre_predicciones: horaCierre,
          ...(existente.estado === 'programado' && p.esAplazado ? { estado: 'aplazado' } : {})
        }
      });
      actualizados++;
    } else {
      await prisma.partido.create({
        data: {
          fase: 'fase_1',
          jornada: p.jornada,
          equipo_local_id: p.localId,
          equipo_visitante_id: p.visitanteId,
          fecha_hora_partido: fechaHora,
          hora_cierre_predicciones: horaCierre,
          estado: estado,
        }
      });
      creados++;
    }
  }

  console.log(`🎉 Proceso completado: ${creados} partidos creados, ${actualizados} actualizados.`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
