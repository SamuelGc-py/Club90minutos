// Reloj interno del servidor: ver src/instrumentation-node.ts.
// La importación condicional es el patrón de Next.js para que el bundle "edge" no incluya
// módulos de Node (nodemailer, fs).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { iniciarReloj } = await import("./instrumentation-node");
    await iniciarReloj();
  }
}
