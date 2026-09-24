import { prisma } from '../src/lib/db'; 
async function fixSeq() { 
  const maxId = await prisma.prediccionPartido.aggregate({ _max: { id: true } }); 
  await prisma.$executeRaw`SELECT setval('prediccion_partido_id_seq', COALESCE((SELECT MAX(id)+1 FROM prediccion_partido), 1), false);`; 
  console.log('Sequence fixed!'); 
} 
fixSeq();
