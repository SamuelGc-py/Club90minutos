import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from "@/lib/db";

const normalizeNombre = (str: string) =>
  (str || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/f\.c\.|fc|d\.a\.f\.|c\.d\./gi, "").trim();

// Respuesta de texto sin herramienta de búsqueda (el plan gratuito de Gemini no
// tiene cuota estable para "Google Search grounding"), usando solo el
// conocimiento entrenado del modelo.
const responderConIA = (ai: GoogleGenAI, contents: string) =>
  ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents,
  });

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'La consulta no puede estar vacía' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'El servicio de datos no está disponible en este momento.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Instrucción para el sistema: analizar la intención del usuario.
    const systemInstruction = `
Eres el "Asistente 90 Minutos", un experto en fútbol colombiano para la plataforma "Club 90 Minutos".
Tu tarea es analizar la consulta del usuario y devolver UNICAMENTE un objeto JSON con la siguiente estructura:
{
  "intent": "STANDINGS" | "SCOREBOARD" | "LINEUPS" | "PREDICTION" | "GENERAL",
  "equipoLocal": "Si el intent es LINEUPS y el usuario menciona un partido específico, el nombre del primer equipo. Si no, vacío.",
  "equipoVisitante": "Si el intent es LINEUPS y el usuario menciona un partido específico, el nombre del segundo equipo. Si no, vacío."
}

Reglas estrictas:
1. Si el usuario pide predicciones de partidos, marcadores futuros o pregunta quién va a ganar un partido ("¿quién gana?", "¿cuál va a ser el marcador?", "dame la predicción del partido X vs Y"), el intent es "PREDICTION".

2. Si el usuario pregunta por la tabla de posiciones, clasificación de la Liga BetPlay o quién va de primero, el intent es "STANDINGS".

3. Si el usuario pregunta por resultados de partidos, marcadores o partidos de la liga, el intent es "SCOREBOARD".

4. Si el usuario pregunta por alineaciones, posible once inicial o convocados de un partido específico, el intent es "LINEUPS", y extraes los nombres de los dos equipos del partido en "equipoLocal" y "equipoVisitante" (si solo menciona un equipo o ninguno, deja ambos campos vacíos).

5. Cualquier otra pregunta de fútbol (nóminas generales, historia, datos, curiosidades) es "GENERAL".

6. NUNCA devuelvas otra cosa que no sea el JSON puro (sin marcas de markdown).
    `;

    const clasificacion = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `${systemInstruction}\n\nConsulta del usuario: ${prompt}`,
      config: {
        responseMimeType: "application/json",
      },
    });
    const textResult = clasificacion.text || '';

    let aiResponse: any;
    try {
      aiResponse = JSON.parse(textResult);
    } catch (e) {
      console.error("Error parseando respuesta del asistente:", textResult);
      aiResponse = { intent: "GENERAL" };
    }

    if (aiResponse.intent === "PREDICTION") {
      return NextResponse.json({
        type: "GENERAL",
        title: "Mensaje Futbolero ⚽",
        data: { answer: "¡Un verdadero futbolero arma su propia predicción! Demuestra lo que sabes en la Polla Club 90 Minutos ⚽🔥" }
      });
    }

    // Tabla de posiciones: datos en vivo de ESPN (gratis, sin límite de cuota).
    if (aiResponse.intent === "STANDINGS") {
      try {
        const espnRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/standings");
        if (!espnRes.ok) throw new Error("Error consultando ESPN");
        const espnData = await espnRes.json();
        const entries = espnData?.children?.[0]?.standings?.entries;

        if (!Array.isArray(entries) || entries.length === 0) {
          return NextResponse.json({
            type: "GENERAL",
            title: "Tabla de Posiciones",
            data: { answer: "ESPN todavía no tiene publicada la tabla de posiciones de esta fase del torneo. Intenta de nuevo más adelante en la temporada." }
          });
        }

        return NextResponse.json({
          type: "STANDINGS",
          title: "Tabla de Posiciones Oficial — Liga BetPlay",
          data: espnData
        });
      } catch (e) {
        console.error("Error obteniendo tabla de posiciones de ESPN:", e);
        return NextResponse.json({
          type: "GENERAL",
          title: "Tabla de Posiciones",
          data: { answer: "No se pudo obtener la tabla de posiciones en este momento, intenta de nuevo en unos segundos." }
        });
      }
    }

    // Resultados/marcadores: ESPN en vivo (gratis) + nuestros resultados oficiales propios.
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

    // Alineaciones: primero se intenta con ESPN (si ya publicó la nómina/formación);
    // si no está disponible, se completa con lo que sepa la IA (sin búsqueda web).
    if (aiResponse.intent === "LINEUPS") {
      const equipoLocal = (aiResponse.equipoLocal || "").trim();
      const equipoVisitante = (aiResponse.equipoVisitante || "").trim();

      if (!equipoLocal && !equipoVisitante) {
        return NextResponse.json({
          type: "GENERAL",
          title: "Alineaciones",
          data: { answer: "Dime el partido específico (por ejemplo: \"alineación de Millonarios vs Nacional\") y busco la nómina confirmada o probable." }
        });
      }

      const equipoLocalNorm = normalizeNombre(equipoLocal);
      const equipoVisitanteNorm = normalizeNombre(equipoVisitante);

      let eventoEncontrado: any = null;
      try {
        const scoreboardRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard");
        if (scoreboardRes.ok) {
          const scoreboardData = await scoreboardRes.json();
          const events = scoreboardData.events || [];
          eventoEncontrado = events.find((event: any) => {
            const competition = event.competitions?.[0];
            const home = competition?.competitors?.find((c: any) => c.homeAway === "home");
            const away = competition?.competitors?.find((c: any) => c.homeAway === "away");
            if (!home || !away) return false;
            const homeNorm = normalizeNombre(home.team.name);
            const awayNorm = normalizeNombre(away.team.name);
            const matchLocal = !equipoLocalNorm || homeNorm.includes(equipoLocalNorm) || equipoLocalNorm.includes(homeNorm);
            const matchVisitante = !equipoVisitanteNorm || awayNorm.includes(equipoVisitanteNorm) || equipoVisitanteNorm.includes(awayNorm);
            return matchLocal && matchVisitante;
          });
        }
      } catch (e) {
        console.error("Error consultando ESPN Scoreboard para alineaciones:", e);
      }

      if (eventoEncontrado) {
        try {
          const summaryRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/summary?event=${eventoEncontrado.id}`);
          if (summaryRes.ok) {
            const summaryData = await summaryRes.json();
            const rosters = summaryData.rosters;
            if (Array.isArray(rosters) && rosters.length > 0) {
              return NextResponse.json({
                type: "LINEUPS",
                title: `Alineaciones — ${eventoEncontrado.name || eventoEncontrado.shortName || ""}`,
                data: { rosters, evento: eventoEncontrado },
              });
            }
          }
        } catch (e) {
          console.error("Error consultando ESPN Summary para alineaciones:", e);
        }
      }

      // Respaldo: ESPN no tiene la nómina todavía (o no se encontró el partido).
      let textoAlineacion = "Todavía no hay alineación publicada para este partido. Intenta de nuevo más cerca de la hora del partido.";
      try {
        const respuesta = await responderConIA(
          ai,
          `¿Cuál es la alineación/once inicial habitual o más probable para "${equipoLocal} vs ${equipoVisitante}" de la Liga BetPlay Dimayor de Colombia, según lo que sepas?
Aclara que esto es una referencia, no la alineación confirmada oficial (que aún no está publicada), y que puede no reflejar cambios recientes.
Responde en español, organizado por equipo.`
        );
        textoAlineacion = respuesta.text || textoAlineacion;
      } catch (e) {
        console.error("Error generando alineación de respaldo:", e);
      }

      return NextResponse.json({
        type: "GENERAL",
        title: `Alineaciones — ${equipoLocal} vs ${equipoVisitante}`,
        data: { answer: textoAlineacion },
      });
    }

    // GENERAL: cualquier otra pregunta de fútbol, respondida con el conocimiento del modelo.
    let textoGeneral = "No se pudo generar una respuesta en este momento, intenta de nuevo.";
    try {
      const respuesta = await responderConIA(
        ai,
        `Eres un experto en fútbol colombiano para la plataforma "Club 90 Minutos". Responde en español, de forma completa y bien redactada.\n\nConsulta del usuario: ${prompt}`
      );
      textoGeneral = respuesta.text || textoGeneral;
    } catch (e) {
      console.error("Error generando respuesta general:", e);
    }

    return NextResponse.json({
      type: "GENERAL",
      title: "Análisis Deportivo",
      data: { answer: textoGeneral }
    });

  } catch (error: any) {
    console.error('Error en la Central de Datos:', error);
    return NextResponse.json({ error: 'No se pudo procesar la consulta, intenta de nuevo.' }, { status: 500 });
  }
}
