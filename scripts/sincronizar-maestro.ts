import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const masterPoints = {
  'Pedro Cantero': 147,
  'Rene Osorio': 142,
  'Juan Hernandez': 141,
  'Nelson Berdugo': 121,
  'Ricardo Soto': 107,
  'Lucas Saavedra': 98,
  'Romario Gomez': 98,
  'Luis Betancourt': 97,
  'Hernando Davila': 86,
  'Erick Andrade': 86,
  'Ricardo Vanegas': 82,
  'Andres Del Toro': 76,
  'Harold Berdugo': 69,
  'Samuel Gutierrez': 62,
  'Ignacio Barrios': 54,
  'Manuel Cabarcas': 39,
};

async function main() {
  console.log('Sincronizando DB con la Tabla Maestra (Excel)...');
  
  const users = await prisma.usuario.findMany({
    include: { puntajes: { where: { partido_id: { not: null } } } }
  });

  await prisma.puntaje.deleteMany({
    where: { partido_id: null }
  });

  let count = 0;

  for (const user of users) {
    // Normalizar nombre para Andres del Toro (a veces es "Andres del Toro" o "Andres Del Toro")
    let target = masterPoints[user.nombre_completo];
    if (!target) {
      const foundKey = Object.keys(masterPoints).find(k => k.toLowerCase() === user.nombre_completo.toLowerCase());
      if (foundKey) target = masterPoints[foundKey];
    }

    if (target !== undefined) {
      const currentDB = user.puntajes.reduce((acc, curr) => acc + curr.puntos_obtenidos, 0);
      const diff = target - currentDB;
      
      if (diff !== 0) {
        await prisma.puntaje.create({
          data: {
            usuario_id: user.id,
            categoria: 'ganador_partido', // Usamos esta por defecto para ajuste manual
            partido_id: null,
            puntos_obtenidos: diff,
          }
        });
        console.log(`[+] ${user.nombre_completo}: BD tenía ${currentDB} -> Ajuste de ${diff} -> Total final: ${target}`);
        count++;
      }
    }
  }

  console.log(`\n¡Sincronización completada! ${count} usuarios ajustados.`);
}

main().finally(async () => {
  await prisma.$disconnect();
});
