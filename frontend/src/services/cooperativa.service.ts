import { CooperativaDTO } from 'shared/src/types/cooperativa.types';
import { httpClient } from './httpClient';

/**
 * Obtiene la información básica de la cooperativa (acceso público)
 * @returns Información básica de la cooperativa
 */
export const obtenerInfoPublicaCooperativa = async (): Promise<CooperativaDTO> => {
  try {
    const response = await httpClient.get('/api/cooperativa/public');
    return response;
  } catch (error) {
    console.error('Error al obtener información pública de la cooperativa:', error);
    throw error;
  }
};

/**
 * Obtiene la información completa de la cooperativa (requiere autenticación)
 * @returns Información completa de la cooperativa
 */
export const obtenerCooperativa = async (): Promise<CooperativaDTO> => {
  try {
    const response = await httpClient.get('/api/cooperativa');
    console.log("datos de la respuesta a la llamada a obtener cooperativa", response);
    return response;
  } catch (error) {
    console.error('Error al obtener información de la cooperativa:', error);
    throw error;
  }
};

/**
 * Actualiza la información de la cooperativa (requiere autenticación y rol de administrador)
 * @param data Datos a actualizar
 * @returns Información actualizada de la cooperativa
 */
export const actualizarCooperativa = async (data: Partial<CooperativaDTO>): Promise<CooperativaDTO> => {
  try {
    const response = await httpClient.put('/api/cooperativa', data);
    return response;
  } catch (error) {
    console.error('Error al actualizar información de la cooperativa:', error);
    throw error;
  }
};
