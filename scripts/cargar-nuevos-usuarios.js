const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const nuevosUsuarios = [
  { correo: 'ricardo101228@gmail.com', nombre_completo: 'Ricardo Vanegas', rol_id: 1, activo: true },
  { correo: 'nelson.berdugo05@gmail.com', nombre_completo: 'Nelson Berdugo de los Reyes', rol_id: 1, activo: true },
  { correo: 'iangelbarrios16@gmail.com', nombre_completo: 'Ignacio Barrios', rol_id: 1, activo: true },
  { correo: 'hberdugodelosreyes0@gmail.com', nombre_completo: 'Harold Berdugo', rol_id: 1, activo: true },
  { correo: 'pedrocanterojr@gmail.com', nombre_completo: 'Pedro Cantero', rol_id: 1, activo: true },
  { correo: 'ricardosotogom@gmail.com', nombre_completo: 'ricardo soto gomez', rol_id: 1, activo: true },
  { correo: 'juanhermon24@gmail.com', nombre_completo: 'Juan David Hernandez Montalvo', rol_id: 1, activo: true },
  { correo: 'pipedeltoro@hotmail.com', nombre_completo: 'Andres Del Toro', rol_id: 1, activo: true },
  { correo: 'rene26203@gmail.com', nombre_completo: 'Rene Osorio', rol_id: 1, activo: true },
  { correo: 'andradeferrer@hotmai.com', nombre_completo: 'Erick Andrade', rol_id: 1, activo: true }
];

async function main() {
  console.log("Iniciando carga de usuarios nuevos...");

  // 1. Agregar usuarios
  for (const user of nuevosUsuarios) {
    await prisma.usuario.upsert({
      where: { correo: user.correo },
      update: { nombre_completo: user.nombre_completo, activo: true },
      create: user
    });
    console.log(`Usuario agregado: ${user.correo}`);
  }

  // 2. Borrar pronósticos (lo que tenía) samucobaggg@gmail.com
  console.log("Borrando pronósticos de samucobaggg@gmail.com...");
  const admin = await prisma.usuario.findUnique({
    where: { correo: 'samucobaggg@gmail.com' }
  });

  if (admin) {
    // Borrar predicciones de partidos
    await prisma.prediccionPartido.deleteMany({
      where: { usuario_id: admin.id }
    });
    
    // Buscar la predicción inicial para borrar sus clasificados
    const prediccionInicial = await prisma.prediccionInicial.findUnique({
      where: { usuario_id: admin.id }
    });

    if (prediccionInicial) {
      // Borrar clasificados
      await prisma.prediccionClasificado.deleteMany({
        where: { prediccion_inicial_id: prediccionInicial.id }
      });
      // Borrar prediccion inicial
      await prisma.prediccionInicial.delete({
        where: { id: prediccionInicial.id }
      });
    }
    console.log("Pronósticos borrados exitosamente para samucobaggg@gmail.com. El usuario se mantiene como Admin.");
  } else {
    console.log("samucobaggg no encontrado.");
  }

  console.log("¡Proceso completado!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
