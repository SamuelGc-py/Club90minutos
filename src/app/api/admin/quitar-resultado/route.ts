import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { usuario_id, partido_id } = await req.json();

    if (!usuario_id || !partido_id) {
      return NextResponse.json({ error: "Faltan datos requeridos (usuario_id, partido_id)" }, { status: 400 });
    }

    const admin = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
      include: { rol: true },
    });

    if (!admin || admin.rol.nombre !== "administrador") {
      return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });
    }

    const idPartido = Number(partido_id);

    const resultadoOficial = await prisma.resultadoOficial.findUnique({
      where: { partido_id: idPartido },
    });

    await prisma.puntaje.deleteMany({ where: { partido_id: idPartido } });

    if (resultadoOficial) {
      await prisma.resultadoGoleador.deleteMany({ where: { resultado_oficial_id: resultadoOficial.id } });
      await prisma.resultadoOficial.delete({ where: { id: resultadoOficial.id } });
    }

    await prisma.partido.update({
      where: { id: idPartido },
      data: { estado: "programado" },
    });

    return NextResponse.json({
      exito: true,
      mensaje: "Resultado oficial y puntos liquidados fueron eliminados. El partido vuelve a estado 'programado'.",
    });
  } catch (error: any) {
    console.error("Error al quitar resultado:", error);
    return NextResponse.json({ error: error.message || "Error al quitar el resultado" }, { status: 500 });
  }
}
