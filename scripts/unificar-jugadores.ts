import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando unificación de jugadores duplicados...");
  
  // 1. Crear equipo dummy si no existe
  let equipoFantasma = await prisma.equipo.findFirst({
    where: { nombre: "Plantilla Descartados" }
  });
  if (!equipoFantasma) {
    equipoFantasma = await prisma.equipo.create({
      data: {
        nombre: "Plantilla Descartados",
        escudo_url: "https://raw.githubusercontent.com/SamuelGc-py/IMG_escudos-equipos/main/Escudos_WEBP/Generico.webp"
      }
    });
    console.log("Equipo fantasma creado:", equipoFantasma.id);
  }

  const reemplazos = [
    { falso: 1385, real: 1205, nombre: "Carlos Bacca" },
    { falso: 1384, real: 906, nombre: "Eduard Bello" }
  ];

  for (const r of reemplazos) {
    console.log(`\nUnificando ${r.nombre}... (${r.falso} -> ${r.real})`);
    
    // PrediccionPartido
    const pp = await prisma.prediccionPartido.updateMany({
      where: { jugador_goleador_predicho_id: r.falso },
      data: { jugador_goleador_predicho_id: r.real }
    });
    console.log(`PrediccionPartido actualizadas: ${pp.count}`);

    // PrediccionInicial
    const pi = await prisma.prediccionInicial.updateMany({
      where: { goleador_torneo_jugador_id: r.falso },
      data: { goleador_torneo_jugador_id: r.real }
    });
    console.log(`PrediccionInicial actualizadas: ${pi.count}`);

    // ResultadoGoleador
    const rg = await prisma.resultadoGoleador.updateMany({
      where: { jugador_id: r.falso },
      data: { jugador_id: r.real }
    });
    console.log(`ResultadoGoleador actualizadas: ${rg.count}`);

    // Mover jugador al equipo descartado y cambiar nombre para no confundir
    await prisma.jugador.update({
      where: { id: r.falso },
      data: { 
        equipo_id: equipoFantasma.id,
        nombre: `${r.nombre} (DUPLICADO)`
      }
    });
    console.log(`Jugador falso ${r.falso} movido al equipo fantasma.`);
  }

  console.log("\nProceso de unificación finalizado correctamente.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
