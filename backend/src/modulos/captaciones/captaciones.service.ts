import { CaptacionResponse } from 'shared';
import { CaptacionesRepository } from './captaciones.repository';

export class CaptacionesService {
  private captacionesRepository: CaptacionesRepository;

  constructor() {
    this.captacionesRepository = new CaptacionesRepository();
  }

  /**
   * Obtiene la información de captaciones a la vista
   * @param codigoOficina Código de la oficina para la cual obtener los datos
   * @returns Objeto con la información de captaciones a la vista
   */
  async obtenerCaptacionesVista(codigoOficina: string): Promise<CaptacionResponse> {
    try {
      console.log(`[CaptacionesService] Obteniendo información de captaciones a la vista para oficina: ${codigoOficina}`);
      
      const captacion = await this.captacionesRepository.obtenerCaptaciones(codigoOficina, 'vista');
      
      if (!captacion) {
        console.log('[CaptacionesService] No se encontró información de captaciones a la vista');
        return {
          captacionActual: {
            fecha: new Date().toISOString().split('T')[0],
            monto: 0,
            tipoCaptacion: 'vista',
            codigoCuenta: '2101'
          },
          mensaje: 'No se encontraron datos de captaciones a la vista'
        };
      }
      
      return {
        captacionActual: captacion
      };
    } catch (error) {
      console.error('[CaptacionesService] Error al obtener captaciones a la vista:', error);
      throw error;
    }
  }

  /**
   * Obtiene la información de captaciones a plazo
   * @param codigoOficina Código de la oficina para la cual obtener los datos
   * @returns Objeto con la información de captaciones a plazo
   */
  async obtenerCaptacionesPlazo(codigoOficina: string): Promise<CaptacionResponse> {
    try {
      console.log(`[CaptacionesService] Obteniendo información de captaciones a plazo para oficina: ${codigoOficina}`);
      
      const captacion = await this.captacionesRepository.obtenerCaptaciones(codigoOficina, 'plazo');
      
      if (!captacion) {
        console.log('[CaptacionesService] No se encontró información de captaciones a plazo');
        return {
          captacionActual: {
            fecha: new Date().toISOString().split('T')[0],
            monto: 0,
            tipoCaptacion: 'plazo',
            codigoCuenta: '2103'
          },
          mensaje: 'No se encontraron datos de captaciones a plazo'
        };
      }
      
      return {
        captacionActual: captacion
      };
    } catch (error) {
      console.error('[CaptacionesService] Error al obtener captaciones a plazo:', error);
      throw error;
    }
  }
}
