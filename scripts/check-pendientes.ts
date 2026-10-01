import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Buscar los partidos "pendientes" de J3 y J9
    const pendientes = await prisma.partido.findMany({ 
        where: { 
            fase: 'fase_1',
            jornada: { in: [3, 5, 9, 16] },
            estado: { notIn: ['aplazado'] }
        },
        include: { 
            equipo_local: { select: { nombre: true }},
            equipo_visitante: { select: { nombre: true }},
            resultado_oficial: true
        }
    });
    
    for (const p of pendientes.sort((a,b) => a.jornada - b.jornada)) {
        const tieneResultado = p.resultado_oficial !== null;
        console.log(`J${p.jornada} | ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} | estado: ${p.estado} | resultado: ${tieneResultado} | jornada_original: ${p.jornada_original} | fecha: ${p.fecha_hora_partido.toISOString()}`);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
