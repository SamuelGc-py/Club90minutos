import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkToday() {
    const startOfDay = new Date();
    startOfDay.setUTCHours(5, 0, 0, 0); // Oct 1, 00:00 Colombia Time (UTC 5:00)
    
    const endOfDay = new Date(startOfDay.getTime() + 48 * 60 * 60 * 1000); // Check 48 hrs just in case
    
    const matches = await prisma.partido.findMany({
        include: { equipo_local: true, equipo_visitante: true },
        where: {
            fecha_hora_partido: {
                gte: startOfDay,
                lt: endOfDay
            }
        }
    });

    console.log(`Partidos encontrados en las próximas 48 horas: ${matches.length}`);
    for (const m of matches) {
        console.log(`J${m.jornada} ${m.equipo_local.nombre} vs ${m.equipo_visitante.nombre} - ${m.fecha_hora_partido.toISOString()} (Estado: ${m.estado})`);
        if (m.estado === 'programado') {
            await prisma.partido.update({
                where: { id: m.id },
                data: { estado: 'predicciones_abiertas' }
            });
            console.log(`✅ Estado actualizado a 'predicciones_abiertas' para el partido de hoy.`);
        }
    }
}

checkToday().catch(console.error).finally(() => prisma.$disconnect());
