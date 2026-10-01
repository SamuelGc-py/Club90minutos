import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const partidos = await prisma.partido.findMany({ where: { fase: 'fase_1' }, include: { resultado_oficial: true }});
    const jornadas = Array.from(new Set(partidos.map(p => p.jornada))).sort((a,b) => a - b);
    const ahora = Date.now();

    const cierresJornada: any = {};
    const aperturasJornada: any = {};
    jornadas.forEach(j => {
        const partidosJornada = partidos.filter(p => p.jornada === j && p.estado !== "aplazado");
        if (partidosJornada.length > 0) {
            const tiempos = partidosJornada.map(p => p.fecha_hora_partido.getTime()).sort((a, b) => a - b);
            let mejorInicio = tiempos[0];
            let mejorCount = 0;
            for (let i = 0; i < tiempos.length; i++) {
                const count = tiempos.filter(t => t >= tiempos[i] && t <= tiempos[i] + 7 * 24 * 60 * 60 * 1000).length;
                if (count > mejorCount) {
                    mejorCount = count;
                    mejorInicio = tiempos[i];
                }
            }
            const bloqueRegular = partidosJornada.filter(p => {
                const t = p.fecha_hora_partido.getTime();
                return t >= mejorInicio && t <= mejorInicio + 7 * 24 * 60 * 60 * 1000;
            });
            if (bloqueRegular.length > 0) {
                aperturasJornada[j] = Math.min(...bloqueRegular.map(p => p.fecha_hora_partido.getTime())) - (24 * 60 * 60 * 1000);
                const maxTime = Math.max(...bloqueRegular.map(p => p.fecha_hora_partido.getTime()));
                cierresJornada[j] = maxTime + (3 * 60 * 60 * 1000);
            }
        }
    });

    console.log("ahora:", new Date(ahora).toISOString());
    for (const j of jornadas) {
        const apert = aperturasJornada[j] ? new Date(aperturasJornada[j]).toISOString() : 'N/A';
        const cierre = cierresJornada[j] ? new Date(cierresJornada[j]).toISOString() : 'N/A';
        const activa = aperturasJornada[j] && cierresJornada[j] && ahora >= aperturasJornada[j] && ahora <= cierresJornada[j];
        console.log(`J${j}: apertura=${apert}, cierre=${cierre} ${activa ? '<<< ACTIVA' : ''}`);
    }

    const jornadasActivas = jornadas.filter(j => aperturasJornada[j] && cierresJornada[j] && ahora >= aperturasJornada[j] && ahora <= cierresJornada[j]);
    
    let jornadaActiva = 0;
    if (jornadasActivas.length > 0) {
        jornadaActiva = Math.max(...jornadasActivas);
    } else {
        for (const j of jornadas) {
            if (cierresJornada[j] && ahora <= cierresJornada[j]) {
                jornadaActiva = j;
                break;
            }
        }
    }
    
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

    console.log("\n>>> RESULTADO: jornadaActiva =", jornadaActiva);
}
main().catch(console.error).finally(() => prisma.$disconnect());
