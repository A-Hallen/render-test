/**
 * Servicio para obtener información de oficinas
 */
import { httpClient } from './httpClient';

export interface Oficina {
  codigo: string;
  nombre: string;
}

export class OficinasService {
  /**
   * Obtiene todas las oficinas disponibles
   * @returns Lista de oficinas
   */
  static async obtenerOficinas(): Promise<Oficina[]> {
    try {
      const data = await httpClient.get('/api/oficinas');
      return data.oficinas || [];
    } catch (error) {
      console.error('Error al cargar oficinas:', error);
      return [];
    }
  }
}
