import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const excelPath = "C:\\Users\\Samuel Gc\\Downloads\\Maestro_Liga BetplayII (5).xlsx";

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sincronizar() {
    console.log("Cargando base de datos...");
    const dbPartidos = await prisma.partido.findMany({
        include: { equipo_local: true, equipo_visitante: true, resultado_oficial: true }
    });
    const equipos = await prisma.equipo.findMany();
    
    // Create map for easy lookup
    const equipoMap = new Map();
    equipos.forEach(e => equipoMap.set(e.nombre.trim().toLowerCase(), e.id));

    // Also add some common aliases if needed
    const aliases: any = {
        "alianza f.c.": "alianza valledupar f.c.",
        "alianza fc": "alianza valledupar f.c.",
        "águilas doradas": "águilas doradas",
        "aguilas doradas": "águilas doradas",
        "boyacá chicó": "boyacá chicó f.c.",
        "chicó": "boyacá chicó f.c.",
        "cúcuta": "cúcuta deportivo",
        "pereira": "deportivo pereira",
        "cali": "deportivo cali",
        "pasto": "deportivo pasto",
        "medellín": "independiente medellín",
        "santa fe": "independiente santa fe",
        "nacional": "atlético nacional",
        "bucaramanga": "atlético bucaramanga",
        "millonarios": "millonarios f.c.",
        "junior": "junior f.c.",
        "jaguares": "jaguares f.c.",
        "llaneros": "llaneros f.c.",
        "once caldas": "once caldas daf",
        "tolima": "deportes tolima"
    };

    function getEquipoId(name: string) {
        if (!name) return null;
        let clean = name.trim().toLowerCase();
        if (aliases[clean]) clean = aliases[clean];
        for (const [dbName, id] of equipoMap.entries()) {
            if (dbName === clean || dbName.includes(clean) || clean.includes(dbName)) {
                return id;
            }
        }
        return equipoMap.get(clean) || null;
    }

    console.log("Cargando Excel...");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    
    const sheetName = workbook.worksheets.find(s => s.name.toLowerCase().includes('partido') || s.name.toLowerCase().includes('fixture'))?.name;
    if (!sheetName) {
        console.error("No se encontró la hoja de partidos.");
        return;
    }
    const sheet = workbook.getWorksheet(sheetName);
    
    const excelMatches: any[] = [];
    
    sheet?.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Header
        
        const faseRaw = row.values[2];
        const fechaRaw = row.values[4];
        const horaRaw = row.values[5];
        const localRaw = row.values[7];
        const visitanteRaw = row.values[12];
        
        if (!faseRaw || !localRaw || !visitanteRaw) return;
        
        // Parse Jornada
        let jornada = null;
        if (typeof faseRaw === 'string') {
            const m = faseRaw.match(/J-(\d+)/i) || faseRaw.match(/J(\d+)/i) || faseRaw.match(/F-(\d+)/i) || faseRaw.match(/Fecha (\d+)/i);
            if (m) {
                jornada = parseInt(m[1], 10);
            }
        } else if (typeof faseRaw === 'number') {
            jornada = faseRaw;
        }
        
        if (jornada === null) return;
        
        const localId = getEquipoId(localRaw.toString());
        const visitanteId = getEquipoId(visitanteRaw.toString());
        
        if (!localId || !visitanteId) {
            console.log(`⚠️ Equipos no encontrados en fila ${rowNumber}: Local='${localRaw}', Visitante='${visitanteRaw}'`);
            return;
        }
        
        // Parse Date and Time
        let finalDate = new Date();
        if (fechaRaw instanceof Date) {
            finalDate = new Date(fechaRaw);
        } else if (typeof fechaRaw === 'string') {
            finalDate = new Date(fechaRaw);
        }
        
        if (horaRaw instanceof Date) {
            finalDate.setUTCHours(horaRaw.getUTCHours() + 5, horaRaw.getUTCMinutes(), 0, 0);
        } else if (typeof horaRaw === 'number') {
            const totalSeconds = Math.round(horaRaw * 24 * 3600);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            finalDate.setUTCHours(hours + 5, minutes, 0, 0);
        } else if (typeof horaRaw === 'string') {
            const timeParts = horaRaw.match(/(\d+):(\d+)/);
            if (timeParts) {
                let h = parseInt(timeParts[1], 10);
                let m = parseInt(timeParts[2], 10);
                if (horaRaw.toLowerCase().includes('pm') && h < 12) h += 12;
                finalDate.setUTCHours(h + 5, m, 0, 0);
            }
        }
        
        excelMatches.push({
            jornada,
            equipo_local_id: localId,
            equipo_visitante_id: visitanteId,
            fecha_hora_partido: finalDate,
            localName: localRaw,
            visitanteName: visitanteRaw
        });
    });
    
    console.log(`\nSe parsearon ${excelMatches.length} partidos válidos del Excel.`);
    
    // Compare with DB
    let nuevos = 0;
    let actualizados = 0;
    
    for (const em of excelMatches) {
        const dbMatch = dbPartidos.find(p => p.equipo_local_id === em.equipo_local_id && p.equipo_visitante_id === em.equipo_visitante_id && p.fase === 'fase_1');
        
        if (!dbMatch) {
            console.log(`CREANDO: J${em.jornada} ${em.localName} vs ${em.visitanteName} - ${em.fecha_hora_partido.toISOString()}`);
            await prisma.partido.create({
                data: {
                    fase: 'fase_1',
                    jornada: em.jornada,
                    equipo_local_id: em.equipo_local_id,
                    equipo_visitante_id: em.equipo_visitante_id,
                    fecha_hora_partido: em.fecha_hora_partido,
                    estado: 'programado',
                    hora_cierre_predicciones: new Date(em.fecha_hora_partido.getTime() - 2 * 60 * 60 * 1000)
                }
            });
            nuevos++;
        } else {
            // Check if date changed
            const diffHours = Math.abs(dbMatch.fecha_hora_partido.getTime() - em.fecha_hora_partido.getTime()) / (1000 * 60 * 60);
            if (diffHours > 0.1 || dbMatch.jornada !== em.jornada) { // more than 6 minutes difference or different matchday
                console.log(`ACTUALIZANDO J${em.jornada} ${em.localName} vs ${em.visitanteName}: de ${dbMatch.fecha_hora_partido.toISOString()} a ${em.fecha_hora_partido.toISOString()}`);
                await prisma.partido.update({
                    where: { id: dbMatch.id },
                    data: {
                        jornada: em.jornada,
                        fecha_hora_partido: em.fecha_hora_partido,
                        hora_cierre_predicciones: new Date(em.fecha_hora_partido.getTime() - 2 * 60 * 60 * 1000),
                        estado: dbMatch.resultado_oficial ? dbMatch.estado : 'programado'
                    }
                });
                actualizados++;
            }
        }
    }
    
    console.log(`\nResumen: ${nuevos} partidos creados, ${actualizados} actualizados.`);
}

sincronizar().catch(console.error).finally(() => prisma.$disconnect());
