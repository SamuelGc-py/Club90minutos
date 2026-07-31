const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllUsers() {
  const usuarios = await prisma.usuario.findMany({
    include: { rol: true },
    orderBy: { nombre_completo: 'asc' }
  });

  console.log(`--- REVISIÓN DE TODOS LOS USUARIOS (${usuarios.length}) ---`);
  
  const inactivos = usuarios.filter(u => !u.activo);
  console.log(`Usuarios inactivos / bloqueados: ${inactivos.length}`);
  
  if (inactivos.length > 0) {
    console.log('LISTA DE INACTIVOS:', inactivos.map(u => ({ id: u.id, nombre: u.nombre_completo, correo: u.correo })));
  } else {
    console.log('✅ TODOS los usuarios están ACTIVOS y habilitados para pronosticar.');
  }

  // Activar cualquier usuario que esté inactivo
  if (inactivos.length > 0) {
    console.log('Activando usuarios inactivos...');
    await prisma.usuario.updateMany({
      where: { activo: false },
      data: { activo: true }
    });
    console.log('✅ Todos los usuarios han sido ACTIVADOS en la BD.');
  }
}

checkAllUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
