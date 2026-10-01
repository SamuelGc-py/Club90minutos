import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const partidos = await prisma.partido.findMany({ where: { fase: 'fase_1' }});
    const jornadas = Array.from(new Set(partidos.map(p => p.jornada))).sort((a,b)=>a-b);
    const ahora = Date.now();
    const cierresJornada: any = {};
    const aperturasJornada: any = {};
    
    jornadas.forEach(j => {
        const pJ = partidos.filter(p => p.jornada === j && p.estado !== 'aplazado' && (!p.jornada_original || p.jornada_original === j));
        if(pJ.length>0){
            const ini = Math.min(...pJ.map(p => p.fecha_hora_partido.getTime()));
            const pReg = pJ.filter(p => p.fecha_hora_partido.getTime() <= ini + 7*24*3600*1000);
            if(pReg.length>0) {
                aperturasJornada[j] = Math.min(...pReg.map(p=>p.fecha_hora_partido.getTime())) - 24*3600*1000;
                cierresJornada[j] = Math.max(...pReg.map(p=>p.fecha_hora_partido.getTime())) + 3*3600*1000;
            }
        }
    });
    
    console.log('ahora:', new Date(ahora).toISOString());
    for (const j of jornadas) {
        console.log(`J${j} cierre: ${cierresJornada[j] ? new Date(cierresJornada[j]).toISOString() : null}`);
    }

    const jornadasActivas = jornadas.filter(j => aperturasJornada[j] && cierresJornada[j] && ahora >= aperturasJornada[j] && ahora <= cierresJornada[j]);
    
    let mejorJornada = 0;
    if (jornadasActivas.length > 0) {
      mejorJornada = Math.max(...jornadasActivas);
    } else {
      for (const j of jornadas) {
        if (cierresJornada[j] && ahora <= cierresJornada[j]) {
          mejorJornada = j;
          break;
        }
      }
    }
    console.log("Mejor Jornada según fechas:", mejorJornada);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
