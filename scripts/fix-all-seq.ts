import { prisma } from '../src/lib/db'; 
async function fixAll() { 
  const tables = [
    { table: 'jugador', seq: 'jugador_id_seq' },
    { table: 'resultado_oficial', seq: 'resultado_oficial_id_seq' },
    { table: 'resultado_goleador', seq: 'resultado_goleador_id_seq' },
    { table: 'prediccion_partido', seq: 'prediccion_partido_id_seq' },
    { table: 'prediccion_inicial', seq: 'prediccion_inicial_id_seq' },
    { table: 'puntaje', seq: 'puntaje_id_seq' },
    { table: 'partido', seq: 'partido_id_seq' }
  ];
  for (const { table, seq } of tables) {
    try {
      await prisma.$executeRawUnsafe(`SELECT setval('${seq}', COALESCE((SELECT MAX(id)+1 FROM ${table}), 1), false);`);
      console.log(`Fixed ${table}`);
    } catch (e) {
      console.log(`Failed for ${table}`);
    }
  }
} 
fixAll();
