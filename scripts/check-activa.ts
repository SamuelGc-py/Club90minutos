import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const partidos = await prisma.partido.findMany({ where: { fase: 'fase_1' }, include: { resultado_oficial: true }});
    const jornadas = Array.from(new Set(partidos.map(p => p.jornada))).sort((a,b)=>a-b);
    for (const j of jornadas) {
        const pJ = partidos.filter(p => p.jornada === j && p.estado !== 'aplazado');
        const liq = pJ.filter(p => p.resultado_oficial || ['resultado_cargado','puntaje_calculado'].includes(p.estado));
        console.log(`J${j}: total=${pJ.length} liq=${liq.length}`);
        if (liq.length < pJ.length) {
            console.log(`Activa = ${j}`);
            break;
        }
    }
}
main().catch(console.error).finally(()=>prisma.$disconnect());
