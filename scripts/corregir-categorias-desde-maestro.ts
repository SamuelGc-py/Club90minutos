// FASE 5/7/8 — Corrige la distribución por categoría (Marcador Exacto / Ganador Partido / Goleadores)
// para que coincida con la tabla maestra verificada, SIN cambiar el total de nadie.
//
// QUÉ HACE (y por qué es distinto de scripts/ajustar-puntos.ts y scripts/sincronizar-maestro.ts,
// que quedaron en scripts/deprecated/ — ver ese README):
//   Los scripts viejos, cuando el total calculado no coincidía con el maestro, insertaban TODA
//   la diferencia como una sola fila `categoria: 'ganador_partido', partido_id: null`. Eso deja el
//   total bien pero infla "Ganador Partido" y deja "Marcador Exacto"/"Goleadores" por debajo de su
//   valor real — exactamente el bug que este script corrige.
//
//   Este script:
//     1. Encuentra esas filas viejas y sospechosas (categoria IN [resultado_exacto, ganador_partido]
//        con partido_id NULL — un valor real de esas categorías SIEMPRE tiene partido_id, así que
//        partido_id NULL ahí es la firma inequívoca de un parche viejo).
//     2. Calcula los puntos REALES de partido para cada participante usando solo filas con
//        partido_id NO nulo (los partidos de verdad, calculados por calcularPuntosPartido).
//     3. Lee los números objetivo de scripts/maestro-categorias.json (NO están hardcodeados aquí).
//     4. Verifica que el total no cambie (si el ajuste necesario no cuadra con lo que se está
//        reemplazando, SE DETIENE para ese participante en vez de forzarlo).
//     5. Borra solo las filas viejas sospechosas y crea hasta 3 filas de ajuste nuevas, una por
//        categoría, correctamente etiquetadas.
//
//   IMPORTANTE sobre "goleador": la app distingue "goleador del torneo" (categoria='goleador',
//   partido_id=NULL) de "goleador de partido" (categoria='goleador', partido_id NO nulo) — ver
//   src/app/api/consolidados/route.ts línea ~138-141. Por eso el ajuste de goleador de partido NO
//   puede usar partido_id: null (se contaría como goleador del TORNEO). Este script lo asocia a un
//   partido real ya jugado por ese mismo participante, dejando explícito en el log que es una
//   redistribución de ajuste manual y no un acierto nuevo en ese partido puntual.
//
// Uso (ejecuta backup-antes-correccion.ts ANTES, siempre):
//   npx tsx scripts/backup-antes-correccion.ts
//   npx tsx scripts/corregir-categorias-desde-maestro.ts
//   npx tsx scripts/corregir-categorias-desde-maestro.ts --aplicar   (para escribir los cambios; sin esto solo hace un dry-run)

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function normalizeName(name: string): string {
  return (name || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}

interface MaestroEntry {
  nombre_completo: string;
  exacto: number;
  ganador: number;
  goleador: number;
  total: number;
}

async function main() {
  const aplicar = process.argv.includes("--aplicar");
  console.log(aplicar ? "MODO: APLICANDO CAMBIOS\n" : "MODO: DRY-RUN (no se escribe nada; agrega --aplicar para ejecutar de verdad)\n");

  const maestroPath = path.join(__dirname, "maestro-categorias.json");
  const maestroData = JSON.parse(fs.readFileSync(maestroPath, "utf-8"));
  const maestro: MaestroEntry[] = maestroData.participantes;
  const maestroPorNombre = new Map(maestro.map((m) => [normalizeName(m.nombre_completo), m]));

  const usuarios = await prisma.usuario.findMany({
    where: { activo: true },
    include: { puntajes: true },
  });

  const filasReporteFinal: string[] = [];
  let participantesCorregidos = 0;
  let participantesSinCambio = 0;
  let participantesConProblema = 0;

  for (const u of usuarios) {
    const target = maestroPorNombre.get(normalizeName(u.nombre_completo));
    if (!target) continue; // Usuario no está en la tabla maestra (cuenta de prueba, admin, etc.)

    const todasLasFilas = u.puntajes;
    const filasReales = todasLasFilas.filter((p) => p.partido_id !== null);
    const filasSospechosas = todasLasFilas.filter(
      (p) => p.partido_id === null && (p.categoria === "resultado_exacto" || p.categoria === "ganador_partido")
    );
    const filasIntocables = todasLasFilas.filter(
      (p) =>
        !(p.partido_id !== null) &&
        !(p.categoria === "resultado_exacto" || p.categoria === "ganador_partido")
    ); // campeon, finalistas, clasificados_cuadrangulares, goleador del torneo — NO SE TOCAN

    const realExacto = filasReales.filter((p) => p.categoria === "resultado_exacto").reduce((a, c) => a + c.puntos_obtenidos, 0);
    const realGanador = filasReales.filter((p) => p.categoria === "ganador_partido").reduce((a, c) => a + c.puntos_obtenidos, 0);
    const realGoleador = filasReales.filter((p) => p.categoria === "goleador").reduce((a, c) => a + c.puntos_obtenidos, 0);
    const sospechosoTotal = filasSospechosas.reduce((a, c) => a + c.puntos_obtenidos, 0);
    const intocableTotal = filasIntocables.reduce((a, c) => a + c.puntos_obtenidos, 0);

    const totalActual = realExacto + realGanador + realGoleador + sospechosoTotal + intocableTotal;

    if (totalActual !== target.total) {
      console.warn(
        `⚠️  DETENIDO para ${u.nombre_completo}: total actual en BD (${totalActual}) no coincide con el maestro (${target.total}). ` +
          `No se toca este participante — requiere revisión manual antes de continuar.`
      );
      participantesConProblema++;
      filasReporteFinal.push(`${u.nombre_completo} | ${totalActual} vs maestro ${target.total} | ⚠️ NO COINCIDE TOTAL — sin corregir`);
      continue;
    }

    const diffExacto = target.exacto - realExacto;
    const diffGanador = target.ganador - realGanador;
    const diffGoleador = target.goleador - realGoleador;
    const sumaDiffs = diffExacto + diffGanador + diffGoleador;

    if (sumaDiffs !== sospechosoTotal) {
      console.warn(
        `⚠️  DETENIDO para ${u.nombre_completo}: la suma de ajustes necesarios (${sumaDiffs}) no coincide con el valor de la fila sospechosa a reemplazar (${sospechosoTotal}). ` +
          `Esto cambiaría el total y no debería pasar — requiere revisión manual.`
      );
      participantesConProblema++;
      filasReporteFinal.push(`${u.nombre_completo} | ${totalActual} | ⚠️ INCONSISTENCIA EN AJUSTE — sin corregir`);
      continue;
    }

    if (diffExacto === 0 && diffGanador === 0 && diffGoleador === 0) {
      console.log(`✓ ${u.nombre_completo}: ya coincide con el maestro, sin cambios necesarios.`);
      participantesSinCambio++;
      filasReporteFinal.push(`${u.nombre_completo} | ${totalActual} | ${realExacto} | ${realGanador} | ${realGoleador} | SÍ`);
      continue;
    }

    console.log(
      `→ ${u.nombre_completo}: exacto ${realExacto}->${target.exacto} (${diffExacto >= 0 ? "+" : ""}${diffExacto}), ` +
        `ganador ${realGanador}->${target.ganador} (${diffGanador >= 0 ? "+" : ""}${diffGanador}), ` +
        `goleador ${realGoleador}->${target.goleador} (${diffGoleador >= 0 ? "+" : ""}${diffGoleador})`
    );

    if (aplicar) {
      // 1. Borrar SOLO las filas viejas sospechosas de este usuario.
      await prisma.puntaje.deleteMany({
        where: { id: { in: filasSospechosas.map((f) => f.id) } },
      });

      // 2. Insertar los nuevos ajustes, uno por categoría, solo si son distintos de 0.
      if (diffExacto !== 0) {
        await prisma.puntaje.create({
          data: { usuario_id: u.id, categoria: "resultado_exacto", partido_id: null, puntos_obtenidos: diffExacto },
        });
      }
      if (diffGanador !== 0) {
        await prisma.puntaje.create({
          data: { usuario_id: u.id, categoria: "ganador_partido", partido_id: null, puntos_obtenidos: diffGanador },
        });
      }
      if (diffGoleador !== 0) {
        // "goleador" con partido_id NULL se contaría como goleador DEL TORNEO — necesita un partido_id real.
        const partidoRef = filasReales[0]?.partido_id ?? null;
        if (partidoRef === null) {
          console.warn(
            `   ⚠️  ${u.nombre_completo} no tiene ningún partido real registrado para anclar el ajuste de goleador (${diffGoleador} pts). Ajuste de goleador NO aplicado — revisar manualmente.`
          );
        } else {
          await prisma.puntaje.create({
            data: { usuario_id: u.id, categoria: "goleador", partido_id: partidoRef, puntos_obtenidos: diffGoleador },
          });
          console.log(`   (ajuste de goleador anclado al partido_id ${partidoRef} — redistribución manual, no un acierto nuevo en ese partido)`);
        }
      }
    }

    participantesCorregidos++;
    filasReporteFinal.push(`${u.nombre_completo} | ${totalActual} | ${target.exacto} | ${target.ganador} | ${target.goleador} | ${aplicar ? "SÍ (corregido)" : "PENDIENTE (dry-run)"}`);
  }

  console.log(`\n================= RESUMEN =================`);
  console.log(`Corregidos: ${participantesCorregidos}`);
  console.log(`Ya coincidían: ${participantesSinCambio}`);
  console.log(`Con problema (sin tocar): ${participantesConProblema}`);
  console.log(`\n| Participante | Total | Exactos | Resultados | Goleadores | Coincide con manual |`);
  console.log(`|---|---|---|---|---|---|`);
  for (const fila of filasReporteFinal) console.log(`| ${fila} |`);

  if (!aplicar) {
    console.log(`\nEsto fue un DRY-RUN. Nada se escribió en la base de datos.`);
    console.log(`Si los números de arriba se ven bien, corre de nuevo con --aplicar.`);
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
