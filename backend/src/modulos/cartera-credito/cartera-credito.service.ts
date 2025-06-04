import { CarteraCreditoResponse } from 'shared';
import { CarteraCreditoRepository } from './cartera-credito.repository';

export class CarteraCreditoService {
  private carteraCreditoRepository: CarteraCreditoRepository;

  constructor() {
    this.carteraCreditoRepository = new CarteraCreditoRepository();
  }

  /**
   * Obtiene la información de la cartera de crédito actual
   * @param codigoOficina Código de la oficina para la cual obtener los datos ('CNS' para todas)
   * @returns Objeto con la información de la cartera de crédito
   */
  async obtenerCarteraCredito(codigoOficina: string): Promise<CarteraCreditoResponse> {
    try {
      console.log('[CarteraCreditoService] Obteniendo información de cartera de crédito');
      
      const cartera = await this.carteraCreditoRepository.obtenerCarteraCredito(codigoOficina);
      
      if (!cartera) {
        console.log('[CarteraCreditoService] No se encontró información de cartera de crédito');
        return {
          carteraActual: {
            fecha: new Date().toISOString().split('T')[0],
            monto: 0
          },
          mensaje: 'No se encontraron datos de cartera de crédito'
        };
      }
      
      console.log(`[CarteraCreditoService] Cartera obtenida: ${JSON.stringify(cartera)}`);
      
      return {
        carteraActual: cartera,
        mensaje: 'Información de cartera de crédito obtenida correctamente'
      };
    } catch (error: any) {
      console.error(`[CarteraCreditoService] Error al obtener cartera de crédito: ${error.message}`);
      
      return {
        carteraActual: {
          fecha: new Date().toISOString().split('T')[0],
          monto: 0
        },
        mensaje: `Error al obtener información de cartera de crédito: ${error.message}`
      };
    }
  }
}
