const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- CONSULTANDO USUARIOS EN POSTGRESQL ---");
  const usuarios = await prisma.usuario.findMany();
  
  const usuarioSamuel = usuarios.find(u => 
    u.correo.toLowerCase().includes('samucobaggg')
  );

  if (!usuarioSamuel) {
    console.log("⚠️ No se encontró el usuario samucobaggg@gmail.com.");
    return;
  }

  console.log("✅ Usuario a conservar:", usuarioSamuel.nombre_completo, "-", usuarioSamuel.correo);

  const idsABorrar = usuarios.filter(u => u.id !== usuarioSamuel.id).map(u => u.id);
  console.log("Eliminando usuarios con IDs:", idsABorrar);

  if (idsABorrar.length > 0) {
    // 1. Obtener predicciones iniciales de los usuarios a borrar
    const predsIniciales = await prisma.prediccionInicial.findMany({
      where: { usuario_id: { in: idsABorrar } },
      select: { id: true }
    });
    const predsInicialesIds = predsIniciales.map(p => p.id);

    // 2. Eliminar clasificados predichos
    if (predsInicialesIds.length > 0) {
      await prisma.prediccionClasificado.deleteMany({
        where: { prediccion_inicial_id: { in: predsInicialesIds } }
      });
    }

    // 3. Eliminar predicciones iniciales
    await prisma.prediccionInicial.deleteMany({
      where: { usuario_id: { in: idsABorrar } }
    });

    // 4. Eliminar predicciones de partido
    await prisma.prediccionPartido.deleteMany({
      where: { usuario_id: { in: idsABorrar } }
    });

    // 5. Eliminar pagos
    await prisma.pago.deleteMany({
      where: { usuario_id: { in: idsABorrar } }
    });

    // 6. Eliminar bitacora auditoria si existiera
    await prisma.bitacoraAuditoria.deleteMany({
      where: { usuario_admin_id: { in: idsABorrar } }
    });

    // 7. Eliminar usuarios
    await prisma.usuario.deleteMany({
      where: { id: { in: idsABorrar } }
    });

    console.log("🎉 Todos los demás usuarios han sido borrados de la base de datos.");
  } else {
    console.log("No había otros usuarios para eliminar.");
  }

  // Asegurar que la cuenta de Samuel esté activa
  await prisma.usuario.update({
    where: { id: usuarioSamuel.id },
    data: { activo: true, estado_pago: 'validado' }
  });
  console.log(`✅ La cuenta (${usuarioSamuel.correo}) está ACTIVA y HABILITADA.`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
