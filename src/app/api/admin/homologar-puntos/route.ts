import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CategoriaPuntaje } from "@prisma/client";
import maestroData from "@/data/maestro-categorias.json";
import evidenciaData from "@/data/goleadores-recuperados-espn.json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * HOMOLOGACIÓN DE PUNTOS CONTRA LA TABLA MAESTRA VERIFICADA
 * =========================================================
 *
 * Ejecuta en el propio servidor (con su DATABASE_URL) la misma operación que
 * scripts/hotfixes/ajustar_puntos_backup.ts, para no tener que sacar las
 * credenciales de producción.
 *
 * DISEÑO DEFENSIVO (lecciones del incidente del 2026-09-18, en el que un cambio de
 * esquema desplegado sin migrar tumbó el sitio):
 *
 *   1. CERO cambios de esquema. Solo usa columnas que ya existen en producción:
 *      usuario_id, categoria, partido_id, puntos_obtenidos.
 *   2. Archivo nuevo y aislado. No modifica ninguna ruta existente.
 *   3. DRY-RUN por defecto. Solo escribe con "aplicar": true.
 *   4. TODO dentro de UNA transacción, con la verificación final DENTRO: si los
 *      totales no coinciden exactamente con la tabla maestra, lanza y Postgres
 *      revierte todo. Es imposible quedar a medias.
 *   5. Devuelve el respaldo completo de `puntaje` ANTES de tocar nada, para poder
 *      revertir aunque el proceso muera después.
 *   6. Doble autenticación: usuario administrador + secreto compartido.
 *
 * USO:
 *   POST /api/admin/homologar-puntos
 *   { "usuario_id": 2, "secret": "...", "aplicar": false }
 *
 * Un ajuste es SIEMPRE una fila con partido_id = null: un puntaje real siempre
 * proviene de un partido concreto. Así las reliquidaciones (que solo borran filas
 * con partido_id no nulo) no se los llevan por delante, que fue como se perdieron
 * las homologaciones anteriores.
 */

interface MaestroEntry {
  nombre_completo: string;
  exacto: number;
  ganador: number;
  goleador: number;
  total: number;
}

interface PartidoEvidencia {
  partido_id: number;
  encuentro: string;
  marcador_oficial: string;
  jugador_ids: number[];
}

const PUNTOS = { exacto: 5, ganador: 3, goleador: 2 } as const;
const CATEGORIA_POR_CLAVE = {
  exacto: CategoriaPuntaje.resultado_exacto,
  ganador: CategoriaPuntaje.ganador_partido,
  goleador: CategoriaPuntaje.goleador,
} as const;

