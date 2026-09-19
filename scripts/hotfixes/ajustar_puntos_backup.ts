// =============================================================================
// HOMOLOGACIÓN DE PUNTOS CON LA TABLA MAESTRA VERIFICADA
// =============================================================================
//
// CONTEXTO (diagnóstico del 2026-09-18, ver docs/incidente-puntos-goleadores-2026-09-18.md):
//
//   La tabla de la app y el respaldo manual verificado coincidían EXACTAMENTE en
//   "Resultados Correctos" y "Ganador Partido" para los 16 participantes. El 100% de
//   la diferencia (66 pts = 33 aciertos) estaba en la columna "Goleadores".
//
//   Causa raíz: el cron de ESPN (src/app/api/cron/espn/route.ts) leía el campo
//   inexistente `detail.participants[0].athlete.displayName` en vez de
//   `detail.athletesInvolved[0].displayName`. La lista de goleadores salía SIEMPRE vacía
//   y, al liquidar, esa lista vacía BORRABA los ResultadoGoleador del partido. Quedaron
//   10 partidos con goles y cero goleadores válidos (registros fantasma con jugador_id
//   null), por lo que nadie podía recibir puntos de goleador en ellos.
//
// QUÉ HACE ESTE SCRIPT (en este orden):
//
//   FASE A — RESTAURACIÓN REAL (preferida):
//     Repone los goleadores oficiales de esos partidos desde la evidencia de la API de
//     ESPN (src/data/goleadores-recuperados-espn.json) y reliquida cada partido.
//     Esto recupera los puntos por el camino correcto: con datos oficiales verificables,
//     no con parches. Es idempotente.
//
//   FASE B — HOMOLOGACIÓN DEL RESIDUO:
//     Compara el resultado contra src/data/maestro-categorias.json (la tabla maestra) y,
//     si aún queda diferencia, crea UNA fila de ajuste por participante y categoría con
//     partido_id = null, que es la marca de un ajuste (un puntaje real SIEMPRE tiene
//     partido asociado).
//     partido_id = null es deliberado: las reliquidaciones solo borran filas con
//     partido_id NO nulo, así que estos ajustes ya no se pierden (así se perdieron los
//     anteriores). El historial del participante los muestra como ajuste, nunca
//     disfrazados de acierto en un partido.
//
//   FASE C — VERIFICACIÓN:
//     Recalcula los totales desde la base y exige coincidencia EXACTA con la maestra.
//     Si algo no cuadra, termina con código de salida 1.
//
// USO:
//   npx tsx scripts/hotfixes/ajustar_puntos_backup.ts              # dry-run (no escribe)
//   npx tsx scripts/hotfixes/ajustar_puntos_backup.ts --aplicar    # aplica los cambios
//   npx tsx scripts/hotfixes/ajustar_puntos_backup.ts --aplicar --solo-residuo
//                                                    (omite la Fase A de restauración)
//   npx tsx scripts/hotfixes/ajustar_puntos_backup.ts --aplicar --solo-restauracion
//                                                    (solo repone goleadores; no crea ajustes)
//
// SEGURIDAD: siempre genera un respaldo JSON en backups/<timestamp>/ antes de escribir.
// =============================================================================

import { PrismaClient, CategoriaPuntaje } from "@prisma/client";
import { calcularPuntosPartido } from "../../src/lib/calculadorPuntos";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const APLICAR = process.argv.includes("--aplicar");
const SOLO_RESIDUO = process.argv.includes("--solo-residuo");
const SOLO_RESTAURACION = process.argv.includes("--solo-restauracion");
const MOTIVO_AJUSTE =
  "Homologación con tabla maestra verificada 2026-09-18 (goleadores destruidos por el cron de ESPN)";

