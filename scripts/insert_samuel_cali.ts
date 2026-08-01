import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Buscar usuario Samuel
  const usuario = await prisma.usuario.findFirst({
    where: {
      OR: [
        { id: 2 },
        { nombre_completo: { contains: "Samuel", mode: "insensitive" } },
        { correo: { contains: "samuel", mode: "insensitive" } }
      ]
    }
  });

  if (!usuario) {
    console.error("Usuario Samuel no encontrado");
    return;
  }
  console.log("Usuario encontrado:", usuario.id, usuario.nombre_completo);

  // 2. Buscar partido Cali vs Medellín
  const partidos = await prisma.partido.findMany({
    include: {
      equipo_local: true,
      equipo_visitante: true,
    }
  });

  const partidoCali = partidos.find((p) => {
    const local = p.equipo_local.nombre.toLowerCase();
    const visitante = p.equipo_visitante.nombre.toLowerCase();
    return (local.includes("cali") && visitante.includes("medell")) || (local.includes("medell") && visitante.includes("cali"));
  });

  if (!partidoCali) {
    console.error("Partido Cali vs Medellín no encontrado");
    console.log("Partidos disponibles en DB:", partidos.map(p => `${p.id}: ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}`));
    return;
  }

  console.log("Partido encontrado:", partidoCali.id, `${partidoCali.equipo_local.nombre} vs ${partidoCali.equipo_visitante.nombre}`);

  const esCaliLocal = partidoCali.equipo_local.nombre.toLowerCase().includes("cali");
  const golesLocal = esCaliLocal ? 2 : 1;
  const golesVisitante = esCaliLocal ? 1 : 2;
  const equipoCaliId = esCaliLocal ? partidoCali.equipo_local_id : partidoCali.equipo_visitante_id;

  // 3. Buscar o crear Jugador Dinenno
  let dinenno = await prisma.jugador.findFirst({
    where: {
      nombre: { contains: "Dinenno", mode: "insensitive" }
    }
  });

  if (!dinenno) {
    console.log("Creando jugador Juan Ignacio Dinenno...");
    dinenno = await prisma.jugador.create({
      data: {
        nombre: "Juan Ignacio Dinenno",
        equipo_id: equipoCaliId,
      }
    });
  }

  console.log("Jugador Dinenno ID:", dinenno.id, dinenno.nombre);

  // 4. Crear o actualizar predicción
  const prediccion = await prisma.prediccionPartido.upsert({
    where: {
      usuario_id_partido_id: {
        usuario_id: usuario.id,
        partido_id: partidoCali.id,
      }
    },
    update: {
      goles_local_predicho: golesLocal,
      goles_visitante_predicho: golesVisitante,
      jugador_goleador_predicho_id: dinenno.id,
      timestamp_envio: new Date(),
      estado: "enviada",
    },
    create: {
      usuario_id: usuario.id,
      partido_id: partidoCali.id,
      goles_local_predicho: golesLocal,
      goles_visitante_predicho: golesVisitante,
      jugador_goleador_predicho_id: dinenno.id,
      timestamp_envio: new Date(),
      estado: "enviada",
    }
  });

  console.log("PREDICCION_GUARDADA_EXITO:", JSON.stringify(prediccion));
}

main()
  .catch((e) => {
    console.error("Error ejecutando script:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
