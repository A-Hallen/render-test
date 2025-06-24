/**
 * Servicio para gestionar los indicadores financieros
 * Utiliza el cliente HTTP centralizado para manejar automáticamente
 * tokens y errores de autenticación
 */

import { httpClient } from './httpClient';

/**
 * Obtiene los indicadores financieros para un rango de fechas
 * @param codigoOficina Código de la oficina
 * @param fechaInicio Fecha de inicio en formato YYYY-MM-DD
 * @param fechaFin Fecha de fin en formato YYYY-MM-DD
 * @returns Datos de los indicadores financieros
 */
export async function obtenerIndicadoresPorRango(
  codigoOficina: string,
  fechaInicio: string,
  fechaFin: string
) {
  try {
    return await httpClient.get(
      `/api/kpi-contables/rango-fechas`, 
      {}, 
      { oficina: codigoOficina, fechaInicio, fechaFin }
    );
  } catch (error) {
    console.error('Error al obtener indicadores financieros por rango:', error);
    throw error;
  }
}

/**
 * Obtiene todos los indicadores financieros configurados
 * @returns Lista de indicadores financieros
 */
export async function obtenerIndicadoresContables() {
  try {
    return await httpClient.get('/api/indicadores-contables');
  } catch (error) {
    console.error('Error al obtener indicadores financieros:', error);
    throw error;
  }
}

/**
 * Actualiza un indicador contable
 * @param id ID del indicador
 * @param datos Datos actualizados del indicador
 * @returns Resultado de la actualización
 */
export async function actualizarIndicadorContable(id: string, datos: any) {
  try {
    return await httpClient.put(`/api/indicadores-contables/${id}`, datos);
  } catch (error) {
    console.error('Error al actualizar indicador contable:', error);
    throw error;
  }
}

/**
 * Crea un nuevo indicador contable
 * @param datos Datos del nuevo indicador
 * @returns Resultado de la creación
 */
export async function crearIndicadorContable(datos: any) {
  try {
    return await httpClient.post('/api/indicadores-contables', datos);
  } catch (error) {
    console.error('Error al crear indicador contable:', error);
    throw error;
  }
}

/**
 * Elimina un indicador contable
 * @param id ID del indicador a eliminar
 * @returns Resultado de la eliminación
 */
export async function eliminarIndicadorContable(id: string) {
  try {
    return await httpClient.delete(`/api/indicadores-contables/${id}`);
  } catch (error) {
    console.error('Error al eliminar indicador contable:', error);
    throw error;
  }
}

/**
 * Compara los indicadores financieros entre dos oficinas para una fecha específica
 * @param oficina1 Código de la primera oficina
 * @param oficina2 Código de la segunda oficina
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns Datos de la comparación de indicadores entre las dos oficinas
 */
export async function compararIndicadoresEntreOficinas(
  oficina1: string,
  oficina2: string,
  fecha: string
) {
  try {
    return await httpClient.get(
      `/api/kpi-contables/comparar-oficinas`, 
      {}, 
      { oficina1, oficina2, fecha }
    );
  } catch (error) {
    console.error('Error al comparar indicadores entre oficinas:', error);
    throw error;
  }
}