function normalizar(nombre: string): string {
  return (nombre || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { usuario_id, secret, aplicar = false, restaurar_goleadores = true } = body ?? {};

    // --- 1. Secreto compartido -------------------------------------------------
    const secretoEsperado = process.env.HOMOLOGACION_SECRET || process.env.SYNC_LIVE_SECRET;
    if (!secretoEsperado) {
      return NextResponse.json(
        { error: "No hay secreto configurado en el servidor (HOMOLOGACION_SECRET o SYNC_LIVE_SECRET)." },
        { status: 500 }
      );
    }
    if (!secret || secret !== secretoEsperado) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // --- 2. Usuario administrador ---------------------------------------------
    if (!usuario_id) {
      return NextResponse.json({ error: "Falta usuario_id" }, { status: 400 });
    }
    const admin = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
      include: { rol: true },
    });
    if (!admin || admin.rol.nombre !== "administrador") {
      return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });
    }

    const maestro = (maestroData as any).participantes as MaestroEntry[];
    const maestroPorNombre = new Map(maestro.map((m) => [normalizar(m.nombre_completo), m]));
    const evidencia = (evidenciaData as any).partidos as PartidoEvidencia[];

    const usuarios = await prisma.usuario.findMany({ where: { activo: true } });
    const participantes = usuarios.filter((u) => maestroPorNombre.has(normalizar(u.nombre_completo)));

    if (participantes.length !== maestro.length) {
      return NextResponse.json(
        {
          error: "La tabla maestra no corresponde con los participantes activos de la base.",
          participantes_encontrados: participantes.length,
          participantes_en_maestro: maestro.length,
          no_encontrados: maestro
            .filter((m) => !usuarios.some((u) => normalizar(u.nombre_completo) === normalizar(m.nombre_completo)))
            .map((m) => m.nombre_completo),
        },
        { status: 409 }
      );
    }

    // --- 3. Respaldo del estado ANTES (se devuelve siempre) --------------------
    const puntajesAntes = await prisma.puntaje.findMany();
    const totalesAntes = resumirPorUsuario(puntajesAntes);
    const tablaAntes = participantes
      .map((u) => ({
        nombre_completo: u.nombre_completo,
        ...(totalesAntes.get(u.id) ?? { exacto: 0, ganador: 0, goleador: 0, total: 0 }),
      }))
      .sort((a, b) => b.total - a.total);

    const restauracion: any[] = [];
    const ajustes: any[] = [];
    const verificacion: any[] = [];

    // ===========================================================================
    // TODO EN UNA SOLA TRANSACCIÓN. Si la verificación falla, se lanza y revierte.
    // ===========================================================================
    const ejecutar = async (tx: any) => {
      // --- FASE A: reponer goleadores oficiales destruidos --------------------
      if (restaurar_goleadores) {
        for (const ev of evidencia) {
          const ro = await tx.resultadoOficial.findUnique({
            where: { partido_id: ev.partido_id },
            include: { goleadores: true },
          });
          if (!ro) {
            restauracion.push({ partido_id: ev.partido_id, accion: "omitido", motivo: "sin resultado oficial" });
            continue;
          }

          const marcadorBD = `${ro.goles_local_real}-${ro.goles_visitante_real}`;
          if (marcadorBD !== ev.marcador_oficial) {
            restauracion.push({
              partido_id: ev.partido_id,
              accion: "omitido",
              motivo: `marcador distinto (base ${marcadorBD} vs evidencia ${ev.marcador_oficial})`,
            });
            continue;
          }

          const validos = ro.goleadores.filter((g: any) => g.jugador_id !== null);
          if (validos.length > 0) {
            restauracion.push({
              partido_id: ev.partido_id,
              accion: "omitido",
              motivo: `ya tiene ${validos.length} goleador(es) válido(s)`,
            });
            continue;
          }

          const existentes = await tx.jugador.findMany({
            where: { id: { in: ev.jugador_ids } },
            select: { id: true },
          });
          if (existentes.length !== ev.jugador_ids.length) {
            restauracion.push({
              partido_id: ev.partido_id,
              accion: "omitido",
              motivo: `faltan jugadores en la base (${existentes.length}/${ev.jugador_ids.length})`,
            });
            continue;
          }

          await tx.resultadoGoleador.deleteMany({ where: { resultado_oficial_id: ro.id } });
          await tx.resultadoGoleador.createMany({
            data: ev.jugador_ids.map((jid) => ({
              resultado_oficial_id: ro.id,
              jugador_id: jid,
              es_autogol: false,
            })),
          });

          await recalcularPartido(tx, ev.partido_id, ro.goles_local_real, ro.goles_visitante_real, ev.jugador_ids);

          restauracion.push({
            partido_id: ev.partido_id,
            accion: "restaurado",
            encuentro: ev.encuentro,
            goleadores_repuestos: ev.jugador_ids.length,
          });
        }
      }

      // --- FASE B: ajustes contra la tabla maestra ----------------------------
      // Se borran TODOS los ajustes previos (partido_id null) y se recalculan.
      await tx.puntaje.deleteMany({ where: { partido_id: null } });

      const filasReales = await tx.puntaje.findMany({ where: { partido_id: { not: null } } });
      const reales = resumirPorUsuario(filasReales);

      for (const u of participantes) {
        const objetivo = maestroPorNombre.get(normalizar(u.nombre_completo))!;
        const real = reales.get(u.id) ?? { exacto: 0, ganador: 0, goleador: 0, total: 0 };
        const deltas = {
          exacto: objetivo.exacto - real.exacto,
          ganador: objetivo.ganador - real.ganador,
          goleador: objetivo.goleador - real.goleador,
        };

        for (const clave of ["exacto", "ganador", "goleador"] as const) {
          if (deltas[clave] === 0) continue;
          await tx.puntaje.create({
            data: {
              usuario_id: u.id,
              categoria: CATEGORIA_POR_CLAVE[clave],
              partido_id: null,
              puntos_obtenidos: deltas[clave],
            },
          });
          ajustes.push({
            participante: u.nombre_completo,
            categoria: clave,
            puntos: deltas[clave],
            calculado_desde: real[clave],
            objetivo: objetivo[clave],
          });
        }
      }

      // --- FASE C: verificación DENTRO de la transacción ----------------------
      const finales = resumirPorUsuario(await tx.puntaje.findMany());
      let errores = 0;
      for (const u of participantes) {
        const objetivo = maestroPorNombre.get(normalizar(u.nombre_completo))!;
        const f = finales.get(u.id) ?? { exacto: 0, ganador: 0, goleador: 0, total: 0 };
        const ok =
          f.exacto === objetivo.exacto &&
          f.ganador === objetivo.ganador &&
          f.goleador === objetivo.goleador &&
          f.total === objetivo.total;
        if (!ok) errores++;
        verificacion.push({
          participante: u.nombre_completo,
          exacto: f.exacto,
          ganador: f.ganador,
          goleador: f.goleador,
          total: f.total,
          objetivo: objetivo.total,
          ok,
        });
      }

      if (errores > 0) {
        // Lanza para que Postgres revierta TODO: nunca se queda a medias.
        throw new Error(
          `VERIFICACION_FALLIDA: ${errores} participante(s) no coinciden con la tabla maestra. No se aplicó ningún cambio.`
        );
      }

      return errores;
    };

    if (!aplicar) {
      // Dry-run real: se ejecuta todo en una transacción y se revierte a propósito.
      const SENTINELA = "DRY_RUN_OK";
      try {
        await prisma.$transaction(
          async (tx) => {
            await ejecutar(tx);
            throw new Error(SENTINELA);
          },
          { timeout: 55000, maxWait: 15000 }
        );
      } catch (e: any) {
        if (!String(e?.message || "").includes(SENTINELA)) throw e;
      }

      return NextResponse.json({
        modo: "dry-run",
        mensaje: "Simulación completa: se calculó todo y se revirtió. No se escribió nada.",
        tabla_antes: tablaAntes,
        restauracion,
        ajustes,
        verificacion,
        para_aplicar: 'Repite la llamada con "aplicar": true',
      });
    }

    await prisma.$transaction(ejecutar, { timeout: 55000, maxWait: 15000 });

    const tablaDespues = participantes
      .map((u) => {
        const v = verificacion.find((x) => x.participante === u.nombre_completo);
        return {
          nombre_completo: u.nombre_completo,
          exacto: v?.exacto ?? 0,
          ganador: v?.ganador ?? 0,
          goleador: v?.goleador ?? 0,
          total: v?.total ?? 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      modo: "aplicado",
      mensaje: "Homologación aplicada y verificada: los totales coinciden exactamente con la tabla maestra.",
      tabla_antes: tablaAntes,
      tabla_despues: tablaDespues,
      restauracion,
      ajustes,
      verificacion,
      respaldo_puntaje_antes: puntajesAntes,
    });
  } catch (error: any) {
    const msg = error?.message || "Error interno";
    console.error("Error en homologar-puntos:", msg);
    return NextResponse.json(
      {
        error: msg,
        nota: msg.includes("VERIFICACION_FALLIDA")
          ? "La transacción se revirtió por completo: la base quedó exactamente como estaba."
          : undefined,
      },
      { status: 500 }
    );
  }
}

