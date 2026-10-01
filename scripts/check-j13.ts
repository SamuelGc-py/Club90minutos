import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const partidos = await prisma.partido.findMany({ 
        where: { fase: 'fase_1', jornada: 13 },
        include: { 
            equipo_local: { select: { nombre: true }},
            equipo_visitante: { select: { nombre: true }},
            resultado_oficial: true
        },
        orderBy: { fecha_hora_partido: 'asc' }
    });
    
    console.log("=== PARTIDOS FECHA 13 ===");
    for (const p of partidos) {
        console.log(`${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} | fecha: ${p.fecha_hora_partido.toISOString()} | estado: ${p.estado} | j_orig: ${p.jornada_original} | resultado: ${p.resultado_oficial !== null}`);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
