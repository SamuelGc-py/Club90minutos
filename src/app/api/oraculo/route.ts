import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Instrucción para el sistema: analizar la intención del usuario.
    const systemInstruction = `
Eres el "Oráculo 90 Minutos", un asistente de IA experto en fútbol colombiano para la plataforma "Club 90 Minutos".
Tu tarea es analizar la consulta del usuario y devolver UNICAMENTE un objeto JSON con la siguiente estructura:
{
  "intent": "STANDINGS" | "SCOREBOARD" | "GENERAL",
  "response": "Si el intent es GENERAL, aquí va tu respuesta directa a la pregunta. Si no, deja este campo vacío."
}

Reglas:
- Si el usuario pregunta por la tabla de posiciones, clasificación, o quién va de primero, el intent es "STANDINGS".
- Si el usuario pregunta por resultados de partidos, marcadores o partidos de hoy, el intent es "SCOREBOARD".
- Si pregunta por posibles alineaciones, historia, curiosidades o cualquier otra cosa de fútbol, el intent es "GENERAL" y debes darle la respuesta detallada en el campo "response" (puedes usar tu conocimiento de IA).
- NUNCA devuelvas otra cosa que no sea el JSON puro (sin marcas de markdown).
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

    // Procesar la acción basada en el intent
    if (aiResponse.intent === "STANDINGS") {
      const espnRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/standings");
      if (!espnRes.ok) throw new Error("Error fetching standings from ESPN");
      const espnData = await espnRes.json();
      
      return NextResponse.json({ 
        type: "STANDINGS",
        title: "Tabla de Posiciones",
        data: espnData 
      });
    }

    if (aiResponse.intent === "SCOREBOARD") {
      const espnRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard");
      if (!espnRes.ok) throw new Error("Error fetching scoreboard from ESPN");
      const espnData = await espnRes.json();
      
      return NextResponse.json({ 
        type: "SCOREBOARD", 
        title: "Resultados y Marcadores",
        data: espnData 
      });
    }

    return NextResponse.json({
      type: "GENERAL",
      title: "Respuesta del Oráculo",
      data: { answer: aiResponse.response }
    });

  } catch (error: any) {
    console.error('Error en el Oráculo:', error);
    return NextResponse.json({ error: error.message || 'Error procesando la solicitud' }, { status: 500 });
  }
}
