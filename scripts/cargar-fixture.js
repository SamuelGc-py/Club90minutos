const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const EQUIPOS_DATA = [
  { nombre: "Junior de Barranquilla", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Escudo_del_Club_Popular_Junior_F.C..png" },
  { nombre: "Atlético Nacional", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Escudo_de_Atl%C3%A9tico_Nacional.png" },
  { nombre: "Millonarios FC", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Escudo_de_Millonarios_F.C..png" },
  { nombre: "Independiente Santa Fe", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/7/75/Escudo_de_Santa_Fe.png" },
  { nombre: "América de Cali", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Escudo_de_Am%C3%A9rica_de_Cali.png" },
  { nombre: "Deportivo Cali", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Escudo_de_Deportivo_Cali.png" },
  { nombre: "Independiente Medellín", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Escudo_de_Independiente_Medell%C3%ADn.png" },
  { nombre: "Deportes Tolima", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Escudo_de_Deportes_Tolima.png" },
  { nombre: "Once Caldas", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Escudo_de_Once_Caldas.png" },
  { nombre: "Atlético Bucaramanga", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Escudo_de_Atl%C3%A9tico_Bucaramanga.png" },
  { nombre: "Deportivo Pasto", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Escudo_de_Deportivo_Pasto.png" },
  { nombre: "La Equidad", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Escudo_de_La_Equidad.png" },
  { nombre: "Deportivo Pereira", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Escudo_de_Deportivo_Pereira.png" },
  { nombre: "Águilas Doradas", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Escudo_de_%C3%81guilas_Doradas.png" },
  { nombre: "Envigado FC", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/6/69/Escudo_de_Envigado_F.C..png" },
  { nombre: "Jaguares de Córdoba", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/6/64/Escudo_de_Jaguares_de_C%C3%B3rdoba.png" },
  { nombre: "Patriotas Boyacá", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/4/42/Escudo_de_Patriotas_Boyac%C3%A1.png" },
  { nombre: "Fortaleza CEIF", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Escudo_de_Fortaleza_CEIF.png" },
  { nombre: "Alianza FC", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Escudo_de_Alianza_FC.png" },
  { nombre: "Boyacá Chicó", escudo_url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Escudo_de_Boyac%C3%A1_Chic%C3%B3.png" },
];

const JUGADORES_DATA = [
  { equipo: "Junior de Barranquilla", nombres: ["Carlos Bacca", "Yimmi Chará", "José Enamorado", "Marco Pérez"] },
  { equipo: "Atlético Nacional", nombres: ["Alfredo Morelos", "Edwin Cardona", "Marino Hinestroza", "Kevin Viveros"] },
  { equipo: "Millonarios FC", nombres: ["Radamel Falcao García", "Leonardo Castro", "Daniel Ruiz", "David Mackalister Silva"] },
  { equipo: "Independiente Santa Fe", nombres: ["Hugo Rodallega", "Harold Santiago Mosquera", "Daniel Torres", "Omar Albornoz"] },
  { equipo: "América de Cali", nombres: ["Adrián Ramos", "Rodrigo Holgado", "Cristian Barrios", "Duván Vergara"] },
  { equipo: "Deportivo Cali", nombres: ["Fredy Montero", "Andrés Andrade", "Jarlan Barrera", "Javier Reina"] },
  { equipo: "Independiente Medellín", nombres: ["Brayan León", "Luis Sandoval", "Francisco Chaverra", "Homer Martínez"] },
  { equipo: "Deportes Tolima", nombres: ["Yeison Guzmán", "Gustavo Ramírez", "Jeison Lucumí", "Alex Castro"] },
  { equipo: "Once Caldas", nombres: ["Dayro Moreno", "Michael Barrios", "Jhon Araujo", "Lucas Ríos"] },
  { equipo: "Atlético Bucaramanga", nombres: ["Fabry Castro", "Esneyder Mena", "Frank Castañeda", "Aldair Gutiérrez"] },
];

const PARTIDOS_FECHA_1 = [
  { local: "Junior de Barranquilla", visitante: "Atlético Nacional", fecha: "2026-07-25T18:00:00Z" },
  { local: "Millonarios FC", visitante: "Independiente Santa Fe", fecha: "2026-07-25T20:00:00Z" },
  { local: "América de Cali", visitante: "Deportivo Cali", fecha: "2026-07-26T16:00:00Z" },
  { local: "Independiente Medellín", visitante: "Deportes Tolima", fecha: "2026-07-26T18:10:00Z" },
  { local: "Once Caldas", visitante: "Atlético Bucaramanga", fecha: "2026-07-26T20:20:00Z" },
  { local: "Deportivo Pasto", visitante: "La Equidad", fecha: "2026-07-27T16:00:00Z" },
  { local: "Deportivo Pereira", visitante: "Águilas Doradas", fecha: "2026-07-27T18:00:00Z" },
  { local: "Envigado FC", visitante: "Jaguares de Córdoba", fecha: "2026-07-27T20:00:00Z" },
  { local: "Patriotas Boyacá", visitante: "Fortaleza CEIF", fecha: "2026-07-28T18:00:00Z" },
  { local: "Alianza FC", visitante: "Boyacá Chicó", fecha: "2026-07-28T20:00:00Z" },
];

async function main() {
  console.log("Cargando equipos...");
  const equiposMap = new Map();

  for (const eq of EQUIPOS_DATA) {
    const creado = await prisma.equipo.upsert({
      where: { nombre: eq.nombre },
      update: { escudo_url: eq.escudo_url },
      create: { nombre: eq.nombre, escudo_url: eq.escudo_url },
    });
    equiposMap.set(eq.nombre, creado.id);
  }
  console.log(`✅ ${equiposMap.size} Equipos cargados/actualizados.`);

  console.log("Cargando jugadores...");
  for (const jugGroup of JUGADORES_DATA) {
    const equipoId = equiposMap.get(jugGroup.equipo);
    if (equipoId) {
      for (const nombreJugador of jugGroup.nombres) {
        const existente = await prisma.jugador.findFirst({
          where: { nombre: nombreJugador, equipo_id: equipoId },
        });
        if (!existente) {
          await prisma.jugador.create({
            data: { nombre: nombreJugador, equipo_id: equipoId },
          });
        }
      }
    }
  }
  console.log("✅ Jugadores cargados.");

  console.log("Cargando Partidos de Fecha 1...");
  let jornadaCount = 1;
  for (const p of PARTIDOS_FECHA_1) {
    const localId = equiposMap.get(p.local);
    const visitanteId = equiposMap.get(p.visitante);

    if (localId && visitanteId) {
      const fechaHora = new Date(p.fecha);
      const horaCierre = new Date(fechaHora.getTime() - 60 * 60 * 1000); // 1 hr antes

      await prisma.partido.upsert({
        where: {
          fase_jornada: {
            fase: "fase_1",
            jornada: jornadaCount,
          },
        },
        update: {
          equipo_local_id: localId,
          equipo_visitante_id: visitanteId,
          fecha_hora_partido: fechaHora,
          hora_cierre_predicciones: horaCierre,
        },
        create: {
          fase: "fase_1",
          jornada: jornadaCount,
          equipo_local_id: localId,
          equipo_visitante_id: visitanteId,
          fecha_hora_partido: fechaHora,
          hora_cierre_predicciones: horaCierre,
          estado: "predicciones_abiertas",
        },
      });
      jornadaCount++;
    }
  }
  console.log("✅ Partidos de la Fecha 1 cargados exitosamente.");
}

main()
  .catch((e) => {
    console.error("Error al cargar fixture:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
