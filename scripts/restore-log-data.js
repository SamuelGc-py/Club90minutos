const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const backupData = [
  // Llaneros vs Pereira
  { matchLocal: 'Llaneros', user: 'Andres Toro', local: 1, vis: 1, golId: 616 },
  { matchLocal: 'Llaneros', user: 'Harold Berdugo', local: 0, vis: 0, golId: null },
  { matchLocal: 'Llaneros', user: 'Nelson Berdugo', local: 1, vis: 2, golId: 619 },
  { matchLocal: 'Llaneros', user: 'Ignacio Barrios', local: 2, vis: 2, golId: 725 },
  { matchLocal: 'Llaneros', user: 'Erick Andrade', local: 2, vis: 0, golId: 723 },

  // Cali vs Jaguares
  { matchLocal: 'Cali', user: 'Andres Toro', local: 2, vis: 0, golId: 565 },
  { matchLocal: 'Cali', user: 'Nelson Berdugo', local: 2, vis: 0, golId: 567 },
  { matchLocal: 'Cali', user: 'Juan Hernandez', local: 1, vis: 0, golId: 556 },
  { matchLocal: 'Cali', user: 'Ricardo Vanegas', local: 2, vis: 0, golId: 548 },
  { matchLocal: 'Cali', user: 'Ricardo Soto', local: 2, vis: 1, golId: 563 },

  // Medellín vs Pasto
  { matchLocal: 'Medellín', user: 'Lucas Saavedra', local: 2, vis: 1, golId: 804 },
  { matchLocal: 'Medellín', user: 'Romario Gomez', local: 2, vis: 0, golId: 641 },
  { matchLocal: 'Medellín', user: 'Ricardo Vanegas', local: 2, vis: 1, golId: 633 },
  { matchLocal: 'Medellín', user: 'Samuel Gutierrez', local: 3, vis: 1, golId: 625 },
  { matchLocal: 'Medellín', user: 'Hernando Davila', local: 1, vis: 0, golId: 804 },

  // Millonarios vs Bucaramanga
  { matchLocal: 'Millonarios', user: 'Nelson Berdugo', local: 2, vis: 0, golId: 742 },
  { matchLocal: 'Millonarios', user: 'Pedro Cantero', local: 2, vis: 1, golId: 745 },
  { matchLocal: 'Millonarios', user: 'Erick Andrade', local: 3, vis: 1, golId: 741 },
  { matchLocal: 'Millonarios', user: 'Ricardo Vanegas', local: 3, vis: 2, golId: 735 },
  { matchLocal: 'Millonarios', user: 'Harold Berdugo', local: 2, vis: 0, golId: 746 },

  // Tolima vs Junior
  { matchLocal: 'Tolima', user: 'Manuel Cabarcas', local: 1, vis: 2, golId: 702 },
  { matchLocal: 'Tolima', user: 'Pedro Cantero', local: 1, vis: 1, golId: 526 },
  { matchLocal: 'Tolima', user: 'Juan Hernandez', local: 1, vis: 1, golId: 544 },
  { matchLocal: 'Tolima', user: 'Lucas Saavedra', local: 1, vis: 1, golId: 532 },
  { matchLocal: 'Tolima', user: 'Rene Osorio', local: 1, vis: 2, golId: 693 },

  // Inter Bogotá vs América
  { matchLocal: 'Internacional', user: 'Ignacio Barrios', local: 1, vis: 1, golId: 784 },
  { matchLocal: 'Internacional', user: 'Ricardo Soto', local: 1, vis: 1, golId: 320 },
  { matchLocal: 'Internacional', user: 'Samuel Gutierrez', local: 1, vis: 2, golId: 317 },

  // Águilas Doradas vs Santa Fe
  { matchLocal: 'Águilas', user: 'Ricardo Soto', local: 1, vis: 1, golId: 350 },

  // Pasto vs Águilas Doradas
  { matchLocal: 'Pasto', user: 'Samuel Gutierrez', local: 1, vis: 1, golId: 143 },
  { matchLocal: 'Pasto', user: 'Nelson Berdugo', local: 1, vis: 1, golId: 143 },

  // Alianza vs Fortaleza
  { matchLocal: 'Alianza', user: 'Ricardo Soto', local: 1, vis: 0, golId: 430 },

  // Once Caldas vs Cúcuta
  { matchLocal: 'Once Caldas', user: 'Ricardo Soto', local: 2, vis: 2, golId: 377 },
];

async function restoreLogData() {
  console.log("Restaurando predicciones recuperadas del log...");
  let count = 0;

  for (const item of backupData) {
    const usr = await prisma.usuario.findFirst({
      where: { nombre_completo: { contains: item.user, mode: 'insensitive' } }
    });

    const partido = await prisma.partido.findFirst({
      where: { equipo_local: { nombre: { contains: item.matchLocal, mode: 'insensitive' } } }
    });

    if (usr && partido) {
      await prisma.prediccionPartido.upsert({
        where: {
          usuario_id_partido_id: {
            usuario_id: usr.id,
            partido_id: partido.id
          }
        },
        create: {
          usuario_id: usr.id,
          partido_id: partido.id,
          goles_local_predicho: item.local,
          goles_visitante_predicho: item.vis,
          jugador_goleador_predicho_id: item.golId,
          timestamp_envio: new Date(),
          estado: "enviada"
        },
        update: {
          goles_local_predicho: item.local,
          goles_visitante_predicho: item.vis,
          jugador_goleador_predicho_id: item.golId,
          timestamp_envio: new Date(),
          estado: "enviada"
        }
      });
      count++;
    }
  }

  console.log(`✅ ${count} predicciones restauradas exitosamente al instante.`);
}

restoreLogData().catch(console.error).finally(() => prisma.$disconnect());
