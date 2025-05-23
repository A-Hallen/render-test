/**
 * Servicio para obtener información de oficinas
 */

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
      const response = await fetch('/api/oficinas');
      
      if (!response.ok) {
        throw new Error(`Error al obtener oficinas: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.oficinas || [];
    } catch (error) {
      console.error('Error al cargar oficinas:', error);
      return [];
    }
  }
}
