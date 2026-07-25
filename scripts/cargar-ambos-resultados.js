const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cargarAmbosResultadosViernes() {
  const { calcularPuntosPartido } = require('../src/lib/calculadorPuntos.ts');

  const admin = await prisma.usuario.findFirst({
    where: { rol: { nombre: 'administrador' } }
  });

  // 1. Partido 1: Llaneros 1 - 0 Pereira (Goleador: Néider Ospina id 273)
  const llanerosMatch = await prisma.partido.findFirst({
    where: { equipo_local: { nombre: { contains: 'Llaneros' } } }
  });

  if (llanerosMatch) {
    const res1 = await calcularPuntosPartido(llanerosMatch.id, 1, 0, 273, admin.id);
    console.log("✅ RESULTADO LLANEROS 1 - 0 PEREIRA CARGADO:", res1);
  }

  // 2. Partido 2: Cali 2 - 0 Jaguares (Goleador: Steven Rodríguez id 118)
  const caliMatch = await prisma.partido.findFirst({
    where: { equipo_local: { nombre: { contains: 'Cali' } } }
  });

  if (caliMatch) {
    const res2 = await calcularPuntosPartido(caliMatch.id, 2, 0, 118, admin.id);
    console.log("✅ RESULTADO CALI 2 - 0 JAGUARES CARGADO:", res2);
  }

  // Imprimir resumen de la Tabla de Posiciones acumulada tras los 2 partidos
  const todosLosPuntajes = await prisma.puntaje.findMany({
    include: { usuario: true, partido: { include: { equipo_local: true, equipo_visitante: true } } }
  });

  console.log("\n📊 RESUMEN DE PUNTOS TOTALES TRAS AMBOS PARTIDOS DEL VIERNES:\n");
  
  const resumenPorUsuario = {};
  todosLosPuntajes.forEach(p => {
    const nom = p.usuario.nombre_completo;
    if (!resumenPorUsuario[nom]) resumenPorUsuario[nom] = 0;
    resumenPorUsuario[nom] += p.puntos_obtenidos;
  });

  const ordenados = Object.entries(resumenPorUsuario).sort((a, b) => b[1] - a[1]);
  ordenados.forEach(([nombre, total], index) => {
    console.log(`#${index + 1} ${nombre}: ${total} Pts Acumulados`);
  });
}

cargarAmbosResultadosViernes().catch(console.error).finally(() => prisma.$disconnect());
