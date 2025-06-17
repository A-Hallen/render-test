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

/**
 * Sube una imagen de logo para la cooperativa
 * @param imageFile Archivo de imagen a subir
 * @returns URL de la imagen subida y datos actualizados de la cooperativa
 */
export const subirLogoCooperativa = async (imageFile: File): Promise<{imageUrl: string, cooperativa: CooperativaDTO}> => {
  try {
    // Crear un objeto FormData para enviar el archivo
    const formData = new FormData();
    formData.append('logo', imageFile);
    
    // Usar el método upload del httpClient para manejar la subida de archivos
    const response = await httpClient.upload('/api/cooperativa/logo', formData);
    return response;
  } catch (error) {
    console.error('Error al subir logo de la cooperativa:', error);
    throw error;
  }
};
