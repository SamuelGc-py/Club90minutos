import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targetPoints = {
  'Rene Osorio': 137,
  'Pedro Cantero': 136,
  'Juan Hernandez': 123,
  'Nelson Berdugo': 111,
  'Ricardo Soto': 93,
  'Lucas Saavedra': 90,
  'Romario Gomez': 86,
  'Hernando Davila': 86,
  'Ricardo Vanegas': 82,
  'Erick Andrade': 78,
  'Luis Betancourt': 77,
  'Harold Berdugo': 69,
  'Andres del Toro': 66,
  'Samuel Gutierrez': 59,
  'Ignacio Barrios': 52,
  'Manuel Cabarcas': 39,
};

async function main() {
  console.log('Iniciando ajuste manual de puntos...');
  
  // 1. Borrar ajustes manuales previos
  await prisma.puntaje.deleteMany({
    where: { partido_id: null }
  });
  console.log('Ajustes manuales anteriores borrados.');

  // 2. Obtener usuarios y sus puntos actuales (generados por los partidos)
  const users = await prisma.usuario.findMany({
    include: { puntajes: true }
  });

  let ajustados = 0;

  // 3. Calcular la diferencia y crear el ajuste
  for (const user of users) {
    const target = targetPoints[user.nombre_completo];
    if (target !== undefined) {
      const currentTotal = user.puntajes.reduce((acc, curr) => acc + curr.puntos_obtenidos, 0);
      const diff = target - currentTotal;
      
      if (diff !== 0) {
        await prisma.puntaje.create({
          data: {
            usuario_id: user.id,
            categoria: 'ganador_partido',
            partido_id: null,
            puntos_obtenidos: diff,
          }
        });
        console.log(`Ajuste para ${user.nombre_completo}: ${currentTotal} -> ${target} (diff: ${diff})`);
        ajustados++;
      } else {
        console.log(`Sin ajuste para ${user.nombre_completo}: ${currentTotal} (coincide con ${target})`);
      }
    }
  }

  console.log(`Ajuste manual exitoso. ${ajustados} usuarios recibieron ajustes.`);
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
