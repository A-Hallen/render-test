import { Captacion } from 'shared';
import { SaldosBaseRepository } from '../common/saldos-base.repository';

export class CaptacionesRepository extends SaldosBaseRepository {
  private readonly CODIGO_CUENTA_VISTA: string = '2101'; // Código de cuenta contable para captaciones a la vista
  private readonly CODIGO_CUENTA_PLAZO: string = '2103'; // Código de cuenta contable para captaciones a plazo

  constructor() {
    super();
  }

  /**
   * Obtiene los saldos de captaciones para los últimos dos meses disponibles
   * @param codigoOficina Código de la oficina para la cual obtener los datos
   * @param tipoCaptacion Tipo de captación ('vista' o 'plazo')
   * @returns Objeto con la información de captaciones actual y su variación
   */
  async obtenerCaptaciones(codigoOficina: string, tipoCaptacion: 'vista' | 'plazo'): Promise<Captacion | null> {
    try {
      const codigoCuenta = tipoCaptacion === 'vista' ? this.CODIGO_CUENTA_VISTA : this.CODIGO_CUENTA_PLAZO;
      console.log(`[CaptacionesRepository] Obteniendo datos de captaciones ${tipoCaptacion} (cuenta ${codigoCuenta})`);
      
      // Utilizar el método de la clase base para obtener los saldos
      const resultado = await this.obtenerSaldosContables(
        codigoOficina,
        [codigoCuenta],
        'CaptacionesRepository'
      );
      
      // Si no hay resultados, devolver null
      if (!resultado) {
        return null;
      }
      
      // Devolver el resultado con el tipo Captacion
      return resultado as Captacion;
    } catch (error) {
      console.error(`[CaptacionesRepository] Error al obtener captaciones ${tipoCaptacion}:`, error);
      throw error;
    }
  }
}
