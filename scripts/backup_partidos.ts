import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function backup() {
    console.log('Iniciando backup...');
    const partidos = await prisma.partido.findMany({ include: { resultado_oficial: true, equipo_local: true, equipo_visitante: true } });
    const equipos = await prisma.equipo.findMany();
    
    const data = {
        timestamp: new Date().toISOString(),
        partidos,
        equipos
    };

    fs.writeFileSync('backup_db_antes_de_actualizar_partidos.json', JSON.stringify(data, null, 2));
    console.log('Backup guardado en backup_db_antes_de_actualizar_partidos.json');
}

backup().catch(console.error).finally(() => prisma.$disconnect());
