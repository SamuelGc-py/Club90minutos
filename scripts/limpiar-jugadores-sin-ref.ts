import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("=== LIMPIEZA DE JUGADORES SIN REFERENCIAS ===\n");

  // IDs de los 26 jugadores sin referencias (confirmados en el diagnóstico)
  const idsABorrar = [
    1224, // Brian Benítez - Llaneros
    1208, // Kevin Armesto - Llaneros
    1212, // Oscar Vega - Llaneros
    1049, // Diego Mendoza - Deportivo Pereira
    999,  // Matias Orozco - Deportivo Cali
    1157, // Didier Bueno - Jaguares
    1162, // Mauricio Castaño - Jaguares
    1091, // Alexis Serna - Independiente Medellín
    1086, // Málcom Palacios - Independiente Medellín
    1008, // Joyce Ossa - Deportivo Pasto
    1236, // Jhonier Guerrero - Millonarios
    1184, // Fabián Correa - Junior
    1189, // Jhon Navia - Junior
    1318, // Deivid Castro - Internacional de Bogotá
    852,  // Carlos Sierra - América de Cali
    1301, // Royner Benítez - Águilas Doradas
    1119, // Daniel Torres - Independiente Santa Fe
    1400, // H. Palacios - Independiente Santa Fe
    1067, // Cristian Orozco - Fortaleza
    1396, // Jhon Martínez - Fortaleza
    1068, // Sebastian Ramirez - Fortaleza
    941,  // Santiago Guzmán - Cúcuta Deportivo
    945,  // Stiven Monsalve - Cúcuta Deportivo
    946,  // Valentín Robaldo - Cúcuta Deportivo
    1385, // Carlos Bacca (DUPLICADO) - Plantilla Descartados
    1384, // Eduard Bello (DUPLICADO) - Plantilla Descartados
  ];

  // PASO 1: Verificación de seguridad — confirmar que NINGUNO tiene referencias
  console.log("--- PASO 1: Verificación de seguridad (doble-check) ---");
  const bloqueados: number[] = [];

  for (const id of idsABorrar) {
    const predPartido = await prisma.prediccionPartido.count({
      where: { jugador_goleador_predicho_id: id },
    });
    const predInicial = await prisma.prediccionInicial.count({
      where: { goleador_torneo_jugador_id: id },
    });
    const goles = await prisma.resultadoGoleador.count({
      where: { jugador_id: id },
    });

    if (predPartido > 0 || predInicial > 0 || goles > 0) {
      console.log(`  ❌ ID ${id}: TIENE referencias (${predPartido} pred, ${predInicial} inicial, ${goles} goles). BLOQUEADO.`);
      bloqueados.push(id);
    }
  }

  if (bloqueados.length > 0) {
    console.log(`\n⚠️ ${bloqueados.length} jugadores tienen referencias inesperadas. Abortando para no perder datos.`);
    return;
  }

  console.log("  ✅ Todos los 26 jugadores confirmados sin referencias.\n");

  // PASO 2: Backup antes de borrar
  console.log("--- PASO 2: Backup de los jugadores a eliminar ---");
  const jugadoresABorrar = await prisma.jugador.findMany({
    where: { id: { in: idsABorrar } },
    include: { equipo: true },
  });

  const backupPath = path.join(__dirname, "..", "backups", `backup-borrados-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(jugadoresABorrar, null, 2));
  console.log(`  📦 Backup de ${jugadoresABorrar.length} jugadores guardado en: ${backupPath}\n`);

  // PASO 3: Borrar
  console.log("--- PASO 3: Eliminación ---");
  const resultado = await prisma.jugador.deleteMany({
    where: { id: { in: idsABorrar } },
  });
  console.log(`  🗑️ Eliminados: ${resultado.count} jugadores\n`);

  // PASO 4: Verificación final
  console.log("--- PASO 4: Verificación final ---");
  const totalFinal = await prisma.jugador.count();
  console.log(`  Total jugadores en BD ahora: ${totalFinal}`);

  // Verificar que los que tienen referencias siguen intactos
  const idsConReferencias = [1005, 1177, 900, 1256, 1381, 972, 1332, 839, 1297, 1074, 952, 943, 949, 1377, 954];
  const sobrevivientes = await prisma.jugador.count({
    where: { id: { in: idsConReferencias } },
  });
  console.log(`  Jugadores con referencias (intactos): ${sobrevivientes}/${idsConReferencias.length}`);
  
  if (sobrevivientes === idsConReferencias.length) {
    console.log("\n✅ Limpieza completada exitosamente. Ningún pronóstico de participante fue afectado.");
  } else {
    console.log("\n⚠️ ALERTA: Algunos jugadores con referencias no se encontraron. Revisar el backup.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
