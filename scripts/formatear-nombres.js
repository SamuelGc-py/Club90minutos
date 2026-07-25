const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function simplificarNombre(nombreCompleto) {
  if (!nombreCompleto) return "";

  // Separar por espacios limpiando dobles espacios
  const partes = nombreCompleto.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0].charAt(0).toUpperCase() + partes[0].slice(1).toLowerCase();
  }

  // Si tiene 2 partes (ej: "Harold Berdugo", "Pedro Cantero")
  if (partes.length === 2) {
    return partes.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
  }

  // Si tiene 3 o más partes:
  // Casos comunes de nombres dobles y apellidos dobles:
  // "Hernando Rafael Davila Mejia" -> Primer Nombre "Hernando", Primer Apellido "Davila"
  // "Nelson Berdugo de los Reyes" -> "Nelson Berdugo"
  // "Juan David Hernandez Montalvo" -> "Juan Hernandez"
  // "Moisés Lucas Saavedra Perea" -> "Moisés Saavedra"
  // "ricardo soto gomez" -> "Ricardo Soto"
  // "Luis Miguel Betancourt" -> "Luis Betancourt"

  const primerNombre = partes[0].charAt(0).toUpperCase() + partes[0].slice(1).toLowerCase();

  // Buscar el primer apellido. Si la segunda palabra es un nombre (como Rafael, David, Lucas, Miguel, Del, de), el apellido suele ser la 3era palabra.
  let primerApellidoIndex = 1;
  const nombresSecundarios = ["david", "rafael", "lucas", "miguel", "angel", "del", "de", "los", "maria", "jose"];

  if (partes.length >= 3 && nombresSecundarios.includes(partes[1].toLowerCase())) {
    primerApellidoIndex = 2;
    if (["de", "del"].includes(partes[2].toLowerCase()) && partes.length >= 4) {
      primerApellidoIndex = 3;
    }
  }

  let primerApellido = partes[primerApellidoIndex] || partes[1];
  primerApellido = primerApellido.charAt(0).toUpperCase() + primerApellido.slice(1).toLowerCase();

  return `${primerNombre} ${primerApellido}`;
}

async function actualizarNombres() {
  const usuarios = await prisma.usuario.findMany();

  console.log("FORMATO DE NOMBRES SIMPLIFICADOS:\n");
  for (const u of usuarios) {
    const nuevoNombre = simplificarNombre(u.nombre_completo);
    console.log(`Original: "${u.nombre_completo}" -> Nuevo: "${nuevoNombre}"`);
    await prisma.usuario.update({
      where: { id: u.id },
      data: { nombre_completo: nuevoNombre }
    });
  }
}

actualizarNombres().catch(console.error).finally(() => prisma.$disconnect());
