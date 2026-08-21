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

    const { partidoLocal, partidoVisitante, fase, jornada } = await req.json();

    if (!partidoLocal || !partidoVisitante) {
       return NextResponse.json({ error: "Faltan datos del partido." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Eres el "Oráculo de la Club 90 Minutos", un experto en el fútbol profesional colombiano con un tono humorístico, sarcástico y picante, muy al estilo colombiano.
Vas a analizar el partido: ${partidoLocal} vs ${partidoVisitante} (Fase: ${fase || 'Regular'}, Jornada: ${jornada || 'N/A'}).

Haz un breve análisis (1 o 2 párrafos cortos máximo), menciona de forma graciosa cómo vienen los equipos, lanza un chiste futbolero y al final da tu predicción exacta de resultado.

Devuelve tu respuesta ÚNICAMENTE en formato JSON estricto con esta estructura (sin backticks ni markdown):
{
  "analisis": "tu texto de análisis y chiste",
  "prediccion_local": numero,
  "prediccion_visitante": numero
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
    console.error("Error en Oráculo IA:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
