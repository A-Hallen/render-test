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

// Interfaz para el progreso de exportación
export interface ProgresoExportacion {
  total: number;
  processed: number;
  success: number;
  failed: number;
  startTime: string | null;
  enProceso: boolean;
  porcentajeCompletado: number;
  tiempoTranscurrido: number;
}

// Interfaz para el estado de exportación contable
export interface EstadoExportacionContable {
  enProceso: boolean;
  ultimaExportacion: string | null;
  progreso: ProgresoExportacion;
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

/**
 * Inicia la exportación de datos contables a Firebase
 * @param fechaInicio Fecha de inicio en formato YYYY-MM-DD
 * @param fechaFin Fecha de fin en formato YYYY-MM-DD
 * @param guardarArchivos Si es true, guarda los archivos JSON en disco
 * @returns Respuesta de la operación
 */
export async function exportarDatosContables(
  fechaInicio: string,
  fechaFin: string,
  guardarArchivos: boolean = false
): Promise<RespuestaSincronizacion> {
  try {
    return await httpClient.post('/api/sincronizacion/contabilidad/exportar', {
      fechaInicio,
      fechaFin,
      guardarArchivos
    });
  } catch (error) {
    console.error('Error al iniciar exportación de datos contables:', error);
    throw new Error('Error al iniciar exportación de datos contables');
  }
}

/**
 * Obtiene el estado actual de la exportación de datos contables
 * @returns Estado de la exportación
 */
export async function obtenerEstadoExportacionContable(): Promise<{ exito: boolean; estado: EstadoExportacionContable }> {
  try {
    return await httpClient.get('/api/sincronizacion/contabilidad/estado');
  } catch (error) {
    console.error('Error al obtener estado de exportación contable:', error);
    throw new Error('Error al obtener estado de exportación contable');
  }
}