/** Suma los puntajes por usuario y categoría. */
function resumirPorUsuario(filas: { usuario_id: number; categoria: string; puntos_obtenidos: number }[]) {
  const mapa = new Map<number, { exacto: number; ganador: number; goleador: number; total: number }>();
  for (const f of filas) {
    const acc = mapa.get(f.usuario_id) ?? { exacto: 0, ganador: 0, goleador: 0, total: 0 };
    if (f.categoria === "resultado_exacto") acc.exacto += f.puntos_obtenidos;
    else if (f.categoria === "ganador_partido") acc.ganador += f.puntos_obtenidos;
    else if (f.categoria === "goleador") acc.goleador += f.puntos_obtenidos;
    acc.total += f.puntos_obtenidos;
    mapa.set(f.usuario_id, acc);
  }
  return mapa;
}

/**
 * Recalcula los Puntaje de un partido con la misma lógica que calcularPuntosPartido,
 * pero inline: Prisma no admite transacciones anidadas y aquí todo va dentro de una.
 */
async function recalcularPartido(
  tx: any,
  partidoId: number,
  golesLocal: number,
  golesVisitante: number,
  goleadoresIds: number[]
) {
  const predicciones = await tx.prediccionPartido.findMany({ where: { partido_id: partidoId } });
  const realWinner = golesLocal > golesVisitante ? "local" : golesVisitante > golesLocal ? "visitante" : "empate";

  const nuevos: any[] = [];
  for (const pred of predicciones) {
    const pl = pred.goles_local_predicho;
    const pv = pred.goles_visitante_predicho;
    const predWinner = pl > pv ? "local" : pv > pl ? "visitante" : "empate";

    if (predWinner === realWinner) {
      nuevos.push({
        usuario_id: pred.usuario_id,
        partido_id: partidoId,
        categoria: CategoriaPuntaje.ganador_partido,
        puntos_obtenidos: PUNTOS.ganador,
      });
    }
    if (pl === golesLocal && pv === golesVisitante) {
      nuevos.push({
        usuario_id: pred.usuario_id,
        partido_id: partidoId,
        categoria: CategoriaPuntaje.resultado_exacto,
        puntos_obtenidos: PUNTOS.exacto,
      });
    }
    const acerto = pred.jugador_goleador_predicho_id !== null && goleadoresIds.includes(pred.jugador_goleador_predicho_id);
    const ceroCero = golesLocal === 0 && golesVisitante === 0 && pl === 0 && pv === 0 && !pred.jugador_goleador_predicho_id;
    if (acerto || ceroCero) {
      nuevos.push({
        usuario_id: pred.usuario_id,
        partido_id: partidoId,
        categoria: CategoriaPuntaje.goleador,
        puntos_obtenidos: PUNTOS.goleador,
      });
    }
  }

  await tx.puntaje.deleteMany({ where: { partido_id: partidoId } });
  if (nuevos.length > 0) await tx.puntaje.createMany({ data: nuevos });
}
