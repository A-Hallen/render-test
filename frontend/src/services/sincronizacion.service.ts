/**
 * Servicio para gestionar la sincronización de datos
 * Utiliza el cliente HTTP centralizado para manejar automáticamente
 * tokens y errores de autenticación
 */

import { httpClient } from './httpClient';

// Interfaz para el estado de sincronización
export interface EstadoSincronizacion {
  enProceso: boolean;
  ultimaSincronizacion: string;
  programada: boolean;
  expresionCron: string;
}

// Interfaz para la respuesta de iniciar sincronización
export interface RespuestaSincronizacion {
  mensaje: string;
  exito: boolean;
}

/**
 * Obtiene el estado actual de la sincronización
 * @returns Estado de la sincronización
 */
export async function obtenerEstadoSincronizacion(): Promise<EstadoSincronizacion> {
  try {
    return await httpClient.get('/api/sincronizacion/estado');
  } catch (error) {
    console.error('Error al obtener estado de sincronización:', error);
    throw new Error('Error al obtener estado de sincronización');
  }
}

/**
 * Inicia una sincronización manual
 * @param completa Si es true, realiza una sincronización completa
 * @returns Respuesta de la operación
 */
export async function iniciarSincronizacion(completa: boolean): Promise<RespuestaSincronizacion> {
  try {
    return await httpClient.post('/api/sincronizacion/iniciar', { forzarCompleta: completa });
  } catch (error) {
    console.error('Error al iniciar sincronización:', error);
    throw new Error('Error al iniciar sincronización');
  }
}

/**
 * Configura la sincronización programada
 * @param expresionCron Expresión cron para la programación
 * @param activa Si es true, activa la sincronización programada
 * @returns Respuesta de la operación
 */
export async function configurarSincronizacionProgramada(
  expresionCron: string,
  activa: boolean
): Promise<RespuestaSincronizacion> {
  try {
    return await httpClient.post('/api/sincronizacion/programar', { expresionCron, activa });
  } catch (error) {
    console.error('Error al configurar sincronización programada:', error);
    throw new Error('Error al configurar sincronización programada');
  }
}
