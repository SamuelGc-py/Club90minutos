import { prisma } from "@/lib/db";

/**
 * REGISTRO DE ENVÍOS AUTOMÁTICOS (anti-duplicados)
 * ================================================
 * Cada correo automático se "reserva" con una clave única (p. ej.
 * "recordatorio:2026-10-03:37") ANTES de enviarse. Si la clave ya existe, otro proceso
 * (o una ejecución anterior) ya lo envió y no se repite: funciona aunque el servidor se
 * reinicie o haya dos instancias. Si el envío falla, la reserva se libera para reintentar.
 *
 * La tabla se crea sola (CREATE TABLE IF NOT EXISTS) en el primer uso: no requiere
 * migración previa y no toca ninguna tabla existente. Se usa SQL directo a propósito,
 * para no depender de regenerar el cliente de Prisma.
 */

let tablaLista: Promise<void> | null = null;

function asegurarTabla(): Promise<void> {
  if (!tablaLista) {
    tablaLista = prisma
      .$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS envio_automatico (
           id SERIAL PRIMARY KEY,
           clave TEXT NOT NULL UNIQUE,
           tipo TEXT NOT NULL,
           destinatario TEXT,
           detalle TEXT,
           creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
         )`
      )
      .then(() => undefined)
      .catch((e) => {
        tablaLista = null; // reintentar en la próxima llamada
        throw e;
      });
  }
  return tablaLista;
}

/** Reserva la clave. true = este proceso debe enviar; false = ya se envió (o lo está enviando otro). */
export async function reservarEnvio(clave: string, tipo: string, destinatario?: string, detalle?: string): Promise<boolean> {
  await asegurarTabla();
  const filas = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `INSERT INTO envio_automatico (clave, tipo, destinatario, detalle)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (clave) DO NOTHING
     RETURNING id`,
    clave,
    tipo,
    destinatario ?? null,
    detalle ?? null
  );
  return filas.length > 0;
}

/** Libera una reserva (el envío falló) para que se pueda reintentar. */
export async function liberarEnvio(clave: string): Promise<void> {
  await asegurarTabla();
  await prisma.$executeRawUnsafe(`DELETE FROM envio_automatico WHERE clave = $1`, clave);
}

export async function yaEnviado(clave: string): Promise<boolean> {
  await asegurarTabla();
  const filas = await prisma.$queryRawUnsafe<{ id: number }[]>(`SELECT id FROM envio_automatico WHERE clave = $1`, clave);
  return filas.length > 0;
}

export async function ultimosEnvios(limite = 30) {
  await asegurarTabla();
  return prisma.$queryRawUnsafe<{ clave: string; tipo: string; destinatario: string | null; detalle: string | null; creado_en: Date }[]>(
    `SELECT clave, tipo, destinatario, detalle, creado_en FROM envio_automatico ORDER BY creado_en DESC LIMIT $1`,
    limite
  );
}
