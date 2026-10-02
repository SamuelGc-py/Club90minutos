# Automatizaciones y estadísticas (octubre 2026)

## Qué hace cada pieza

| Función | Dónde | Estado en producción |
| --- | --- | --- |
| Reloj interno (cada 5 min): liquidación + recordatorios | `src/instrumentation.ts`, `src/instrumentation-node.ts` | Activo. Apagar con `TAREAS_PROGRAMADAS=0`. |
| Liquidación automática con ESPN | `src/lib/liquidacionAutomatica.ts` | Activa. Ahora corre aunque nadie tenga el sitio abierto. Reporta los partidos "aplazados" que ESPN ya da por jugados (no los liquida: el admin los pasa a programado). |
| Recordatorio diario 09:00 (Bogotá) | `src/lib/recordatorios.ts` | **Pendiente** (sin proveedor de correo). |
| Afiche de la tabla por correo tras cada liquidación | `src/lib/aficheTabla.tsx`, `src/lib/aficheCorreo.ts` | **Pendiente** (sin proveedor de correo). La vista previa funciona en el panel admin. |
| Anti-duplicados de envíos | `src/lib/registroEnvios.ts` (tabla `envio_automatico`, se crea sola) | Se crea al primer envío. |
| Puntos provisionales "si termina así" | `src/app/components/c90/provisional.ts` | Activo. |
| Ganador de la fecha | `ganadorDeFecha` en `src/app/components/c90/ranking.ts` | Activo (Mi jornada, Ranking por fecha, afiche). |
| Pestaña Estadísticas | `src/app/components/c90/EstadisticasView.tsx` | Activa. |

## Pendiente: activar los correos

1. Configurar un proveedor en las variables de entorno de Hostinger:
   - SMTP: `GMAIL_USER` + `GMAIL_PASS` (contraseña de aplicación). Para Hostinger Email, además `SMTP_HOST`/`SMTP_PORT`.
   - o Resend: `RESEND_API_KEY` + dominio verificado + `CORREO_REMITENTE` (p. ej. `Club 90 Minutos <avisos@club90minutos.com>`).
     Con el remitente de pruebas `onboarding@resend.dev` Resend solo entrega al dueño de la cuenta.
2. Activar: `CORREOS_AUTOMATICOS=1`.
3. Opcionales: `AFICHE_DESTINATARIOS` (por defecto juanhermon24@gmail.com), `RECORDATORIO_HORA` (por defecto 9),
   `RECORDATORIOS_ACTIVOS=0` / `AFICHE_AUTOMATICO=0` para apagar cada uno.
4. Revisar en el panel admin (Liquidación → Correos automáticos) y usar "Enviar afiche ahora" para probar.

WhatsApp no está implementado: requiere la API oficial de WhatsApp Business (cuenta de Meta verificada, número dedicado y
plantilla aprobada para mensajes iniciados por el negocio).

## Pruebas locales

- `CORREO_MODO_PRUEBA=1` en `.env.local`: los correos se guardan en `.correos-prueba/` en vez de enviarse.
- `npx tsx scripts/verificar-espn.ts [diasAtras] [diasAdelante]`: cruce con ESPN, solo lectura.
- `npx tsx scripts/probar-provisional.ts`: casos de los puntos provisionales.