function normalizeName(name: string): string {
  return (name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

interface MaestroEntry {
  nombre_completo: string;
  exacto: number;
  ganador: number;
  goleador: number;
  total: number;
}

interface PartidoRecuperado {
  partido_id: number;
  jornada: number;
  encuentro: string;
  marcador_oficial: string;
  goles_esperados: number;
  jugador_ids: number[];
  goleadores: { nombre_espn: string; jugador_id: number | null; nombre_bd?: string }[];
}

const CATEGORIA_POR_CLAVE: Record<"exacto" | "ganador" | "goleador", CategoriaPuntaje> = {
  exacto: CategoriaPuntaje.resultado_exacto,
  ganador: CategoriaPuntaje.ganador_partido,
  goleador: CategoriaPuntaje.goleador,
};

async function respaldar(etiqueta: string) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(process.cwd(), "backups", ts);
  fs.mkdirSync(dir, { recursive: true });

  const [puntaje, resultadoOficial, resultadoGoleador, usuario] = await Promise.all([
    prisma.puntaje.findMany(),
    prisma.resultadoOficial.findMany(),
    prisma.resultadoGoleador.findMany(),
    prisma.usuario.findMany(),
  ]);

  const escribir = (nombre: string, datos: unknown) =>
    fs.writeFileSync(path.join(dir, nombre), JSON.stringify(datos, null, 1), "utf-8");

  escribir("puntaje.json", puntaje);
  escribir("resultado_oficial.json", resultadoOficial);
  escribir("resultado_goleador.json", resultadoGoleador);
  escribir("usuario.json", usuario);
  escribir("_metadata.json", {
    fecha_backup: new Date().toISOString(),
    motivo: etiqueta,
    registros_por_tabla: {
      puntaje: puntaje.length,
      resultado_oficial: resultadoOficial.length,
      resultado_goleador: resultadoGoleador.length,
      usuario: usuario.length,
    },
  });

  console.log(`  Respaldo escrito en backups/${ts}/ (${puntaje.length} puntajes, ${resultadoGoleador.length} goleadores)\n`);
  return dir;
}

/** Totales por categoría calculados desde los partidos reales (sin ajustes). */
async function totalesReales() {
  const filas = await prisma.puntaje.findMany({ where: { partido_id: { not: null } } });
  const mapa = new Map<number, { exacto: number; ganador: number; goleador: number }>();
  for (const f of filas) {
    const acc = mapa.get(f.usuario_id) ?? { exacto: 0, ganador: 0, goleador: 0 };
    if (f.categoria === CategoriaPuntaje.resultado_exacto) acc.exacto += f.puntos_obtenidos;
    else if (f.categoria === CategoriaPuntaje.ganador_partido) acc.ganador += f.puntos_obtenidos;
    else if (f.categoria === CategoriaPuntaje.goleador) acc.goleador += f.puntos_obtenidos;
    mapa.set(f.usuario_id, acc);
  }
  return mapa;
}

async function main() {
  console.log("=".repeat(78));
  console.log(APLICAR ? "MODO: APLICANDO CAMBIOS" : "MODO: DRY-RUN (no se escribe nada; agrega --aplicar)");
  console.log("=".repeat(78) + "\n");

  const maestroPath = path.join(__dirname, "..", "..", "src", "data", "maestro-categorias.json");
  const maestro: MaestroEntry[] = JSON.parse(fs.readFileSync(maestroPath, "utf-8")).participantes;
  const maestroPorNombre = new Map(maestro.map((m) => [normalizeName(m.nombre_completo), m]));

  const evidenciaPath = path.join(__dirname, "..", "..", "src", "data", "goleadores-recuperados-espn.json");
  const recuperados: PartidoRecuperado[] = JSON.parse(fs.readFileSync(evidenciaPath, "utf-8")).partidos;

  if (APLICAR) await respaldar("Previo a homologación de puntos con tabla maestra verificada");

  // ---------------------------------------------------------------------------
  // FASE A — Restaurar los goleadores oficiales perdidos
  // ---------------------------------------------------------------------------
  console.log("FASE A — RESTAURACIÓN DE GOLEADORES OFICIALES (evidencia: API de ESPN)");
  console.log("-".repeat(78));

  if (SOLO_RESIDUO) {
    console.log("  Omitida por --solo-residuo\n");
  } else {
    for (const r of recuperados) {
      const partido = await prisma.partido.findUnique({
        where: { id: r.partido_id },
        include: { resultado_oficial: { include: { goleadores: true } } },
      });

      if (!partido || !partido.resultado_oficial) {
        console.log(`  pid ${r.partido_id}: SIN resultado oficial en esta base — se omite`);
        continue;
      }

      const ro = partido.resultado_oficial;
      const marcadorBD = `${ro.goles_local_real}-${ro.goles_visitante_real}`;

      // Guarda de seguridad: no tocar un partido cuyo marcador no coincide con la evidencia.
      if (marcadorBD !== r.marcador_oficial) {
        console.log(
          `  pid ${r.partido_id}: MARCADOR DISTINTO (base ${marcadorBD} vs evidencia ${r.marcador_oficial}) — se omite por seguridad`
        );
        continue;
      }

      const validosActuales = ro.goleadores.filter((g) => g.jugador_id !== null).map((g) => g.jugador_id);
      if (validosActuales.length > 0) {
        console.log(`  pid ${r.partido_id}: ya tiene ${validosActuales.length} goleador(es) válido(s) — se omite (idempotente)`);
        continue;
      }

      const existentes = await prisma.jugador.findMany({
        where: { id: { in: r.jugador_ids } },
        select: { id: true },
      });
      if (existentes.length !== r.jugador_ids.length) {
        console.log(
          `  pid ${r.partido_id}: faltan jugadores en esta base (${existentes.length}/${r.jugador_ids.length}) — se omite`
        );
        continue;
      }

      const nombres = r.goleadores.map((g) => g.nombre_bd || g.nombre_espn).join(", ");
      if (!APLICAR) {
        console.log(`  pid ${r.partido_id} ${marcadorBD} ${r.encuentro}`);
        console.log(`      -> repondría ${r.jugador_ids.length} goleador(es): ${nombres}`);
      } else {
        const res = await calcularPuntosPartido(
          r.partido_id,
          ro.goles_local_real,
          ro.goles_visitante_real,
          r.jugador_ids,
          ro.ingresado_por_usuario_id,
          { forzarVaciarGoleadores: true } // reemplaza los registros fantasma (jugador_id null)
        );
        console.log(`  pid ${r.partido_id} ${marcadorBD} — repuestos ${res.goleadoresAplicados.length} goleador(es): ${nombres}`);
        console.log(`      (${res.totalPrediccionesLiquidadas} predicciones reliquidadas)`);
      }
    }
  }

  if (SOLO_RESTAURACION) {
    console.log("\nFases B y C omitidas por --solo-restauracion (solo se repusieron goleadores).");
    await prisma.$disconnect();
    return;
  }

  // ---------------------------------------------------------------------------
  // FASE B — Homologar el residuo contra la tabla maestra
  // ---------------------------------------------------------------------------
  console.log("\nFASE B — HOMOLOGACIÓN DEL RESIDUO CONTRA LA TABLA MAESTRA");
  console.log("-".repeat(78));

  const usuarios = await prisma.usuario.findMany({ where: { activo: true } });
  const reales = await totalesReales();

  console.log(
    `${"Participante".padEnd(20)} ${"real(e/g/gol)".padStart(16)} ${"maestra".padStart(16)}  ajuste`
  );

  let filasAjuste = 0;
  for (const u of usuarios) {
    const target = maestroPorNombre.get(normalizeName(u.nombre_completo));
    if (!target) continue;

    const real = reales.get(u.id) ?? { exacto: 0, ganador: 0, goleador: 0 };
    const deltas = {
      exacto: target.exacto - real.exacto,
      ganador: target.ganador - real.ganador,
      goleador: target.goleador - real.goleador,
    };

    const sReal = `${real.exacto}/${real.ganador}/${real.goleador}`;
    const sTgt = `${target.exacto}/${target.ganador}/${target.goleador}`;
    const sDelta =
      Object.entries(deltas)
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => `${k} ${v > 0 ? "+" : ""}${v}`)
        .join(", ") || "sin ajuste";

    console.log(`${u.nombre_completo.padEnd(20)} ${sReal.padStart(16)} ${sTgt.padStart(16)}  ${sDelta}`);

    if (APLICAR) {
      // Se reemplazan los ajustes previos (idempotencia). Un ajuste es SIEMPRE una fila
      // sin partido asociado: un puntaje real siempre viene de un partido concreto.
      await prisma.puntaje.deleteMany({ where: { usuario_id: u.id, partido_id: null } });
      for (const clave of ["exacto", "ganador", "goleador"] as const) {
        const delta = deltas[clave];
        if (delta === 0) continue;
        await prisma.puntaje.create({
          data: {
            usuario_id: u.id,
            categoria: CATEGORIA_POR_CLAVE[clave],
            partido_id: null,
            puntos_obtenidos: delta,
          },
        });
        filasAjuste++;
      }
    } else {
      filasAjuste += Object.values(deltas).filter((d) => d !== 0).length;
    }
  }

  console.log(`\n  Filas de ajuste ${APLICAR ? "creadas" : "que se crearían"}: ${filasAjuste}`);

  // ---------------------------------------------------------------------------
  // FASE C — Verificación final
  // ---------------------------------------------------------------------------
  console.log("\nFASE C — VERIFICACIÓN FINAL CONTRA LA TABLA MAESTRA");
  console.log("-".repeat(78));

  if (!APLICAR) {
    console.log("  (dry-run: la verificación real se hace al aplicar)\n");
    await prisma.$disconnect();
    return;
  }

  const todas = await prisma.puntaje.findMany();
  const finales = new Map<number, { exacto: number; ganador: number; goleador: number; total: number }>();
  for (const f of todas) {
    const acc = finales.get(f.usuario_id) ?? { exacto: 0, ganador: 0, goleador: 0, total: 0 };
    if (f.categoria === CategoriaPuntaje.resultado_exacto) acc.exacto += f.puntos_obtenidos;
    else if (f.categoria === CategoriaPuntaje.ganador_partido) acc.ganador += f.puntos_obtenidos;
    else if (f.categoria === CategoriaPuntaje.goleador) acc.goleador += f.puntos_obtenidos;
    acc.total += f.puntos_obtenidos;
    finales.set(f.usuario_id, acc);
  }

  let errores = 0;
  console.log(`${"Participante".padEnd(20)}${"exacto".padStart(8)}${"ganador".padStart(9)}${"goleador".padStart(10)}${"TOTAL".padStart(8)}${"maestra".padStart(9)}  estado`);
  for (const u of usuarios) {
    const target = maestroPorNombre.get(normalizeName(u.nombre_completo));
    if (!target) continue;
    const f = finales.get(u.id) ?? { exacto: 0, ganador: 0, goleador: 0, total: 0 };
    const ok =
      f.exacto === target.exacto &&
      f.ganador === target.ganador &&
      f.goleador === target.goleador &&
      f.total === target.total;
    if (!ok) errores++;
    console.log(
      `${u.nombre_completo.padEnd(20)}${String(f.exacto).padStart(8)}${String(f.ganador).padStart(9)}${String(f.goleador).padStart(10)}${String(f.total).padStart(8)}${String(target.total).padStart(9)}  ${ok ? "OK" : "*** NO COINCIDE ***"}`
    );
  }

  await prisma.$disconnect();

  if (errores > 0) {
    console.error(`\nFALLO: ${errores} participante(s) no coinciden con la tabla maestra.`);
    process.exit(1);
  }
  console.log("\nTODOS los participantes coinciden EXACTAMENTE con la tabla maestra verificada.");
}

main().catch(async (e) => {
  console.error("Error fatal:", e);
  await prisma.$disconnect();
  process.exit(1);
});
