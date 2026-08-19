const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const datosImagen = [
  { nombre: "Pedro Cantero", exactos: 30, ganadores: 45, goleadores: 24, total: 99 },
  { nombre: "Nelson Berdugo", exactos: 25, ganadores: 54, goleadores: 16, total: 95 },
  { nombre: "Juan Hernandez", exactos: 25, ganadores: 48, goleadores: 18, total: 91 },
  { nombre: "Rene Osorio", exactos: 20, ganadores: 45, goleadores: 18, total: 83 },
  { nombre: "Hernando Davila", exactos: 20, ganadores: 42, goleadores: 10, total: 72 },
  { nombre: "Lucas Saavedra", exactos: 15, ganadores: 42, goleadores: 14, total: 71 },
  { nombre: "Ricardo Vanegas", exactos: 20, ganadores: 36, goleadores: 10, total: 66 },
  { nombre: "Romario Gomez", exactos: 10, ganadores: 33, goleadores: 18, total: 61 },
  { nombre: "Harold Berdugo", exactos: 20, ganadores: 27, goleadores: 14, total: 61 },
  { nombre: "Ignacio Barrios", exactos: 10, ganadores: 27, goleadores: 10, total: 47 },
  { nombre: "Ricardo Soto", exactos: 5, ganadores: 27, goleadores: 14, total: 46 },
  { nombre: "Erick Andrade", exactos: 0, ganadores: 30, goleadores: 14, total: 44 },
  { nombre: "Samuel Gutierrez", exactos: 5, ganadores: 30, goleadores: 8, total: 43 },
  { nombre: "Luis Betancourt", exactos: 5, ganadores: 24, goleadores: 14, total: 43 },
  { nombre: "Andres Del Toro", exactos: 10, ganadores: 21, goleadores: 4, total: 35 },
  { nombre: "Manuel Cabarcas", exactos: 0, ganadores: 18, goleadores: 2, total: 20 },
];

function normalizarTexto(txt) {
  return txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

async function main() {
  const usuarios = await prisma.usuario.findMany({
    where: { activo: true }
  });

  const emparejamientos = [];

  for (const item of datosImagen) {
    const itemNorm = normalizarTexto(item.nombre);
    const uFound = usuarios.find(u => {
      const uNorm = normalizarTexto(u.nombre_completo);
      return uNorm === itemNorm || uNorm.includes(itemNorm) || itemNorm.includes(uNorm);
    });

    if (uFound) {
      emparejamientos.push({
        nombreImagen: item.nombre,
        usuarioId: uFound.id,
        nombreBD: uFound.nombre_completo,
        correo: uFound.correo,
        exactos: item.exactos,
        ganadores: item.ganadores,
        goleadores: item.goleadores,
        total: item.total
      });
    } else {
      console.error("NO SE ENCONTRÓ USUARIO PARA:", item.nombre);
    }
  }

  console.table(emparejamientos);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
