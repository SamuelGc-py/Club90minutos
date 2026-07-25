const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plantillas = {
  "América de Cali": [
    "Juan Montoya",
    "Jean Fernandes",
    "Yhormar Hurtado",
    "Brayan Córdoba",
    "Marlon Torres",
    "Daniel Rosero",
    "Mateo Castillo",
    "Marcos Mina",
    "Brayan Correa",
    "Nicolás Hernández",
    "Cristian Tovar",
    "Luis Miguel Mina",
    "Omar Bertel",
    "Yani Quintero",
    "Josen Escobar",
    "Jose Cavadia",
    "Yeison Guzmán",
    "Rafael Carrascal",
    "Carlos Sierra",
    "Luis Quiñónes",
    "Edson Tortolero",
    "Jhon Murillo",
    "Dylan Borrero",
    "Daniel Valencia",
    "Jan Lucumi",
    "Jhon Palacios",
    "Adrian Ramos",
    "Tomas Ángel"
  ],
  "Independiente Santa Fe": [
    "Andrés Mosquera",
    "Weimar Asprilla",
    "Kevin Balanta",
    "Juan Quintero",
    "Victor Moreno",
    "Mateo Puerta",
    "Helibelton Palacios",
    "Luis Palacios",
    "Iván Scarpeta",
    "Emmanuel Olivera",
    "Jeison Angulo",
    "Christian Mafla",
    "Leandro Angulo",
    "Kilian Toscano",
    "Jhojan Torres",
    "Alexis Zapata",
    "Daniel Torres",
    "Yílmar Velásquez",
    "Ewil Murillo",
    "Omar Fernández",
    "Franco Fagúndez",
    "Hugo Rodallega",
    "Maximiliano Lovera",
    "Nahuel Bustos",
    "Jáder Obrian"
  ],
  "Once Caldas": [
    "Juan Gallego",
    "Joan Parra",
    "Daniel Londoño",
    "Andres Correa",
    "Léyder Morán",
    "Jorge Cardona",
    "Efrain Navarro",
    "Juan Castaño",
    "Jeider Riquett",
    "Juan David Cuesta",
    "Juan Patiño",
    "Juan Pablo Nieto",
    "Andrés Colorado",
    "Jaime Alvarado",
    "Andres Roa",
    "Jader Quiñónes",
    "Edwin Torres",
    "Luis Felipe Gómez",
    "John Deiby Araujo",
    "Michael Barrios",
    "Jefry Zapata",
    "Dayro Moreno",
    "Mateo Zuleta"
  ],
  "Águilas Doradas": [
    "Jorge Soto",
    "Andrés Mosquera",
    "John Ontaneda",
    "John García",
    "Cristian Blanco",
    "Andrés Álvarez",
    "Alberto Higgins",
    "Dylan Lozano",
    "Nicolás Lara",
    "Javier Mena",
    "Iván Rojas",
    "Junior Noguera",
    "Andrés Ricaurte",
    "Jaen Pineda",
    "Frank Lozano",
    "Juan Avalo",
    "Juan Roa",
    "Royner Benítez",
    "Ricardo Márquez",
    "Antony Vásquez",
    "Jhon Melendez",
    "Eduar Arizalas",
    "Fabian Charales",
    "Carlos Rojas"
  ],
  "Alianza FC": [
    "Johan Wallens",
    "Juan Camilo Chaverra",
    "Eduar Esteban",
    "Israel Alba",
    "Kevin Moreno",
    "Pedro Franco",
    "Leonardo Saldaña",
    "Yilson Rosales",
    "Jesus Figueroa",
    "Juan Viveros",
    "Eduard Banguero",
    "Jhildrey Lasso",
    "Ever Meza",
    "Jair Castillo",
    "Wiston Fernández",
    "Carlos Villegas",
    "Carlos Esparragoza",
    "Fabián Cantillo",
    "Josy Pérez",
    "Diego Torres",
    "Leyner Palacios",
    "Jesus Munoz",
    "Sergio Aponza",
    "Felipe Pardo",
    "Francesco Fiorelli",
    "Misael Martínez",
    "Yeiner Londoño",
    "Ayron Del Valle"
  ],
  "Fortaleza CEIF": [
    "Michael Barragan",
    "David Ramírez",
    "Jonathan Marulanda",
    "Yesid Díaz",
    "Santiago Cuero",
    "Joan Cajares",
    "Jhon Balanta",
    "Sebastian Navarro",
    "Jhon Velásquez",
    "Leonardo Pico",
    "Kevin Balanta",
    "Cristian Orozco",
    "Sebastian Ramirez",
    "Jerónimo Barrera",
    "Jhon Solis",
    "Jhonier Blanco",
    "Italo Montaño",
    "Sebastián Herrera",
    "Andres Amaya",
    "Franco Pulicastro",
    "Jhoiner Salas",
    "Richardson Rivas",
    "Andy Batioja"
  ]
};

async function main() {
  for (const [nombreEquipo, jugadores] of Object.entries(plantillas)) {
    const equipo = await prisma.equipo.findUnique({ where: { nombre: nombreEquipo } });
    if (!equipo) {
      console.error(`Equipo no encontrado: ${nombreEquipo}`);
      continue;
    }

    console.log(`Cargando ${jugadores.length} jugadores para ${nombreEquipo}...`);
    for (const nombreJugador of jugadores) {
      await prisma.jugador.create({
        data: {
          nombre: nombreJugador.trim(),
          equipo_id: equipo.id
        }
      });
    }
  }
  console.log("Carga de plantillas completada con éxito.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
