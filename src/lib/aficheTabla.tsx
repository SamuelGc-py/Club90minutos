import React from "react"; // necesario para el JSX fuera de Next (scripts con tsx)
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { rankingGeneral, tablaDesdePuntajes, ganadorUltimaFechaCerrada } from "@/app/components/c90/ranking";
import { unirNombres } from "@/app/components/c90/formato";

/**
 * AFICHE DE LA TABLA DE POSICIONES (PNG, generado en el servidor)
 * ===============================================================
 * 1080 × 1350 (vertical, se ve completo en WhatsApp). Colores y tipografías del manual.
 * Mismos datos y desempates que /api/consolidados.
 */

const CORREOS_EXCLUIDOS = ["adminpollabetplay@gmail.com", "prueba.admin@pollabetplay.com", "pruebas@pollabetplay.com", "prueba@gmail.com", "PRUEBA@GMAIL.COM"];

const C = {
  verde: "#74CC10",
  negro: "#04060A",
  blanco: "#FFFFFF",
  grisOscuro: "#1A1F26",
  grisMedio: "#6B7280",
  grisClaro: "#E5E7EB",
  amarillo: "#EFCC36",
  rojo: "#EA3D35",
};

// Fuentes: se descargan una vez de Google Fonts en TTF (satori no lee woff2).
const cacheFuentes = new Map<string, Promise<ArrayBuffer | null>>();
function fuente(familia: string, peso: number): Promise<ArrayBuffer | null> {
  const k = `${familia}:${peso}`;
  if (!cacheFuentes.has(k)) {
    cacheFuentes.set(
      k,
      (async () => {
        try {
          const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${familia.replace(/ /g, "+")}:wght@${peso}`, { cache: "no-store" })).text();
          const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
          if (!url) return null;
          return await (await fetch(url, { cache: "no-store" })).arrayBuffer();
        } catch {
          return null;
        }
      })()
    );
  }
  return cacheFuentes.get(k)!;
}

export interface DatosAfiche {
  filas: { posicion: number; nombre: string; pts: number; dif: number; movimiento: number | null }[];
  subtitulo: string;
  ganadorFecha: { fecha: number; nombres: string[]; pts: number } | null;
}

export async function datosAfiche(subtitulo?: string): Promise<DatosAfiche> {
  const [usuarios, puntajes, partidos] = await Promise.all([
    prisma.usuario.findMany({
      where: { activo: true, NOT: [{ correo: { in: CORREOS_EXCLUIDOS } }, { correo: { endsWith: "@test.local" } }] },
      select: { id: true, nombre_completo: true },
    }),
    prisma.puntaje.findMany({ select: { usuario_id: true, categoria: true, partido_id: true, puntos_obtenidos: true } }),
    prisma.partido.findMany({ select: { id: true, jornada: true, jornada_original: true, estado: true } }),
  ]);
  const base = usuarios.map((u) => ({ usuario_id: u.id, nombre_completo: u.nombre_completo }));
  const tabla = tablaDesdePuntajes(base, puntajes as any);
  const ranking = rankingGeneral(tabla, puntajes as any, partidos);
  const g = ganadorUltimaFechaCerrada(tabla, puntajes as any, partidos as any);
  const ganadorFecha: DatosAfiche["ganadorFecha"] = g ? { fecha: g.fecha, nombres: g.nombres, pts: g.pts } : null;
  const hoy = new Date().toLocaleDateString("es-CO", { timeZone: "America/Bogota", day: "numeric", month: "long", year: "numeric" });
  return {
    filas: ranking.map((f) => ({ posicion: f.posicion, nombre: f.nombre_completo, pts: f.pts_total, dif: f.distanciaLider, movimiento: f.movimiento })),
    subtitulo: subtitulo || `Actualizada el ${hoy}`,
    ganadorFecha,
  };
}

export async function generarAficheTabla(subtitulo?: string): Promise<Buffer> {
  const d = await datosAfiche(subtitulo);
  const filas = d.filas.slice(0, 20);
  const alto = 1350;
  const altoFila = Math.min(50, Math.floor((d.ganadorFecha ? 640 : 760) / Math.max(filas.length, 1)));

  const [orbitron, inter, interBold, mono] = await Promise.all([
    fuente("Orbitron", 800),
    fuente("Inter", 500),
    fuente("Inter", 700),
    fuente("JetBrains Mono", 600),
  ]);
  const fonts = [
    orbitron && { name: "Orbitron", data: orbitron, weight: 800 as const, style: "normal" as const },
    inter && { name: "Inter", data: inter, weight: 500 as const, style: "normal" as const },
    interBold && { name: "Inter", data: interBold, weight: 700 as const, style: "normal" as const },
    mono && { name: "JetBrains Mono", data: mono, weight: 600 as const, style: "normal" as const },
  ].filter(Boolean) as any[];

  const display = orbitron ? "Orbitron" : "Inter";
  const monoF = mono ? "JetBrains Mono" : "Inter";

  const imagen = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.negro, color: C.blanco, padding: "64px 72px", fontFamily: "Inter" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontFamily: display, fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>
            CLUB<span style={{ color: C.verde }}>90</span>
          </div>
          <div style={{ display: "flex", fontFamily: monoF, fontSize: 22, color: C.grisClaro, letterSpacing: 3 }}>LIGA BETPLAY 2026-II</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 48 }}>
          <div style={{ display: "flex", fontFamily: display, fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>Tabla de posiciones</div>
          <div style={{ display: "flex", fontSize: 26, color: C.grisClaro, marginTop: 12 }}>{d.subtitulo}</div>
        </div>

        {d.ganadorFecha && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 28, padding: "18px 24px", background: C.grisOscuro, borderLeft: `6px solid ${C.verde}`, borderRadius: 10 }}>
            <div style={{ display: "flex", fontFamily: monoF, fontSize: 18, letterSpacing: 2, color: C.grisClaro }}>
              {d.ganadorFecha.nombres.length > 1 ? "GANADORES" : "GANADOR"} DE LA FECHA {d.ganadorFecha.fecha}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6 }}>
              <div style={{ display: "flex", flex: 1, fontSize: 28, fontWeight: 700 }}>{unirNombres(d.ganadorFecha.nombres)}</div>
              <div style={{ display: "flex", fontFamily: monoF, fontSize: 28, color: C.verde, marginLeft: 24 }}>{d.ganadorFecha.pts} pts</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", marginTop: 32, background: C.grisOscuro, borderRadius: 10, padding: "8px 0" }}>
          <div style={{ display: "flex", padding: "12px 28px", fontFamily: monoF, fontSize: 18, color: C.grisMedio, letterSpacing: 2 }}>
            <span style={{ width: 60 }}>#</span>
            <span style={{ width: 70 }}>±</span>
            <span style={{ flex: 1 }}>PARTICIPANTE</span>
            <span style={{ width: 110, justifyContent: "flex-end", display: "flex" }}>PTS</span>
            <span style={{ width: 110, justifyContent: "flex-end", display: "flex" }}>DIF</span>
          </div>
          {filas.map((f, i) => (
            <div
              key={f.posicion}
              style={{
                display: "flex",
                alignItems: "center",
                height: altoFila,
                padding: "0 28px",
                borderTop: `1px solid ${C.negro}`,
                fontSize: altoFila > 44 ? 28 : 24,
                background: i === 0 ? "rgba(116, 204, 16, 0.10)" : "transparent",
              }}
            >
              <span style={{ width: 60, fontFamily: monoF, color: i < 3 ? C.blanco : C.grisClaro }}>{f.posicion}</span>
              <span style={{ width: 70, fontFamily: monoF, fontSize: 20, color: f.movimiento ? (f.movimiento > 0 ? C.verde : C.rojo) : C.grisMedio }}>
                {f.movimiento ? (f.movimiento > 0 ? `▲${f.movimiento}` : `▼${-f.movimiento}`) : "="}
              </span>
              <span style={{ flex: 1, fontWeight: i < 3 ? 700 : 500 }}>{f.nombre}</span>
              <span style={{ width: 110, display: "flex", justifyContent: "flex-end", fontFamily: monoF }}>{f.pts}</span>
              <span style={{ width: 110, display: "flex", justifyContent: "flex-end", fontFamily: monoF, fontSize: 20, color: C.grisMedio }}>{f.dif === 0 ? "—" : `−${f.dif}`}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", marginTop: "auto", paddingTop: 24, justifyContent: "space-between", fontSize: 20, color: C.grisMedio }}>
          <span>Exacto 5 · Ganador 3 · Goleador 2</span>
          <span>club90minutos.com</span>
        </div>
      </div>
    ),
    { width: 1080, height: alto, fonts: fonts.length ? fonts : undefined }
  );
  return Buffer.from(await imagen.arrayBuffer());
}
