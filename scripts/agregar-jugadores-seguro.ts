import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando actualización SEGURA de plantillas ---');

  // INSTRUCCIONES:
  // 1. Agrega aquí SÓLO los jugadores NUEVOS. 
  // 2. NO agregues jugadores que ya existen en la base de datos, para evitar duplicados.
  // 3. Puedes buscar el equipo_id en tu base de datos o en el panel de administrador.
  
  const nuevosJugadores = [
    // EJEMPLO:
    // { nombre: 'Falcao García', equipo_id: 5, posicion: 'DEL' },
    // { nombre: 'David Ospina', equipo_id: 8, posicion: 'POR' }
  ];

  if (nuevosJugadores.length === 0) {
    console.log('⚠️ No has agregado ningún jugador al script. Edita el archivo scripts/agregar-jugadores-seguro.ts y pon los jugadores nuevos en la lista.');
    return;
  }

  try {
    // Usamos createMany para que Prisma asigne automáticamente los nuevos IDs sin borrar los existentes
    const resultado = await prisma.jugador.createMany({
      data: nuevosJugadores,
      skipDuplicates: true // Por si accidentalmente pones uno repetido que coincida en condiciones únicas
    });

    console.log("✅ ¡Éxito! Se han agregado " + resultado.count + " jugadores nuevos a la base de datos de forma segura.");
    console.log('Tus IDs anteriores y los goleadores registrados están a salvo.');
  } catch (error) {
    console.error('❌ Error al agregar jugadores:', error);
  } finally {
    await prisma.();
  }
}

main();
