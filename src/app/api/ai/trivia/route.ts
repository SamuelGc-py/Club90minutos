import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const CATEGORIAS = [
  "campeones históricos y finales memorables de la Categoría Primera A / Liga BetPlay",
  "goleadores y récords individuales del Fútbol Profesional Colombiano, más allá del máximo goleador histórico",
  "la Selección Colombia en Eliminatorias y Copas del Mundo",
  "clásicos y rivalidades entre equipos colombianos",
  "jugadores colombianos destacados en ligas del exterior",
  "estadios, hinchadas y datos curiosos del fútbol colombiano",
  "técnicos y estrategas emblemáticos del FPC",
  "actuaciones de equipos colombianos en Copa Libertadores y Sudamericana",
];

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("Trivia: falta configurar la API key del proveedor.");
      return NextResponse.json(
        { error: "El generador de preguntas no está disponible en este momento." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const categoria = CATEGORIAS[Math.floor(Math.random() * CATEGORIAS.length)];

    const prompt = `Actúa como el anfitrión experto de una Trivia sobre el Fútbol Profesional Colombiano (FPC). 
Dirígete al usuario usando un tono "costeño neutral" (colombiano de la costa Caribe, como de Barranquilla o Santa Marta, pero sin usar lenguaje "corroncho" ni groserías). Evita frases genéricas de otras regiones o acentos muy marcados de Medellín o Bogotá. 

Genera UNA pregunta de opción múltiple sobre este tema específico: ${categoria}.

Reglas obligatorias:
- La pregunta debe ser nacionalizada, abarcando TODO el FPC.
- La pregunta debe girar en torno a un hecho concreto y verificable.
- No repitas preguntas típicas de manual.
- Dificultad media.
- EXTREMADAMENTE BREVE: La pregunta debe ir directo al grano (máximo 15-20 palabras). No incluyas saludos ni frases de relleno, solo la pregunta de trivia con algo del acento.
- Las 4 opciones deben ser cortas (nombres, años, equipos).

Devuelve tu respuesta ÚNICAMENTE en formato JSON estricto con esta estructura:
{
  "pregunta": "Texto de la pregunta usando el tono costeño neutral amigable y sabroso",
  "opciones": [
    "Opcion A",
    "Opcion B",
    "Opcion C",
    "Opcion D"
  ],
  "respuesta_correcta_index": numero_del_0_al_3,
  "dato_curioso": "Un dato corto, concreto y curioso sobre la respuesta correcta para mostrar cuando el usuario acierte o falle, usando el mismo tono costeño neutral"
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 1, // Para mayor variedad entre preguntas
        }
    });

    const result = JSON.parse(response.text || '{}');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error generando trivia:", error);
    return NextResponse.json({ error: "No se pudo generar la pregunta, intenta de nuevo." }, { status: 500 });
  }
}
