"use client";

import React, { useState } from "react";
import { BrainCircuit, Search, Trophy, Calendar, Users, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

export default function CentralDatosView() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<{ tipo: string; titulo: string; contenido: any } | null>(null);

  const enviarConsulta = async (textoConsulta: string) => {
    if (!textoConsulta.trim()) return;
    
    setLoading(true);
    setRespuesta(null);
    setPrompt(""); // Limpiar input si fue escrito manualmente

    try {
      const res = await fetch("/api/oraculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textoConsulta }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error consultando la Central de Datos");
      }

      setRespuesta({
        tipo: data.type,
        titulo: data.title,
        contenido: data.data,
      });

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContenido = () => {
    if (!respuesta) return null;

    if (respuesta.tipo === "GENERAL") {
      return (
        <div className="prose prose-invert max-w-none bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <ReactMarkdown>{respuesta.contenido.answer || ""}</ReactMarkdown>
        </div>
      );
    }

    if (respuesta.tipo === "STANDINGS") {
      // Intentar renderizar la estructura típica de ESPN para Standings
      const entries = respuesta.contenido?.children?.[0]?.standings?.entries;
      if (entries && Array.isArray(entries)) {
        return (
          <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Pos</th>
                  <th className="px-4 py-3">Equipo</th>
                  <th className="px-4 py-3 text-center">PTS</th>
                  <th className="px-4 py-3 text-center">PJ</th>
                  <th className="px-4 py-3 text-center">PG</th>
                  <th className="px-4 py-3 text-center">PE</th>
                  <th className="px-4 py-3 text-center">PP</th>
                  <th className="px-4 py-3 text-center">GF</th>
                  <th className="px-4 py-3 text-center">GC</th>
                  <th className="px-4 py-3 text-center">DIF</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: any, index: number) => {
                  const team = entry.team;
                  const stats = entry.stats.reduce((acc: any, stat: any) => {
                     acc[stat.name] = stat.value;
                     return acc;
                  }, {});
                  
                  return (
                    <tr key={team.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-bold">{index + 1}</td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        {team.logos?.[0]?.href && (
                          <img src={team.logos[0].href} alt={team.displayName} className="w-6 h-6 object-contain" />
                        )}
                        <span className="font-semibold">{team.displayName}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-400">{stats.points}</td>
                      <td className="px-4 py-3 text-center">{stats.gamesPlayed}</td>
                      <td className="px-4 py-3 text-center">{stats.wins}</td>
                      <td className="px-4 py-3 text-center">{stats.ties}</td>
                      <td className="px-4 py-3 text-center">{stats.losses}</td>
                      <td className="px-4 py-3 text-center">{stats.pointsFor}</td>
                      <td className="px-4 py-3 text-center">{stats.pointsAgainst}</td>
                      <td className="px-4 py-3 text-center">{stats.pointDifferential}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      return (
        <pre className="bg-slate-900 p-4 rounded-xl overflow-x-auto text-xs text-slate-300">
          {JSON.stringify(respuesta.contenido, null, 2)}
        </pre>
      );
    }

    if (respuesta.tipo === "SCOREBOARD") {
      const events = respuesta.contenido?.events;
      if (events && Array.isArray(events)) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evento: any) => {
              const comp = evento.competitions[0];
              const local = comp.competitors.find((c: any) => c.homeAway === "home");
              const away = comp.competitors.find((c: any) => c.homeAway === "away");
              
              return (
                <div key={evento.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col gap-3">
                  <div className="text-xs text-center text-slate-400 font-semibold uppercase">
                    {evento.status.type.detail}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-center gap-2 w-1/3">
                      {local?.team?.logo && <img src={local.team.logo} alt="local" className="w-10 h-10 object-contain" />}
                      <span className="text-xs text-center font-bold">{local?.team?.shortDisplayName}</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-400 w-1/3 text-center">
                      {local?.score} - {away?.score}
                    </div>
                    <div className="flex flex-col items-center gap-2 w-1/3">
                      {away?.team?.logo && <img src={away.team.logo} alt="away" className="w-10 h-10 object-contain" />}
                      <span className="text-xs text-center font-bold">{away?.team?.shortDisplayName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      return (
        <pre className="bg-slate-900 p-4 rounded-xl overflow-x-auto text-xs text-slate-300">
          {JSON.stringify(respuesta.contenido, null, 2)}
        </pre>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 pb-24 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-fuchsia-500/20 rounded-xl">
          <BrainCircuit className="text-fuchsia-400" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white m-0">Central de Datos</h2>
          <p className="text-slate-400 text-sm m-0">Estadísticas, posibles 11 y análisis con IA</p>
        </div>
      </div>

      {/* Botones de Acción Rápida */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => enviarConsulta("Muéstrame la tabla de posiciones actual de la liga colombiana")}
          className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
        >
          <Trophy className="text-emerald-400" size={24} />
          <span className="text-sm font-semibold text-center">Tabla de Posiciones</span>
        </button>
        <button
          onClick={() => enviarConsulta("Cuáles son los resultados de los partidos de hoy en colombia")}
          className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
        >
          <Calendar className="text-blue-400" size={24} />
          <span className="text-sm font-semibold text-center">Últimos Resultados</span>
        </button>
        <button
          onClick={() => enviarConsulta("Dime las posibles alineaciones para los partidos más importantes de esta jornada en Colombia")}
          className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
        >
          <Users className="text-fuchsia-400" size={24} />
          <span className="text-sm font-semibold text-center">Posibles Alineaciones</span>
        </button>
        <button
          onClick={() => enviarConsulta("Quiénes son los actuales goleadores de la liga colombiana")}
          className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
        >
          <Search className="text-amber-400" size={24} />
          <span className="text-sm font-semibold text-center">Goleadores</span>
        </button>
      </div>

      {/* Buscador libre */}
      <div className="relative mt-6">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarConsulta(prompt)}
          placeholder="Pregúntale a la IA sobre un equipo, jugador o partido..."
          className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-5 pr-14 text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all"
        />
        <button
          onClick={() => enviarConsulta(prompt)}
          disabled={loading || !prompt.trim()}
          className="absolute right-2 top-2 p-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>

      {/* Área de Resultados */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="animate-spin text-fuchsia-500" size={40} />
          <p className="text-slate-400 animate-pulse">Analizando datos y contactando al oráculo...</p>
        </div>
      ) : respuesta ? (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="text-fuchsia-400" size={24} />
            {respuesta.titulo}
          </h3>
          {renderContenido()}
        </div>
      ) : null}
    </div>
  );
}
