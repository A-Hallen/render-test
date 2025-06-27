/**
 * Servicio para gestionar la sincronización de datos
 * Utiliza el cliente HTTP centralizado para manejar automáticamente
 * tokens y errores de autenticación
 */

import { RespuestaEstadoSincronizacion, RespuestaHistorialSincronizacion } from 'shared';
import { httpClient } from './httpClient';

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
 * Obtiene el estado actual de la sincronización
 * @returns Estado de la sincronización
 */
export async function obtenerEstadoSincronizacion(): Promise<RespuestaEstadoSincronizacion> {
  try {
    const estado = await httpClient.get('/api/sincronizacion/contabilidad/estado');
    return estado;
  } catch (error) {
    console.error('Error al obtener estado de sincronización:', error);
    throw new Error('Error al obtener estado de sincronización');
  }
}

/**
 * Obtiene el historial de sincronizaciones
 * @returns Lista de registros de sincronización
 */
export async function obtenerHistorialSincronizacion(): Promise<RespuestaHistorialSincronizacion> {
  try {
    return await httpClient.get('/api/sincronizacion/contabilidad/historial');
  } catch (error) {
    console.error('Error al obtener historial de sincronización:', error);
    throw new Error('Error al obtener historial de sincronización');
  }
}

/**
 * Inicia el proceso de sincronización
 * @returns Respuesta de la operación
 */
export async function iniciarSincronizacion(): Promise<RespuestaSincronizacion> {
  try {
    return await httpClient.post('/api/sincronizacion/contabilidad/iniciar', {});
  } catch (error) {
    console.error('Error al iniciar sincronización:', error);
    throw new Error('Error al iniciar sincronización');
  }
}

/**
 * Pausa el proceso de sincronización
 * @returns Respuesta de la operación
 */
export async function pausarSincronizacion(): Promise<RespuestaSincronizacion> {
  try {
    return await httpClient.post('/api/sincronizacion/contabilidad/pausar', {});
  } catch (error) {
    console.error('Error al pausar sincronización:', error);
    throw new Error('Error al pausar sincronización');
  }
}

/**
 * Detiene el proceso de sincronización
 * @returns Respuesta de la operación
 */
export async function detenerSincronizacion(): Promise<RespuestaSincronizacion> {
  try {
    return await httpClient.post('/api/sincronizacion/contabilidad/detener', {});
  } catch (error) {
    console.error('Error al detener sincronización:', error);
    throw new Error('Error al detener sincronización');
  }
}
