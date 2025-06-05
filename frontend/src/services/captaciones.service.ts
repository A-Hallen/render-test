import { CaptacionResponse } from 'shared';
import { httpClient } from './httpClient';

const API_URL = '/api/captaciones';

export async function getCaptacionesVista(codigoOficina: string = 'CNS'): Promise<CaptacionResponse> {
  try {
    return await httpClient.get(`${API_URL}/vista`, {}, { oficina: codigoOficina });
  } catch (error) {
    console.error('Error al obtener captaciones a la vista:', error);
    throw new Error('Error al obtener captaciones a la vista');
  }
}

export async function getCaptacionesPlazo(codigoOficina: string = 'CNS'): Promise<CaptacionResponse> {
  try {
    return await httpClient.get(`${API_URL}/plazo`, {}, { oficina: codigoOficina });
  } catch (error) {
    console.error('Error al obtener captaciones a plazo:', error);
    throw new Error('Error al obtener captaciones a plazo');
  }
}
