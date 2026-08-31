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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nivel = searchParams.get("nivel") || "1";
    if (!process.env.GEMINI_API_KEY) {
      console.error("Trivia: falta configurar la API key del proveedor.");
      return NextResponse.json(
        { error: "El generador de preguntas no está disponible en este momento." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const categoria = CATEGORIAS[Math.floor(Math.random() * CATEGORIAS.length)];

    const seed = Math.random().toString(36).substring(7);

    const prompt = `Actúa como un experto en Trivias sobre el Fútbol Profesional Colombiano (FPC).
Genera UNA pregunta de opción múltiple sobre este tema específico: ${categoria}.
Semilla aleatoria (nunca repitas si es diferente): ${seed}.

Reglas obligatorias:
- Nivel actual del jugador: ${nivel} (a mayor nivel, busca un dato un poco más difícil o rebuscado).
- La pregunta debe ser nacionalizada, abarcando TODO el FPC.
- La pregunta debe girar en torno a un hecho concreto y verificable.
- NUNCA repitas preguntas típicas de manual.
- EXTREMADAMENTE BREVE Y DIRECTA: La pregunta debe ir directo al grano (máximo 15-20 palabras). NO incluyas saludos, NO uses dialectos regionales (costeño, paisa, rolo), NO pongas frases de relleno. Solo haz la pregunta pura y dura.
- Las 4 opciones deben ser cortas (nombres, años, equipos).

Devuelve tu respuesta ÚNICAMENTE en formato JSON estricto con esta estructura:
{
  "pregunta": "Texto de la pregunta, directo y al grano sin saludos",
  "opciones": [
    "Opcion A",
    "Opcion B",
    "Opcion C",
    "Opcion D"
  ],
  "respuesta_correcta_index": numero_del_0_al_3,
  "dato_curioso_acierto": "Mensaje corto felicitando por acertar (ej. '¡Correcto!'), seguido de una pequeña curiosidad.",
  "dato_curioso_fallo": "Mensaje corto indicando el error (ej. 'Fallaste, la respuesta era X.'), seguido de la misma curiosidad."
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
