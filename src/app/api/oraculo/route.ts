import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from "@/lib/db";

// Instanciar el cliente de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'La consulta no puede estar vacía' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Falta la API Key de Gemini en las variables de entorno' }, { status: 500 });
    }

    const modelName = 'gemini-3.6-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    // Instrucción para el sistema: analizar la intención del usuario.
    const systemInstruction = `
Eres el "Asistente 90 Minutos", un experto en fútbol colombiano para la plataforma "Club 90 Minutos".
Tu tarea es analizar la consulta del usuario y devolver UNICAMENTE un objeto JSON con la siguiente estructura:
{
  "intent": "STANDINGS" | "SCOREBOARD" | "PREDICTION" | "GENERAL",
  "response": "Si el intent es GENERAL o PREDICTION, aquí va tu respuesta. Si no, deja este campo vacío."
}

Reglas estrictas:
1. Si el usuario pide predicciones de partidos, marcadores futuros o pregunta quién va a ganar un partido ("¿quién gana?", "¿cuál va a ser el marcador?", "dame la predicción del partido X vs Y"), el intent es "PREDICTION" y tu respuesta en "response" DEBE SER EXACTAMENTE:
"Un verdadero futbolero no buscaría resultados ni marcadores con la IA. ¡Demuestra lo que sabes en la Polla Club 90 Minutos! ⚽🔥"

2. Si el usuario pregunta por la tabla de posiciones, clasificación de la Liga BetPlay o quién va de primero, el intent es "STANDINGS".

3. Si el usuario pregunta por resultados de partidos, marcadores o partidos de la liga, el intent es "SCOREBOARD".

4. Si pregunta por posibles alineaciones, nóminas, historia, datos o curiosidades del fútbol, el intent es "GENERAL" y debes darle una respuesta completa y bien redactada en "response".

5. NUNCA devuelvas otra cosa que no sea el JSON puro (sin marcas de markdown).
    `;

    const result = await model.generateContent(`${systemInstruction}\n\nConsulta del usuario: ${prompt}`);
    const textResult = result.response.text();
    
    // Limpiar posible formato markdown que devuelva el modelo
    const cleanedJsonText = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanedJsonText);
    } catch (e) {
      console.error("Error parseando respuesta de Gemini:", textResult);
      aiResponse = { intent: "GENERAL", response: textResult };
    }

    if (aiResponse.intent === "PREDICTION") {
      return NextResponse.json({
        type: "GENERAL",
        title: "Mensaje Futbolero ⚽",
        data: { answer: aiResponse.response || "Un verdadero futbolero no buscaría resultados ni marcadores con la IA. ¡Demuestra lo que sabes en la Polla Club 90 Minutos! ⚽🔥" }
      });
    }

    // Procesar la acción basada en el intent
    if (aiResponse.intent === "STANDINGS") {
      const espnRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/standings");
      if (!espnRes.ok) throw new Error("Error fetching standings from ESPN");
      const espnData = await espnRes.json();
      
      return NextResponse.json({ 
        type: "STANDINGS",
        title: "Tabla de Posiciones Oficial - Liga BetPlay",
        data: espnData 
      });
    }

    if (aiResponse.intent === "SCOREBOARD") {
      let espnEvents: any[] = [];
      try {
        const espnRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard");
        if (espnRes.ok) {
          const espnData = await espnRes.json();
          espnEvents = espnData.events || [];
        }
      } catch (e) {
        console.error("Error consultando ESPN Scoreboard:", e);
      }

      // También traer los últimos partidos finalizados con marcador de la base de datos de Club 90 Minutos
      let dbPartidos: any[] = [];
      try {
        dbPartidos = await prisma.partido.findMany({
          where: {
            estado: { in: ["resultado_cargado", "puntaje_calculado"] }
          },
          include: {
            equipo_local: true,
            equipo_visitante: true,
            resultado_oficial: {
              include: {
                goleadores: {
                  include: {
                    jugador: true
                  }
                }
              }
            }
          },
          orderBy: { fecha_hora_partido: "desc" },
          take: 10,
        });
      } catch (e) {
        console.error("Error consultando DB partidos:", e);
      }
      
      return NextResponse.json({ 
        type: "SCOREBOARD", 
        title: "Resultados y Marcadores",
        data: {
          espnEvents,
          dbPartidos,
        } 
      });
    }

    return NextResponse.json({
      type: "GENERAL",
      title: "Análisis Deportivo IA",
      data: { answer: aiResponse.response }
    });

  } catch (error: any) {
    console.error('Error en el Oráculo:', error);
    return NextResponse.json({ error: error.message || 'Error procesando la solicitud' }, { status: 500 });
  }
}
