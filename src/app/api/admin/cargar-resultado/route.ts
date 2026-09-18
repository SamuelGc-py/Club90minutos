import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calcularPuntosPartido } from "@/lib/calculadorPuntos";
import { generarBackupAutomatico } from "@/lib/backupAuto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { usuario_id, partido_id, goles_local, goles_visitante, goleador_jugador_id, goleadores_ids } = await req.json();

    if (!usuario_id || !partido_id || goles_local === undefined || goles_visitante === undefined) {
      return NextResponse.json({ error: "Faltan datos requeridos (usuario_id, partido_id, goles)" }, { status: 400 });
    }

    // Verificar permisos de administrador
    const admin = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
      include: { rol: true },
    });

    if (!admin || admin.rol.nombre !== "administrador") {
      return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });
    }

    // Generar respaldo automático previo a la liquidación del partido
    await generarBackupAutomatico(Number(partido_id), "Respaldo automático previo a liquidar puntos de partido");

    const idsGoleadores: number[] = Array.isArray(goleadores_ids)
      ? goleadores_ids.map((id: any) => Number(id)).filter(Boolean)
      : goleador_jugador_id
      ? [Number(goleador_jugador_id)]
      : [];

    // El equipo ganador lo determina el propio motor a partir del marcador.

    // El resultado oficial, los goleadores, el estado del partido y los puntajes los
    // escribe calcularPuntosPartido en UNA sola transacción. Antes esta ruta borraba y
    // recreaba los goleadores por su cuenta, fuera de la transacción: si el proceso moría
    // en medio, el partido quedaba sin goleadores. Además ese borrado previo anulaba la
    // protección del motor contra listas vacías.
    //
    // Si el admin no envía ninguna lista de goleadores, se pasa `undefined` para
    // PRESERVAR los que ya estén guardados en vez de borrarlos silenciosamente.
    const seEnvioListaGoleadores =
      Array.isArray(goleadores_ids) || goleador_jugador_id !== undefined;
    const goleadoresParaLiquidar = seEnvioListaGoleadores ? idsGoleadores : undefined;

    const resultado = await calcularPuntosPartido(
      Number(partido_id),
      Number(goles_local),
      Number(goles_visitante),
      goleadoresParaLiquidar,
      Number(usuario_id),
      // El admin sí puede dejar un partido sin goleadores a propósito (ej. corregir a 0-0),
      // siempre que haya enviado explícitamente una lista vacía.
      { forzarVaciarGoleadores: seEnvioListaGoleadores }
    );

    return NextResponse.json({
      exito: true,
      mensaje: `Resultado oficial guardado y puntos calculados para ${resultado.totalPrediccionesLiquidadas} participantes.`,
      advertencias: resultado.advertencias,
    });
  } catch (error: any) {
    console.error("Error al cargar resultado oficial:", error);
    return NextResponse.json({ error: error.message || "Error al procesar resultado" }, { status: 500 });
  }
}
