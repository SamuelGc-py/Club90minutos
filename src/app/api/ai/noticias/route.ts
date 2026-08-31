import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const p1 = searchParams.get("p1") || "Líder";
    const p2 = searchParams.get("p2") || "Segundo";
    const p3 = searchParams.get("p3") || "Tercero";

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ frases: [
        "📺 NOTICIERO 90 MINUTOS: ¡BIENVENIDO A LA POLLA MÁS SABROSA DE COLOMBIA!",
        `🥇 ¡ATENCIÓN! ${p1} ESTÁ BIEN ARRIBA DANDO BATE, LOS TIENE A TODOS MAMANDO... RUEDA. 🤣`,
        `🥈 OJO CON ${p2} QUE LE ESTÁ SOPLANDO LA NUCA A ${p1}. ¡CUIDADO SE ENAMORAN! 👀`,
        `🥉 ${p3} ESTÁ CALLADITO DE TERCERO ESPERANDO EL PAPAYAZO PA' METERLA... LA PREDICCIÓN. 🔥`
      ] });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Eres el locutor chistoso de "Noticiero 90 Minutos", un noticiero deportivo de una plataforma de predicciones de fútbol (Polla) en Colombia.
Tu estilo es totalmente costeño (Barranquilla/Cartagena), relajado, exagerado, con mucho humor, doble sentido (sin ser vulgar ni grosero en exceso), burlón y picante.

El estado actual de la tabla de posiciones es:
1er lugar: ${p1}
2do lugar: ${p2}
3er lugar: ${p3}

Genera un JSON con un arreglo llamado "frases" que contenga 6 mensajes cortos (máximo 15 palabras cada uno) para pasar en el banner rotativo de la página principal.
Las frases deben burlarse de cómo van en la tabla, de la presión de ir de primero, del que va de segundo respirándole en la nuca, y del tercero esperando el papayazo. Usa emojis en cada frase. 

Usa expresiones costeñas como "mamando ron", "dando bate", "soplando la nuca", "coronando", "más montado que...", etc.

ESTRUCTURA DE RESPUESTA ÚNICAMENTE JSON:
{
  "frases": [
    "Frase 1",
    "Frase 2",
    "Frase 3",
    "Frase 4",
    "Frase 5",
    "Frase 6"
  ]
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.9,
        }
    });

    const rawText = response.text || '{}';
    const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);

    // Siempre agregar una frase informativa
    if (result.frases && Array.isArray(result.frases)) {
        result.frases.unshift("📺 NOTICIERO 90 MINUTOS: ¡BIENVENIDO A LA POLLA MÁS SABROSA DE COLOMBIA! ⚽");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error generando frases:", error);
    return NextResponse.json({ frases: [
        "📺 NOTICIERO 90 MINUTOS: ¡BIENVENIDO A LA POLLA MÁS SABROSA DE COLOMBIA!",
        "🔥 LA TABLA ESTÁ QUE ARDE, REVISA TUS PRONÓSTICOS."
    ] });
  }
}
