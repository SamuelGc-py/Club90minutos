// Envía UN afiche real (no modo prueba) al destinatario del afiche, para comprobar el proveedor.
// Uso: npx tsx --env-file=.env scripts/probar-afiche-real.ts
import { enviarAficheTabla, destinatariosAfiche } from "../src/lib/aficheCorreo";
import { prisma } from "../src/lib/db";
(async () => {
  delete process.env.CORREO_MODO_PRUEBA;
  const r = await enviarAficheTabla([], { clave: `afiche-prueba-real:${Date.now()}`, para: destinatariosAfiche() });
  console.log("destinatarios:", destinatariosAfiche().join(", "), "→", JSON.stringify(r));
  await prisma.$disconnect();
  process.exit(r.ok ? 0 : 1);
})();
