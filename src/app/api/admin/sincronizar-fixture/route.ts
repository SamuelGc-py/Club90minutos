import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenerSesion, secretoValido } from "@/lib/auth";
import fixture from "@/data/fixture-maestro-2026-II.json";

export const dynamic = "force-dynamic";

/**
 * Compara el fixture de la base con el maestro (src/data/fixture-maestro-2026-II.json):
 *   - informa partidos del maestro que no existen en la base, o con fecha distinta;
 *   - pasa de "aplazado" a "programado" los partidos que el maestro ya reprogramó
 *     (solo si NO tienen resultado y su fecha coincide exactamente con el maestro).
 *
 * POST { "aplicar": false }   -> simulación (por defecto)
 * POST { "aplicar": true }    -> escribe
 * Autenticación: sesión de administrador, o el secreto HOMOLOGACION_SECRET / SYNC_LIVE_SECRET.
 */
export async function POST(req: Request) {
  const esAdmin = (await obtenerSesion(req))?.esAdmin;
  if (!esAdmin && !secretoValido(req, ["HOMOLOGACION_SECRET", "SYNC_LIVE_SECRET"])) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { aplicar = false } = await req.json().catch(() => ({}));

  const equipos = await prisma.equipo.findMany({ select: { id: true, nombre: true } });
  const idPorNombre = new Map(equipos.map((e) => [e.nombre, e.id]));

  const faltantes: string[] = [];
  const fechaDistinta: string[] = [];
  const aProgramar: { id: number; partido: string; fecha: string }[] = [];

  for (const m of (fixture as any).partidos as any[]) {
    const nombre = `#${m.numero} J${m.jornada} ${m.local} vs ${m.visitante}`;
    const l = idPorNombre.get(m.local);
    const v = idPorNombre.get(m.visitante);
    const p = l && v
      ? await prisma.partido.findFirst({
          where: { equipo_local_id: l, equipo_visitante_id: v },
          include: { resultado_oficial: { select: { id: true } } },
        })
      : null;
    if (!p) {
      faltantes.push(nombre);
      continue;
    }
    const fBD = new Date(p.fecha_hora_partido);
    const fM = new Date(m.fecha_utc);
    const coincide = m.con_hora
      ? Math.abs(fBD.getTime() - fM.getTime()) < 60_000
      : fBD.toISOString().slice(0, 10) === fM.toISOString().slice(0, 10);
    if (!coincide) {
      fechaDistinta.push(`${nombre}: base ${fBD.toISOString()} vs maestro ${fM.toISOString()}`);
      continue;
    }
    if (p.estado === "aplazado" && !p.resultado_oficial) {
      aProgramar.push({ id: p.id, partido: nombre, fecha: fBD.toISOString() });
    }
  }

  if (aplicar && aProgramar.length) {
    await prisma.partido.updateMany({
      where: { id: { in: aProgramar.map((x) => x.id) }, estado: "aplazado", resultado_oficial: { is: null } },
      data: { estado: "programado" },
    });
  }

  return NextResponse.json({
    modo: aplicar ? "aplicado" : "simulacion",
    partidos_en_maestro: (fixture as any).partidos.length,
    faltantes,
    fecha_distinta: fechaDistinta,
    pasados_a_programado: aProgramar,
  });
}
