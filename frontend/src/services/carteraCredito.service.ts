import { CarteraCreditoResponse } from 'shared/src/types/cartera-credito.types';

/**
 * Servicio para gestionar la cartera de crédito
 */
export const CarteraCreditoService = {
  /**
   * Obtiene la información actual de la cartera de crédito
   * @returns Promesa con la respuesta de la cartera de crédito
   */
  async obtenerCarteraCredito(codigoOficina: string = 'CNS'): Promise<CarteraCreditoResponse> {
    try {
      const response = await fetch(`/api/cartera-credito?oficina=${encodeURIComponent(codigoOficina)}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      return await response.json() as CarteraCreditoResponse;
    } catch (error) {
      console.error('Error al obtener la cartera de crédito:', error);
      // Devolver un objeto con valores predeterminados en caso de error
      return {
        carteraActual: {
          fecha: new Date().toISOString().split('T')[0],
          monto: 0
        },
        mensaje: 'Error al obtener la información de la cartera de crédito'
      };
    }
  }
};
