import { prisma } from '../src/lib/db'; 
async function test() { 
  const maxId = await prisma.prediccionPartido.aggregate({ _max: { id: true } }); 
  const seq: any = await prisma.$queryRaw`SELECT last_value FROM prediccion_partido_id_seq`; 
  console.log('Max ID:', maxId._max.id, 'Seq:', seq[0]?.last_value); 
} 
test();
