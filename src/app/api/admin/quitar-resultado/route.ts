import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requerirAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Identidad tomada de la cookie de sesión, nunca del body (ver src/lib/auth.ts).
    const auth = await requerirAdmin(req);
    if (auth.error) return auth.error;
    const { usuario_id: _usuarioIdDelCliente, partido_id } = await req.json();
    const usuario_id = auth.sesion.usuarioId;

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

    // Restaurar eliminación automática de puntos para que la tabla baje en tiempo real
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
