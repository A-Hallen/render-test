/**
 * Servicio para gestionar datos generales de la aplicación
 * Utiliza el cliente HTTP centralizado para manejar automáticamente
 * tokens y errores de autenticación
 */

import { httpClient } from './httpClient';
import { OficinasDTO } from 'shared/src/types/oficinas.types';

/**
 * Obtiene datos de un endpoint específico con parámetros opcionales
 * @param endpoint Endpoint de la API (sin el prefijo /api/)
 * @param params Parámetros de consulta opcionales
 * @returns Datos obtenidos del endpoint
 */
export async function fetchData(endpoint: string, params?: Record<string, string>) {
  try {
    return await httpClient.get(`/api/${endpoint}`, {}, params);
  } catch (error) {
    console.error(`Error al obtener datos de ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Obtiene la lista de oficinas
 * @returns Lista de oficinas
 */
export async function obtenerOficinas(): Promise<OficinasDTO[]> {
  try {
    const response = await httpClient.get('/api/oficinas');
    return response.oficinas || [];
  } catch (error) {
    console.error('Error al obtener oficinas:', error);
    return [];
  }
}
