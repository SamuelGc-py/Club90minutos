/**
 * Verificación de SOLO LECTURA de la integración con ESPN.
 * No escribe nada en la base: consulta el scoreboard de ESPN para los últimos días y
 * los próximos, y muestra cómo cruza cada partido del fixture (mismo criterio que
 * src/lib/liquidacionAutomatica.ts) y qué haría la liquidación automática con él.
 *
 * Uso: npx tsx scripts/verificar-espn.ts [diasAtras=4] [diasAdelante=3]
 */
import { prisma } from "../src/lib/db";
import { claveEquipo } from "../src/lib/ligaEspn";

const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard";
const FINALES = new Set(["STATUS_FULL_TIME", "STATUS_FINAL", "STATUS_FINAL_AET", "STATUS_FINAL_PEN"]);
const yyyymmdd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

async function main() {
  const atras = Number(process.argv[2] ?? 4);
  const adelante = Number(process.argv[3] ?? 3);
  const ahora = Date.now();
  const dias: string[] = [];
  for (let i = -atras - 1; i <= adelante; i++) dias.push(yyyymmdd(new Date(ahora + i * 86400000)));

  const t0 = Date.now();
  const respuestas = await Promise.all(
    dias.map(async (d) => {
      const r = await fetch(`${ESPN}?dates=${d}`, { cache: "no-store" });
      return { d, ok: r.ok, status: r.status, events: r.ok ? ((await r.json()).events ?? []) : [] };
    })
  );
  const eventos = respuestas.flatMap((r) => r.events);
  console.log(`ESPN: ${respuestas.filter((r) => r.ok).length}/${respuestas.length} consultas OK, ${eventos.length} eventos, ${Date.now() - t0} ms`);
  for (const r of respuestas) if (!r.ok) console.log(`  ✗ ${r.d}: HTTP ${r.status}`);

  const partidos = await prisma.partido.findMany({
    where: { fecha_hora_partido: { gte: new Date(ahora - atras * 86400000), lte: new Date(ahora + adelante * 86400000) } },
    include: { equipo_local: true, equipo_visitante: true, resultado_oficial: true },
    orderBy: { fecha_hora_partido: "asc" },
  });

  let cruzan = 0;
  for (const p of partidos) {
    const kL = claveEquipo(p.equipo_local.nombre);
    const kV = claveEquipo(p.equipo_visitante.nombre);
    const ev = eventos.find((e: any) => {
      const cs = e.competitions?.[0]?.competitors ?? [];
      const h = cs.find((c: any) => c.homeAway === "home");
      const a = cs.find((c: any) => c.homeAway === "away");
      return h && a && claveEquipo(h.team?.displayName) === kL && claveEquipo(a.team?.displayName) === kV &&
        Math.abs(new Date(e.date).getTime() - p.fecha_hora_partido.getTime()) < 2 * 86400000;
    });
    const fecha = p.fecha_hora_partido.toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" });
    const nombre = `#${p.id} ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre}`;
    if (!ev) {
      console.log(`  ? ${fecha} ${nombre} [${p.estado}] → sin evento en ESPN`);
      continue;
    }
    cruzan++;
    const comp = ev.competitions[0];
    const tipo = comp.status?.type?.name;
    const h = comp.competitors.find((c: any) => c.homeAway === "home");
    const a = comp.competitors.find((c: any) => c.homeAway === "away");
    const goles = (comp.details ?? []).filter((d: any) => d.scoringPlay && !d.shootout);
    const marcador = `${h.score ?? "-"}-${a.score ?? "-"}`;
    let accion = "esperar";
    if (p.resultado_oficial || ["resultado_cargado", "puntaje_calculado"].includes(p.estado)) accion = "ya liquidado";
    else if (p.estado === "aplazado") accion = "aplazado (no se toca)";
    else if (FINALES.has(tipo)) accion = goles.length === (Number(h.score) || 0) + (Number(a.score) || 0) ? "LIQUIDABLE" : "revisión: goles no cuadran";
    console.log(`  ✓ ${fecha} ${nombre} [${p.estado}] ESPN ${tipo} ${marcador} · ${goles.length} gol(es) en detalle → ${accion}`);
  }
  console.log(`Fixture en la ventana: ${partidos.length} partidos, ${cruzan} cruzan con ESPN.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
