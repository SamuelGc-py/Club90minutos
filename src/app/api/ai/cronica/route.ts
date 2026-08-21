import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API Key de Gemini no configurada." },
        { status: 500 }
      );
    }

    const { tablaPosiciones } = await req.json();

    if (!tablaPosiciones || !Array.isArray(tablaPosiciones)) {
       return NextResponse.json({ error: "Faltan datos de la tabla de posiciones." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Solo pasamos el top 5 y el último para no gastar tantos tokens
    const top5 = tablaPosiciones.slice(0, 5);
    const ultimo = tablaPosiciones.length > 5 ? tablaPosiciones[tablaPosiciones.length - 1] : null;
    
    let datosTabla = "Top 5:\n" + top5.map((p, i) => `${i+1}. ${p.nombre} (${p.puntosTotales} pts)`).join("\n");
    if (ultimo) {
        datosTabla += `\n\nY de último lugar (el fantasma): ${ultimo.nombre} (${ultimo.puntosTotales} pts)`;
    }

    const prompt = `Eres el "Pollo Periodista", un reportero deportivo de la Club 90 Minutos con mucho humor y sarcasmo colombiano.
Se acaba de terminar una jornada (o estamos en medio de ella) y esta es la situación actual de la tabla de posiciones de nuestro grupo de amigos:

${datosTabla}

Tu trabajo es redactar una crónica deportiva corta (2 o 3 párrafos como si fuera un periódico deportivo sensacionalista).
Debes felicitar con exageración al líder, burlarte sanamente del que va de último, y dar un cierre motivacional o chistoso.

Devuelve tu respuesta ÚNICAMENTE en formato JSON estricto con esta estructura:
{
  "titular": "Titular amarillista y gracioso",
  "cuerpo_noticia": "El desarrollo de la crónica..."
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const result = JSON.parse(response.text || '{}');
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error en Crónica IA:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
