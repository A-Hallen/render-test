/**
 * Script para iniciar el servicio de sincronizaciu00f3n entre MySQL y Firebase
 * Este script puede ejecutarse como un proceso independiente o programarse con cron
 */

import { sincronizacionService } from '../database/SincronizacionService';

// Expresiu00f3n cron para sincronizaciu00f3n (por defecto cada 15 minutos)
const CRON_EXPRESSION = process.env.SYNC_CRON_EXPRESSION || '*/15 * * * *';

console.log('Iniciando servicio de sincronizaciu00f3n programada...');

// Iniciar sincronizaciu00f3n programada
sincronizacionService.iniciarSincronizacionProgramada(CRON_EXPRESSION);

// Manejar senu00f1ales de terminaciu00f3n
process.on('SIGINT', async () => {
  console.log('Recibida senu00f1al SIGINT, cerrando servicio...');
  await sincronizacionService.cerrar();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Recibida senu00f1al SIGTERM, cerrando servicio...');
  await sincronizacionService.cerrar();
  process.exit(0);
});

console.log(`Servicio de sincronizaciu00f3n iniciado con expresiu00f3n cron: ${CRON_EXPRESSION}`);
console.log('Presiona Ctrl+C para detener el servicio');
