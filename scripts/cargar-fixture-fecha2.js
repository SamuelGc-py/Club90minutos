const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const partidosFecha2 = [
  {
    jornada: 2,
    fase: 'fase_1',
    local: 'Atlético Bucaramanga',
    visitante: 'Llaneros F.C.',
    fecha: '2026-07-30T20:00:00-05:00',
    cierre: '2026-07-30T19:00:00-05:00',
    estadio: 'Estadio Américo Montanini',
  },
  {
    jornada: 2,
    fase: 'fase_1',
    local: 'Fortaleza',
    visitante: 'Deportivo Pereira',
    fecha: '2026-07-31T20:00:00-05:00',
    cierre: '2026-07-31T19:00:00-05:00',
    estadio: 'Estadio Metropolitano de Techo',
  },
  {
    jornada: 2,
    fase: 'fase_1',
    local: 'Deportivo Pasto',
    visitante: 'Águilas Doradas',
    fecha: '2026-08-01T14:00:00-05:00',
    cierre: '2026-08-01T13:00:00-05:00',
    estadio: 'Estadio Departamental Libertad',
  },
  {
    jornada: 2,
    fase: 'fase_1',
    local: 'Alianza Valledupar F.C.',
    visitante: 'Deportes Tolima',
    fecha: '2026-08-01T16:05:00-05:00',
    cierre: '2026-08-01T15:05:00-05:00',
    estadio: 'Estadio Armando Maestre Pavajeau',
  },
  {
    jornada: 2,
    fase: 'fase_1',
    local: 'Independiente Medellín',
    visitante: 'Deportivo Cali',
    fecha: '2026-08-01T18:10:00-05:00',
    cierre: '2026-08-01T17:10:00-05:00',
    estadio: 'Estadio Atanasio Girardot',
  },
  {
    jornada: 2,
    fase: 'fase_1',
    local: 'Junior F.C.',
    visitante: 'Millonarios F.C.',
    fecha: '2026-08-01T20:15:00-05:00',
    cierre: '2026-08-01T19:15:00-05:00',
    estadio: 'Estadio Romelio Martínez',
  },
  {
    jornada: 2,
    fase: 'fase_1',
    local: 'Jaguares F.C.',
    visitante: 'Atlético Nacional',
    fecha: '2026-08-02T15:45:00-05:00',
    cierre: '2026-08-02T14:45:00-05:00',
    estadio: 'Estadio Jaraguay',
  },
  {
    jornada: 2,
    fase: 'fase_1',
    local: 'América de Cali',
    visitante: 'Boyacá Chicó F.C.',
    fecha: '2026-08-02T17:45:00-05:00',
    cierre: '2026-08-02T16:45:00-05:00',
    estadio: 'Estadio Pascual Guerrero',
  },
  {
    jornada: 2,
    fase: 'fase_1',
    local: 'Independiente Santa Fe',
    visitante: 'Once Caldas DAF',
    fecha: '2026-08-02T20:00:00-05:00',
    cierre: '2026-08-02T19:00:00-05:00',
    estadio: 'Estadio El Campín',
  },
  {
    jornada: 2,
    fase: 'fase_1',
    local: 'Cúcuta Deportivo',
    visitante: 'Internacional de Bogotá',
    fecha: '2026-09-02T18:20:00-05:00',
    cierre: '2026-09-02T17:20:00-05:00',
    estadio: 'Estadio General Santander',
  },
];

async function main() {
  const equipos = await prisma.equipo.findMany();
  const getEquipoId = (nombre) => {
    const eq = equipos.find((e) => e.nombre.toLowerCase().trim() === nombre.toLowerCase().trim());
    if (!eq) throw new Error(`Equipo no encontrado: ${nombre}`);
    return eq.id;
  };

  for (const p of partidosFecha2) {
    const localId = getEquipoId(p.local);
    const visitanteId = getEquipoId(p.visitante);

    const partidoExistente = await prisma.partido.findFirst({
      where: {
        fase: p.fase,
        equipo_local_id: localId,
        equipo_visitante_id: visitanteId,
      },
    });

    if (partidoExistente) {
      await prisma.partido.update({
        where: { id: partidoExistente.id },
        data: {
          jornada: p.jornada,
          fecha_hora_partido: new Date(p.fecha),
          hora_cierre_predicciones: new Date(p.cierre),
          estadio: p.estadio,
        },
      });
      console.log(`🔄 Actualizado: ${p.local} vs ${p.visitante} (ID ${partidoExistente.id})`);
    } else {
      const creado = await prisma.partido.create({
        data: {
          fase: p.fase,
          jornada: p.jornada,
          equipo_local_id: localId,
          equipo_visitante_id: visitanteId,
          fecha_hora_partido: new Date(p.fecha),
          hora_cierre_predicciones: new Date(p.cierre),
          estadio: p.estadio,
          estado: 'programado',
        },
      });
      console.log(`✅ Creado: ${p.local} vs ${p.visitante} (ID ${creado.id})`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
