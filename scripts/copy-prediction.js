const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usuarios = await prisma.usuario.findMany();

  const juan = usuarios.find(u => u.nombre_completo.toLowerCase().includes('juan') || u.nombre_completo.toLowerCase().includes('hernandez'));
  const samuel = usuarios.find(u => u.nombre_completo.toLowerCase().includes('samuel') || u.id === 2);

  console.log('\nUsuario Juan:', juan?.id, juan?.nombre_completo);
  console.log('Usuario Samuel:', samuel?.id, samuel?.nombre_completo);

  if (juan) {
    const pronosticoJuan = await prisma.prediccionPartido.findFirst({
      where: { usuario_id: juan.id, partido_id: 38 }
    });

    console.log('\nPronóstico de Juan Hernandez para el Partido 38 (América vs Chicó):', pronosticoJuan);

    if (pronosticoJuan && samuel) {
      const pronosticoSamuel = await prisma.prediccionPartido.upsert({
        where: {
          usuario_id_partido_id: {
            usuario_id: samuel.id,
            partido_id: 38
          }
        },
        update: {
          goles_local_predicho: pronosticoJuan.goles_local_predicho,
          goles_visitante_predicho: pronosticoJuan.goles_visitante_predicho,
          jugador_goleador_predicho_id: pronosticoJuan.jugador_goleador_predicho_id || null,
          estado: 'enviada',
          timestamp_envio: new Date()
        },
        create: {
          usuario_id: samuel.id,
          partido_id: 38,
          goles_local_predicho: pronosticoJuan.goles_local_predicho,
          goles_visitante_predicho: pronosticoJuan.goles_visitante_predicho,
          jugador_goleador_predicho_id: pronosticoJuan.jugador_goleador_predicho_id || null,
          estado: 'enviada',
          timestamp_envio: new Date()
        }
      });
      console.log('\n✅ PRONÓSTICO DE JUAN COPIADO A SAMUEL CON ÉXITO:');
      console.log(`- América de Cali: ${pronosticoSamuel.goles_local_predicho}`);
      console.log(`- Boyacá Chicó: ${pronosticoSamuel.goles_visitante_predicho}`);
      console.log(`- Goleador ID: ${pronosticoSamuel.jugador_goleador_predicho_id ?? 'Sin goleador'}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
