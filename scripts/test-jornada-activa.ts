import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const partidos = await prisma.partido.findMany({
    include: { resultado_oficial: true },
    orderBy: [{ jornada: 'asc' }, { fecha_hora_partido: 'asc' }]
  });

  const jornadas = Array.from(new Set(partidos.map((p) => p.jornada))).sort((a, b) => a - b);
  let mejorJornada = 0;
  
  for (const j of jornadas) {
      const pJornada = partidos.filter(p => p.jornada === j && p.estado !== "aplazado");
      if (pJornada.length > 0) {
          const algunaAbierta = pJornada.some(p => p.estado === "predicciones_abiertas");
          if (algunaAbierta) {
              mejorJornada = j;
              break;
          }
      }
  }
  
  let jornadaActiva = mejorJornada;
  if (jornadaActiva === 0) {
      for (const j of jornadas) {
          const partidosJ = partidos.filter(p => p.jornada === j && p.estado !== "aplazado");
          if (partidosJ.length > 0) {
              const liquidados = partidosJ.filter(p => p.resultado_oficial !== null || p.estado === "resultado_cargado" || p.estado === "puntaje_calculado");
              if (liquidados.length < partidosJ.length) {
                  jornadaActiva = j;
                  break;
              }
          }
      }
  }

  const fechaFinal = jornadaActiva > 0 ? jornadaActiva : (jornadas[jornadas.length - 1] || 1);
  console.log(`mejorJornada = ${mejorJornada}`);
  console.log(`jornadaActiva = ${jornadaActiva}`);
  console.log(`fechaFinal (fechaParticipante) = ${fechaFinal}`);
  
  // Show what would be displayed for fechaParticipante
  const partidosFiltradosParticipante = partidos.filter((p) => {
      if (p.estado === "aplazado") return false;
      const jornadaOrigen = p.jornada_original || p.jornada;
      if (p.jornada === fechaFinal || jornadaOrigen === fechaFinal) return true;
      if (jornadaOrigen < fechaFinal && p.estado === "programado") return true;
      return false;
  });
  console.log(`\nPartidos filtrados para la fecha ${fechaFinal}:`);
  partidosFiltradosParticipante.forEach(p => {
      console.log(`J${p.jornada} (orig: ${p.jornada_original}) - ${p.estado}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
