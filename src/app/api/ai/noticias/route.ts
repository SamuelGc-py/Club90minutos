import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const p1 = searchParams.get("p1") || "Líder";
  const p2 = searchParams.get("p2") || "Segundo";
  const p3 = searchParams.get("p3") || "Tercero";

  // Aquí defines los chistes base UNA SOLA VEZ.
  // Si quieres cambiarlos, solo los editas en esta lista y aplicará para todo.
  const chistesBase = [
    "📺 NOTICIERO 90 MINUTOS: ¡BIENVENIDO AL JUEGO MÁS ADICTIVO DE TODO FUTBOLERO! ⚽",
    `🥇 ¡ATENCIÓN! ${p1} ESTÁ BIEN ARRIBA DANDO BATE, LOS TIENE A TODOS MAMANDO... CABLE. 🤣`,
    `🥈 OJO CON ${p2} QUE LE ESTÁ SOPLANDO LA NUCA A ${p1}. ¡CUIDADO SE ENAMORAN! 👀`,
    `🥉 ${p3} ESTÁ CALLADITO DE TERCERO ESPERANDO EL PAPAYAZO PA' METERLA... LA PREDICCIÓN. 🔥`
  ];

  return NextResponse.json({ frases: chistesBase });
}
