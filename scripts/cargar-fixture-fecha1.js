const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const EQUIPOS_DATA = [
  { nombre: "Llaneros FC", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Llaneros.webp" },
  { nombre: "Deportivo Pereira", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Deportivo%20Pereira.webp" },
  { nombre: "Deportivo Cali", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Deportivo%20Cali.webp" },
  { nombre: "Jaguares de Córdoba", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Jaguares%20de%20Cordoba.webp" },
  { nombre: "Boyacá Chicó", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Boyaca%20Chic%C3%B3.webp" },
  { nombre: "Atlético Nacional", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Atl%C3%A9tico%20Nacional.webp" },
  { nombre: "Independiente Medellín", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Independiente%20Medell%C3%ADn.webp" },
  { nombre: "Deportivo Pasto", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Deportivo%20Pasto.webp" },
  { nombre: "Millonarios FC", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Millonarios.webp" },
  { nombre: "Atlético Bucaramanga", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Atl%C3%A9tico%20Bucaramanga.webp" },
  { nombre: "Deportes Tolima", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Deportes%20Tolima.webp" },
  { nombre: "Junior de Barranquilla", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Junior%20FC.webp" },
  { nombre: "Internacional de Bogotá", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Internacional%20de%20Bogot%C3%A1.webp" },
  { nombre: "América de Cali", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Am%C3%A9rica%20de%20Cali.webp" },
  { nombre: "Águilas Doradas", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/%C3%81guilas%20Doradas.webp" },
  { nombre: "Independiente Santa Fe", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Independiente%20Santa%20Fe.webp" },
  { nombre: "Alianza FC", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Alianza%20Valledupar.webp" },
  { nombre: "Fortaleza CEIF", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Fortaleza.webp" },
  { nombre: "Once Caldas", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Once%20Caldas.webp" },
  { nombre: "Cúcuta Deportivo", escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/C%C3%BAcuta%20Deportivo.webp" },
];

const PARTIDOS_OFICIALES_FECHA_1 = [
  {
    local: "Llaneros FC",
    visitante: "Deportivo Pereira",
    fechaISO: "2026-07-24T18:10:00-05:00",
    estadio: "Estadio Bello Horizonte",
    jornada: 1,
  },
  {
    local: "Deportivo Cali",
    visitante: "Jaguares de Córdoba",
    fechaISO: "2026-07-24T20:15:00-05:00",
    estadio: "Estadio Deportivo Cali",
    jornada: 1,
  },
  {
    local: "Boyacá Chicó",
    visitante: "Atlético Nacional",
    fechaISO: "2026-07-25T16:00:00-05:00",
    estadio: "Estadio La Independencia",
    jornada: 1,
  },
  {
    local: "Independiente Medellín",
    visitante: "Deportivo Pasto",
    fechaISO: "2026-07-25T16:05:00-05:00",
    estadio: "Estadio Metropolitano de Itagüí",
    jornada: 1,
  },
  {
    local: "Millonarios FC",
    visitante: "Atlético Bucaramanga",
    fechaISO: "2026-07-25T18:10:00-05:00",
    estadio: "Estadio El Campín",
    jornada: 1,
  },
  {
    local: "Deportes Tolima",
    visitante: "Junior de Barranquilla",
    fechaISO: "2026-07-25T20:15:00-05:00",
    estadio: "Estadio Manuel Murillo Toro",
    jornada: 1,
  },
  {
    local: "Internacional de Bogotá",
    visitante: "América de Cali",
    fechaISO: "2026-07-26T14:00:00-05:00",
    estadio: "Estadio El Campín",
    jornada: 1,
  },
  {
    local: "Águilas Doradas",
    visitante: "Independiente Santa Fe",
    fechaISO: "2026-07-26T16:05:00-05:00",
    estadio: "Estadio Cincuenta Aniversario",
    jornada: 1,
  },
  {
    local: "Alianza FC",
    visitante: "Fortaleza CEIF",
    fechaISO: "2026-07-26T18:10:00-05:00",
    estadio: "Estadio Armando Maestre Pavajeau",
    jornada: 1,
  },
  {
    local: "Once Caldas",
    visitante: "Cúcuta Deportivo",
    fechaISO: "2026-07-26T20:15:00-05:00",
    estadio: "Estadio Palogrande",
    jornada: 1,
  },
];

async function main() {
  console.log("Creando/Actualizando los 20 equipos del FPC...");
  const equiposMap = new Map();

  for (const eq of EQUIPOS_DATA) {
    const creado = await prisma.equipo.upsert({
      where: { nombre: eq.nombre },
      update: { escudo_url: eq.escudo_url },
      create: { nombre: eq.nombre, escudo_url: eq.escudo_url },
    });
    equiposMap.set(eq.nombre, creado.id);
  }
  console.log(`✅ ${equiposMap.size} Equipos guardados en DB.`);

  // Limpiar partidos anteriores de fase_1 para cargar los de la imagen exactamente
  console.log("Cargando los 10 partidos oficiales de la Fecha 1...");
  await prisma.prediccionPartido.deleteMany({});
  await prisma.partido.deleteMany({});

  for (const p of PARTIDOS_OFICIALES_FECHA_1) {
    const localId = equiposMap.get(p.local);
    const visitanteId = equiposMap.get(p.visitante);

    if (!localId || !visitanteId) {
      console.error(`Error: No se encontró equipo ${p.local} o ${p.visitante}`);
      continue;
    }

    const fechaHora = new Date(p.fechaISO);
    const horaCierre = new Date(fechaHora.getTime() - 60 * 60 * 1000);

    await prisma.partido.create({
      data: {
        fase: "fase_1",
        jornada: p.jornada,
        equipo_local_id: localId,
        equipo_visitante_id: visitanteId,
        fecha_hora_partido: fechaHora,
        hora_cierre_predicciones: horaCierre,
        estadio: p.estadio,
        estado: "predicciones_abiertas",
      },
    });
  }

  console.log("✅ ¡Los 10 partidos de la Fecha 1 oficial han sido cargados exitosamente!");
}

main()
  .catch((e) => {
    console.error("Error al cargar fixture:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
