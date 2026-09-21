import { PrismaClient, NombreRol, Fase, EstadoPartido, EstadoPrediccionInicial, EstadoPrediccionPartido, CategoriaPuntaje } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const directUrl = "postgresql://postgres.lhherdvyoldypxlhplai:JGqemJX%24h%23c4%3FUQ@aws-0-us-east-2.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

async function main() {
  console.log("=== INICIANDO RESTAURACION TOTAL A SUPABASE ===");

  const backupTodayDir = path.join(__dirname, "..", "backups", "2026-09-21T14-46-10-611Z");
  const backupMaestrosDir = path.join(__dirname, "..", "backups", "PRE-HOMOLOGACION-2026-09-19T13-30-21Z");

  const datosMaestros = JSON.parse(fs.readFileSync(path.join(backupMaestrosDir, "datos-maestros.json"), "utf8"));
  const usuarios = JSON.parse(fs.readFileSync(path.join(backupTodayDir, "usuario.json"), "utf8"));
  const partidos = JSON.parse(fs.readFileSync(path.join(backupTodayDir, "partido.json"), "utf8"));
  const prediccionesIniciales = JSON.parse(fs.readFileSync(path.join(backupTodayDir, "prediccion_inicial.json"), "utf8"));
  const prediccionesPartidos = JSON.parse(fs.readFileSync(path.join(backupTodayDir, "prediccion_partido.json"), "utf8"));
  const resultadosOficiales = JSON.parse(fs.readFileSync(path.join(backupTodayDir, "resultado_oficial.json"), "utf8"));
  const puntajes = JSON.parse(fs.readFileSync(path.join(backupTodayDir, "puntaje.json"), "utf8"));

  // 0. Crear Roles
  console.log("\n0. Insertando Roles...");
  await prisma.rol.upsert({ where: { id: 1 }, create: { id: 1, nombre: NombreRol.participante }, update: {} });
  await prisma.rol.upsert({ where: { id: 2 }, create: { id: 2, nombre: NombreRol.administrador }, update: {} });
  console.log("   ✓ Roles insertados.");

  // 1. Insertar Equipos
  console.log(`\n1. Insertando ${datosMaestros.equipos.length} Equipos...`);
  for (const eq of datosMaestros.equipos) {
    await prisma.equipo.upsert({
      where: { id: eq.id },
      create: {
        id: eq.id,
        nombre: eq.nombre,
        escudo_url: eq.escudo_url,
      },
      update: {
        nombre: eq.nombre,
        escudo_url: eq.escudo_url,
      },
    });
  }
  console.log("   ✓ Equipos insertados.");

  // 2. Insertar Jugadores
  console.log(`\n2. Insertando ${datosMaestros.jugadores.length} Jugadores...`);
  for (const j of datosMaestros.jugadores) {
    await prisma.jugador.upsert({
      where: { id: j.id },
      create: {
        id: j.id,
        nombre: j.nombre,
        equipo_id: j.equipo_id,
      },
      update: {
        nombre: j.nombre,
        equipo_id: j.equipo_id,
      },
    });
  }
  console.log("   ✓ Jugadores insertados.");

  // 3. Insertar Usuarios
  console.log(`\n3. Insertando ${usuarios.length} Usuarios...`);
  for (const u of usuarios) {
    const rolId = u.rol === "administrador" || u.rol_id === 2 ? 2 : 1;
    await prisma.usuario.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        nombre_completo: u.nombre_completo || u.nombre_polla || "Usuario",
        correo: u.correo || u.email,
        telefono: u.telefono || u.whatsapp || null,
        password: u.password,
        sesion_token: u.sesion_token || null,
        rol_id: rolId,
        fecha_registro: u.fecha_registro ? new Date(u.fecha_registro) : u.created_at ? new Date(u.created_at) : new Date(),
        activo: u.activo ?? true,
      },
      update: {
        nombre_completo: u.nombre_completo || u.nombre_polla || "Usuario",
        correo: u.correo || u.email,
        telefono: u.telefono || u.whatsapp || null,
        password: u.password,
        sesion_token: u.sesion_token || null,
        rol_id: rolId,
        activo: u.activo ?? true,
      },
    });
  }
  console.log("   ✓ Usuarios insertados.");

  // 4. Insertar Partidos
  console.log(`\n4. Insertando ${partidos.length} Partidos...`);
  for (const p of partidos) {
    const fechaHora = new Date(p.fecha_hora_partido);
    const cierre = p.hora_cierre_predicciones ? new Date(p.hora_cierre_predicciones) : fechaHora;
    const faseEnum = p.fase ? (p.fase as Fase) : Fase.fase_1;
    const estadoEnum = p.estado ? (p.estado as EstadoPartido) : EstadoPartido.programado;

    await prisma.partido.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        fase: faseEnum,
        jornada: p.jornada,
        jornada_original: p.jornada_original,
        equipo_local_id: p.equipo_local_id,
        equipo_visitante_id: p.equipo_visitante_id,
        fecha_hora_partido: fechaHora,
        estado: estadoEnum,
        hora_cierre_predicciones: cierre,
        estadio: p.estadio || null,
      },
      update: {
        fase: faseEnum,
        jornada: p.jornada,
        jornada_original: p.jornada_original,
        equipo_local_id: p.equipo_local_id,
        equipo_visitante_id: p.equipo_visitante_id,
        fecha_hora_partido: fechaHora,
        estado: estadoEnum,
        hora_cierre_predicciones: cierre,
        estadio: p.estadio || null,
      },
    });
  }
  console.log("   ✓ Partidos insertados.");

  // 5. Insertar Predicciones Iniciales y sus clasificados
  console.log(`\n5. Insertando ${prediccionesIniciales.length} Predicciones Iniciales...`);
  for (const pi of prediccionesIniciales) {
    const estadoPI = pi.estado ? (pi.estado as EstadoPrediccionInicial) : (pi.completado ? EstadoPrediccionInicial.enviada : EstadoPrediccionInicial.no_enviada);
    await prisma.prediccionInicial.upsert({
      where: { id: pi.id },
      create: {
        id: pi.id,
        usuario_id: pi.usuario_id,
        campeon_equipo_id: pi.campeon_equipo_id,
        finalista_1_equipo_id: pi.finalista_1_equipo_id,
        finalista_2_equipo_id: pi.finalista_2_equipo_id,
        goleador_torneo_jugador_id: pi.goleador_torneo_jugador_id,
        timestamp_envio: pi.timestamp_envio ? new Date(pi.timestamp_envio) : pi.updated_at ? new Date(pi.updated_at) : new Date(),
        estado: estadoPI,
      },
      update: {
        usuario_id: pi.usuario_id,
        campeon_equipo_id: pi.campeon_equipo_id,
        finalista_1_equipo_id: pi.finalista_1_equipo_id,
        finalista_2_equipo_id: pi.finalista_2_equipo_id,
        goleador_torneo_jugador_id: pi.goleador_torneo_jugador_id,
        timestamp_envio: pi.timestamp_envio ? new Date(pi.timestamp_envio) : pi.updated_at ? new Date(pi.updated_at) : new Date(),
        estado: estadoPI,
      },
    });

    if (pi.clasificados && pi.clasificados.length > 0) {
      for (const c of pi.clasificados) {
        await prisma.prediccionClasificado.upsert({
          where: {
            prediccion_inicial_id_equipo_id: {
              prediccion_inicial_id: pi.id,
              equipo_id: c.equipo_id,
            },
          },
          create: {
            prediccion_inicial_id: pi.id,
            equipo_id: c.equipo_id,
          },
          update: {},
        });
      }
    }
  }
  console.log("   ✓ Predicciones Iniciales insertadas.");

  // 6. Insertar Predicciones de Partidos
  console.log(`\n6. Insertando ${prediccionesPartidos.length} Predicciones de Partidos...`);
  for (const pp of prediccionesPartidos) {
    const estadoPP = pp.estado ? (pp.estado as EstadoPrediccionPartido) : EstadoPrediccionPartido.enviada;
    await prisma.prediccionPartido.upsert({
      where: { id: pp.id },
      create: {
        id: pp.id,
        usuario_id: pp.usuario_id,
        partido_id: pp.partido_id,
        goles_local_predicho: pp.goles_local_predicho ?? pp.goles_local,
        goles_visitante_predicho: pp.goles_visitante_predicho ?? pp.goles_visitante,
        jugador_goleador_predicho_id: pp.jugador_goleador_predicho_id,
        timestamp_envio: pp.timestamp_envio ? new Date(pp.timestamp_envio) : pp.updated_at ? new Date(pp.updated_at) : new Date(),
        estado: estadoPP,
      },
      update: {
        usuario_id: pp.usuario_id,
        partido_id: pp.partido_id,
        goles_local_predicho: pp.goles_local_predicho ?? pp.goles_local,
        goles_visitante_predicho: pp.goles_visitante_predicho ?? pp.goles_visitante,
        jugador_goleador_predicho_id: pp.jugador_goleador_predicho_id,
        timestamp_envio: pp.timestamp_envio ? new Date(pp.timestamp_envio) : pp.updated_at ? new Date(pp.updated_at) : new Date(),
        estado: estadoPP,
      },
    });
  }
  console.log("   ✓ Predicciones de Partidos insertadas.");

  // 7. Insertar Resultados Oficiales y Goleadores
  console.log(`\n7. Insertando ${resultadosOficiales.length} Resultados Oficiales...`);
  for (const ro of resultadosOficiales) {
    const adminUser = usuarios.find((u: any) => u.rol === "administrador" || u.rol_id === 2) || usuarios[0];
    const adminId = ro.ingresado_por_usuario_id || adminUser.id;

    await prisma.resultadoOficial.upsert({
      where: { id: ro.id },
      create: {
        id: ro.id,
        partido_id: ro.partido_id,
        goles_local_real: ro.goles_local_real ?? ro.goles_local,
        goles_visitante_real: ro.goles_visitante_real ?? ro.goles_visitante,
        equipo_ganador_id: ro.equipo_ganador_id,
        ingresado_por_usuario_id: adminId,
        timestamp_ingreso: ro.timestamp_ingreso ? new Date(ro.timestamp_ingreso) : ro.created_at ? new Date(ro.created_at) : new Date(),
      },
      update: {
        partido_id: ro.partido_id,
        goles_local_real: ro.goles_local_real ?? ro.goles_local,
        goles_visitante_real: ro.goles_visitante_real ?? ro.goles_visitante,
        equipo_ganador_id: ro.equipo_ganador_id,
        ingresado_por_usuario_id: adminId,
      },
    });

    if (ro.goleadores && ro.goleadores.length > 0) {
      for (const rg of ro.goleadores) {
        await prisma.resultadoGoleador.upsert({
          where: { id: rg.id },
          create: {
            id: rg.id,
            resultado_oficial_id: ro.id,
            jugador_id: rg.jugador_id,
            es_autogol: rg.es_autogol ?? false,
          },
          update: {
            resultado_oficial_id: ro.id,
            jugador_id: rg.jugador_id,
            es_autogol: rg.es_autogol ?? false,
          },
        });
      }
    }
  }
  console.log("   ✓ Resultados Oficiales insertados.");

  // 8. Insertar Puntajes
  console.log(`\n8. Insertando ${puntajes.length} Registros de Puntaje...`);
  for (const pt of puntajes) {
    const catEnum = pt.categoria ? (pt.categoria as CategoriaPuntaje) : (pt.puntos_marcador > 0 ? CategoriaPuntaje.resultado_exacto : CategoriaPuntaje.ganador_partido);
    const pts = pt.puntos_obtenidos ?? pt.puntos_totales ?? 0;

    await prisma.puntaje.upsert({
      where: { id: pt.id },
      create: {
        id: pt.id,
        usuario_id: pt.usuario_id,
        categoria: catEnum,
        partido_id: pt.partido_id,
        puntos_obtenidos: pts,
        timestamp_calculo: pt.timestamp_calculo ? new Date(pt.timestamp_calculo) : pt.created_at ? new Date(pt.created_at) : new Date(),
      },
      update: {
        usuario_id: pt.usuario_id,
        categoria: catEnum,
        partido_id: pt.partido_id,
        puntos_obtenidos: pts,
      },
    });
  }
  console.log("   ✓ Puntajes insertados.");

  console.log("\n==================================================");
  console.log("¡RESTAURACION TOTAL A SUPABASE COMPLETADA CON EXITO!");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Error durante la restauración:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
