import { CarteraCredito } from 'shared';
import { SaldosBaseRepository } from '../common/saldos-base.repository';

export class CarteraCreditoRepository extends SaldosBaseRepository {
  private readonly CODIGO_CUENTA_CARTERA: string = '14'; // Código de cuenta contable para cartera de crédito

  constructor() {
    super();
  }

  /**
   * Obtiene los saldos de la cartera de crédito para los últimos dos meses disponibles
   * @param codigoOficina Código de la oficina para la cual obtener los datos
   * @returns Objeto con la información de la cartera de crédito actual y su variación
   */
  async obtenerCarteraCredito(codigoOficina: string): Promise<CarteraCredito | null> {
    try {
      // Utilizar el método de la clase base para obtener los saldos
      const resultado = await this.obtenerSaldosContables(
        codigoOficina,
        [this.CODIGO_CUENTA_CARTERA],
        'CarteraCreditoRepository'
      );
      
      // Si no hay resultados, devolver null
      if (!resultado) {
        return null;
      }
      
      // Devolver el resultado con el tipo CarteraCredito
      return resultado as CarteraCredito;
    } catch (error) {
      console.error('[CarteraCreditoRepository] Error al obtener cartera de crédito:', error);
      throw error;
    }
  }
  

}
