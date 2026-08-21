import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API Key de Gemini no configurada." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Actúa como el anfitrión de una Trivia sobre el Fútbol Profesional Colombiano (Liga BetPlay, historia, Selección Colombia, jugadores icónicos).
Genera una pregunta aleatoria de opción múltiple que sea interesante (no demasiado fácil, pero tampoco imposible).

Devuelve tu respuesta ÚNICAMENTE en formato JSON estricto con esta estructura:
{
  "pregunta": "Texto de la pregunta",
  "opciones": [
    "Opcion A",
    "Opcion B",
    "Opcion C",
    "Opcion D"
  ],
  "respuesta_correcta_index": numero_del_0_al_3,
  "dato_curioso": "Un dato corto y curioso sobre la respuesta correcta para mostrar cuando el usuario acierte o falle"
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.9, // Para mayor aleatoriedad en las preguntas
        }
    });

    const result = JSON.parse(response.text || '{}');
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error en Trivia IA:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
