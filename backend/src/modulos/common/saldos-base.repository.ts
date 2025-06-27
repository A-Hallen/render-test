import { DashboardData } from 'shared';
import { SaldosRepository } from '../saldosContables/saldos.repository';
import { FechasSaldosService } from './fechas-saldos.service';

/**
 * Clase base abstracta para repositorios que consultan saldos contables
 * Versión optimizada con las nuevas consultas de Firestore
 */
export abstract class SaldosBaseRepository {
  protected saldosRepository: SaldosRepository;
  protected fechasSaldosService: FechasSaldosService;

  constructor() {
    this.saldosRepository = new SaldosRepository();
    this.fechasSaldosService = new FechasSaldosService();
  }

  /**
   * Obtiene los saldos para las cuentas especificadas en los últimos meses disponibles
   * @param codigoOficina Código de la oficina para la cual obtener los datos
   * @param codigosCuenta Códigos de cuentas contables a consultar
   * @param nombreRepositorio Nombre del repositorio para logs
   * @returns Objeto con la información de saldos y su variación
   */
  protected async obtenerSaldosContables(
    codigoOficina: string,
    codigosCuenta: string[],
    nombreRepositorio: string
  ): Promise<DashboardData | null> {
    try {
      console.log(`[${nombreRepositorio}] Obteniendo saldos contables para oficina ${codigoOficina}`);
      
      // Obtener los saldos de las fechas clave (actual, penúltimo y mes anterior)
      const saldosFechas = await this.fechasSaldosService.ObtenerUltimaYPenultimaFechaConDatos(
        codigoOficina, 
        codigosCuenta, 
        nombreRepositorio
      );
      
      // Verificar si tenemos el saldo actual
      if (!saldosFechas.saldoActual) {
        console.log(`[${nombreRepositorio}] No se encontró saldo actual para la oficina ${codigoOficina}`);
        return null;
      }
      
      // Extraer los datos del saldo actual
      const saldoActual = saldosFechas.saldoActual;
      const fechaActual = saldoActual.fechaTimestamp?.toDate().toISOString().split('T')[0] || '';
      const montoActual = saldoActual.saldo || 0;
      
      // Preparar el objeto de resultado
      const resultado: {
        fecha: string;
        monto: number;
        fechaAnterior?: string;
        montoAnterior?: number;
        variacion?: number;
        variacionPorcentaje?: number;
        descripcionComparacion?: string;
        fechaDiaAnterior?: string;
        montoDiaAnterior?: number;
        variacionDiaria?: number;
        variacionPorcentajeDiaria?: number;
      } = {
        fecha: fechaActual,
        monto: montoActual
      };
      
      // Agregar datos de comparación con el mes anterior si están disponibles
      if (saldosFechas.saldoMesAnterior) {
        const saldoMesAnterior = saldosFechas.saldoMesAnterior;
        const fechaMesAnterior = saldoMesAnterior.fechaTimestamp?.toDate().toISOString().split('T')[0] || '';
        const montoMesAnterior = saldoMesAnterior.saldo || 0;
        
        resultado.fechaAnterior = fechaMesAnterior;
        resultado.montoAnterior = montoMesAnterior;
        resultado.variacion = montoActual - montoMesAnterior;
        
        // Calcular la variación porcentual solo si el monto anterior no es cero
        if (montoMesAnterior !== 0) {
          resultado.variacionPorcentaje = (resultado.variacion / Math.abs(montoMesAnterior)) * 100;
        } else if (resultado.variacion !== 0) {
          // Si el monto anterior es cero, la variación porcentual es indefinida
          resultado.variacionPorcentaje = resultado.variacion > 0 ? 100 : -100;
        } else {
          resultado.variacionPorcentaje = 0;
        }
        
        // Descripción de la comparación
        const mesActual = new Date(fechaActual).toLocaleDateString('es-ES', { month: 'long' });
        const mesAnteriorStr = new Date(fechaMesAnterior).toLocaleDateString('es-ES', { month: 'long' });
        resultado.descripcionComparacion = `${mesActual} vs ${mesAnteriorStr}`;
      }
      
      // Agregar datos de comparación con el día anterior si están disponibles
      if (saldosFechas.saldoPenultimo) {
        const saldoPenultimo = saldosFechas.saldoPenultimo;
        const fechaPenultima = saldoPenultimo.fechaTimestamp?.toDate().toISOString().split('T')[0] || '';
        const montoPenultimo = saldoPenultimo.saldo || 0;
        
        resultado.fechaDiaAnterior = fechaPenultima;
        resultado.montoDiaAnterior = montoPenultimo;
        resultado.variacionDiaria = montoActual - montoPenultimo;
        
        // Calcular la variación porcentual diaria solo si el monto del día anterior no es cero
        if (montoPenultimo !== 0) {
          resultado.variacionPorcentajeDiaria = (resultado.variacionDiaria / Math.abs(montoPenultimo)) * 100;
        } else if (resultado.variacionDiaria !== 0) {
          // Si el monto del día anterior es cero, la variación porcentual es indefinida
          resultado.variacionPorcentajeDiaria = resultado.variacionDiaria > 0 ? 100 : -100;
        } else {
          resultado.variacionPorcentajeDiaria = 0;
        }
      }
      
      // Formatear los valores porcentuales para mostrar solo 2 decimales
      if (resultado.variacionPorcentaje !== undefined) {
        resultado.variacionPorcentaje = parseFloat(resultado.variacionPorcentaje.toFixed(2));
      }
      
      if (resultado.variacionPorcentajeDiaria !== undefined) {
        resultado.variacionPorcentajeDiaria = parseFloat(resultado.variacionPorcentajeDiaria.toFixed(2));
      }
      
      return resultado;
    } catch (error) {
      console.error(`[${nombreRepositorio}] Error al obtener saldos contables:`, error);
      return null;
    }
  }
}
