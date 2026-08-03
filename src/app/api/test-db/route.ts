import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const count = await prisma.usuario.count();
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre_completo: true,
        correo: true,
        activo: true,
        rol_id: true,
        password: true,
      },
      take: 50,
    });
    return NextResponse.json({
      success: true,
      dbStatus: "connected",
      totalUsuarios: count,
      usuarios: users.map((u) => ({
        id: u.id,
        nombre: u.nombre_completo,
        correo: u.correo,
        activo: u.activo,
        rol_id: u.rol_id,
        hasPassword: !!u.password,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, dbStatus: "error", error: error.message },
      { status: 500 }
    );
  }
}
