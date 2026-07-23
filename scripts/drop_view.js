const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Eliminando TODAS las vistas de pgAdmin en public schema...");
  await prisma.$executeRawUnsafe(`
    DO $$ DECLARE 
        r RECORD; 
    BEGIN 
        FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP 
            EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE'; 
        END LOOP; 
    END $$;
  `);
  console.log("Todas las vistas han sido eliminadas.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
