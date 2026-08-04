const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plantillasAdicionales = {
  "América de Cali": [
    "Juan Montoya", "Jean Fernandes", "Yhormar Hurtado", "Brayan Córdoba", "Marlon Torres",
    "Daniel Rosero", "Mateo Castillo", "Marcos Mina", "Brayan Correa", "Nicolás Hernández",
    "Cristian Tovar", "Luis Miguel Mina", "Omar Bertel", "Yani Quintero", "Josen Escobar",
    "Jose Cavadia", "Yeison Guzmán", "Rafael Carrascal", "Carlos Sierra", "Luis Quiñónes",
    "Edson Tortolero", "Jhon Murillo", "Dylan Borrero", "Daniel Valencia", "Jan Lucumi",
    "Jhon Palacios", "Adrian Ramos", "Tomas Ángel"
  ],
  "Independiente Santa Fe": [
    "Andrés Mosquera", "Weimar Asprilla", "Kevin Balanta", "Juan Quintero", "Victor Moreno",
    "Mateo Puerta", "Helibelton Palacios", "Luis Palacios", "Iván Scarpeta", "Emmanuel Olivera",
    "Jeison Angulo", "Christian Mafla", "Leandro Angulo", "Kilian Toscano", "Jhojan Torres",
    "Alexis Zapata", "Daniel Torres", "Yílmar Velásquez", "Ewil Murillo", "Omar Fernández",
    "Franco Fagúndez", "Hugo Rodallega", "Maximiliano Lovera", "Nahuel Bustos", "Jáder Obrian"
  ],
  "Once Caldas DAF": [
    "Juan Gallego", "Joan Parra", "Daniel Londoño", "Andres Correa", "Léyder Morán",
    "Jorge Cardona", "Efrain Navarro", "Juan Castaño", "Jeider Riquett", "Juan David Cuesta",
    "Juan Patiño", "Juan Pablo Nieto", "Andrés Colorado", "Jaime Alvarado", "Andres Roa",
    "Jader Quiñónes", "Edwin Torres", "Luis Felipe Gómez", "John Deiby Araujo", "Michael Barrios",
    "Jefry Zapata", "Dayro Moreno", "Mateo Zuleta"
  ],
  "Águilas Doradas": [
    "Jorge Soto", "Andrés Mosquera", "John Ontaneda", "John García", "Cristian Blanco",
    "Andrés Álvarez", "Alberto Higgins", "Dylan Lozano", "Nicolás Lara", "Javier Mena",
    "Iván Rojas", "Junior Noguera", "Andrés Ricaurte", "Jaen Pineda", "Frank Lozano",
    "Juan Avalo", "Juan Roa", "Royner Benítez", "Ricardo Márquez", "Antony Vásquez",
    "Jhon Melendez", "Eduar Arizalas", "Fabian Charales", "Carlos Rojas"
  ],
  "Alianza Valledupar F.C.": [
    "Johan Wallens", "Juan Camilo Chaverra", "Eduar Esteban", "Israel Alba", "Kevin Moreno",
    "Pedro Franco", "Leonardo Saldaña", "Yilson Rosales", "Jesus Figueroa", "Juan Viveros",
    "Eduard Banguero", "Jhildrey Lasso", "Ever Meza", "Jair Castillo", "Wiston Fernández",
    "Carlos Villegas", "Carlos Esparragoza", "Fabián Cantillo", "Josy Pérez", "Diego Torres",
    "Leyner Palacios", "Jesus Munoz", "Sergio Aponza", "Felipe Pardo", "Francesco Fiorelli",
    "Misael Martínez", "Yeiner Londoño", "Ayron Del Valle"
  ],
  "Fortaleza": [
    "Michael Barragan", "David Ramírez", "Jonathan Marulanda", "Yesid Díaz", "Santiago Cuero",
    "Joan Cajares", "Jhon Balanta", "Sebastian Navarro", "Jhon Velásquez", "Leonardo Pico",
    "Kevin Balanta", "Cristian Orozco", "Sebastian Ramirez", "Jerónimo Barrera", "Jhon Solis",
    "Jhonier Blanco", "Italo Montaño", "Sebastián Herrera", "Andres Amaya", "Franco Pulicastro",
    "Jhoiner Salas", "Richardson Rivas", "Andy Batioja"
  ],
  "Cúcuta Deportivo": [
    "Eduar Esteban", "Juan David Ramírez", "Hernán Pertuz", "Alexander Borja", "Kevin Moreno",
    "Mauricio Duarte", "Israel Alba", "Bayron Suaza", "Cristian Álvarez", "Santiago Guzmán",
    "Lucas Ríos", "Jonathan Agudelo", "Jefry Zapata", "Stiven Monsalve", "Valentín Robaldo",
    "Felipe Gómez", "Camilo Mancilla", "Juan Camilo Moreno", "Bladimir Angulo", "Jaime Peralta",
    "Johan Montes", "Diego Luque", "William Parra", "Federico Arbeláez", "Léider Berdugo"
  ],
  "Internacional de Bogotá": [
    "Juan Camilo Loaiza", "Manuel Arteaga", "Stiven Valencia", "Kalizan Morán", "Pedro Rodríguez",
    "Carlos Mario Pájaro", "Jhonier Murillo", "David Contreras", "Facundo Monín", "Johan Gamboa",
    "Juan José Salcedo", "Kener Valencia", "Fabián Carabali", "Jose Leudo", "Maicol Sequeda",
    "Mauricio González", "Emerson Lasso", "Santiago Acha", "Jean Carlos Colorado", "Yílber Arboleda",
    "Victor Lasso", "Eider Rasero", "Lewis Guette", "Edwin Laszo"
  ]
};

async function main() {
  console.log("Comprobando y completando plantillas para los 20 equipos...");

  for (const [nombreEquipo, jugadores] of Object.entries(plantillasAdicionales)) {
    const equipo = await prisma.equipo.findFirst({
      where: { nombre: { contains: nombreEquipo.split(" ")[0], mode: "insensitive" } }
    });

    if (!equipo) {
      console.error(`❌ Equipo no encontrado en DB: ${nombreEquipo}`);
      continue;
    }

    const countActual = await prisma.jugador.count({ where: { equipo_id: equipo.id } });
    
    console.log(`Revisando jugadores para ${equipo.nombre} (ID ${equipo.id}). Actualmente tiene ${countActual} jugadores...`);
    let agregados = 0;
    for (const nombreJugador of jugadores) {
      const nombreLimpio = nombreJugador.trim();
      const existe = await prisma.jugador.findFirst({
        where: { nombre: nombreLimpio, equipo_id: equipo.id }
      });
      if (!existe) {
        await prisma.jugador.create({
          data: { nombre: nombreLimpio, equipo_id: equipo.id }
        });
        agregados++;
      }
    }
    console.log(`✅ ${agregados} NUEVOS jugadores ingresados en ${equipo.nombre}.`);
  }

  // Verificación final
  const totalEquipos = await prisma.equipo.findMany({
    include: { _count: { select: { jugadores: true } } },
    orderBy: { id: "asc" }
  });

  console.log("\n=== ESTADO FINAL DE PLANTILLAS POR EQUIPO ===");
  let totalJugadores = 0;
  totalEquipos.forEach(eq => {
    console.log(`ID ${eq.id}: ${eq.nombre} -> ${eq._count.jugadores} jugadores`);
    totalJugadores += eq._count.jugadores;
  });
  console.log(`\n🎉 TOTAL JUGADORES EN BASE DE DATOS: ${totalJugadores}`);
}

main()
  .catch(e => console.error("Error cargando plantillas:", e))
  .finally(() => prisma.$disconnect());
