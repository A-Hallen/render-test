import { SaldosContables } from '../saldosContables/saldos.model';
import { SaldosRepository } from '../saldosContables/saldos.repository';

/**
 * Clase base abstracta para repositorios que consultan saldos contables
 */
export abstract class SaldosBaseRepository {
  protected saldosRepository: SaldosRepository;

  constructor() {
    this.saldosRepository = new SaldosRepository();
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
  ): Promise<{
    fecha: string;
    monto: number;
    fechaAnterior?: string;
    montoAnterior?: number;
    variacion?: number;
    variacionPorcentaje?: number;
    descripcionComparacion?: string;
  } | null> {
    try {
      console.log(`[${nombreRepositorio}] Obteniendo datos para cuentas: ${codigosCuenta.join(', ')}`);
      
      // Estrategia: Buscar datos de forma incremental, en lotes de 2 meses
      // hasta encontrar al menos 2 meses con datos
      const fechaActual = new Date();
      let mesesConDatos = 0;
      let mesInicial = 0;
      const TAMANO_LOTE = 2; // Consultar de 2 en 2 meses
      const MAX_INTENTOS = 6;  // Máximo 6 intentos (12 meses en total)
      
      let saldos: SaldosContables[] = [];
      
      // Buscar datos incrementalmente hasta tener al menos 2 meses con datos
      for (let intento = 0; intento < MAX_INTENTOS && mesesConDatos < 2; intento++) {
        // Generar fechas para este lote
        const fechasLote: Date[] = [];
        for (let i = 0; i < TAMANO_LOTE; i++) {
          const mes = mesInicial + i;
          const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - mes, 0);
          fechasLote.push(fecha);
        }
        
        console.log(`[${nombreRepositorio}] Intento ${intento + 1}: Consultando fechas: ${fechasLote.map(f => f.toISOString().split('T')[0]).join(', ')}`);
        
        // Obtener los saldos para este lote de fechas
        const saldosLote = await this.saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(
          codigoOficina,
          fechasLote,
          codigosCuenta
        );
        
        // Agregar los saldos encontrados al conjunto total
        saldos = [...saldos, ...saldosLote];
        
        // Actualizar el contador de meses con datos
        if (saldosLote.length > 0) {
          // Contar cuántos meses distintos tienen datos
          const fechasUnicas = new Set(saldosLote.map(s => {
            const fechaStr = typeof s.fecha === 'string' ? s.fecha : (s.fecha as Date).toISOString().split('T')[0];
            return fechaStr;
          }));
          mesesConDatos += fechasUnicas.size;
          console.log(`[${nombreRepositorio}] Encontrados datos para ${fechasUnicas.size} mes(es) en este lote. Total: ${mesesConDatos}`);
        }
        
        // Avanzar al siguiente lote de meses
        mesInicial += TAMANO_LOTE;
      }
      
      console.log(`[${nombreRepositorio}] Total de saldos obtenidos: ${saldos.length}`);
      
      if (saldos.length === 0) {
        console.log(`[${nombreRepositorio}] No se encontraron saldos`);
        return null;
      }
      
      // Agrupar saldos por fecha
      const saldosPorFecha: { [fecha: string]: number } = {};
      saldos.forEach(saldo => {
        const fechaStr = typeof saldo.fecha === 'string' ? saldo.fecha : (saldo.fecha as Date).toISOString().split('T')[0];
        if (!saldosPorFecha[fechaStr]) {
          saldosPorFecha[fechaStr] = 0;
        }
        saldosPorFecha[fechaStr] += saldo.saldo;
      });
      
      // Ordenar fechas de más reciente a más antigua
      const fechasOrdenadas = Object.keys(saldosPorFecha).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
      });
      
      if (fechasOrdenadas.length < 2) {
        console.log(`[${nombreRepositorio}] No hay suficientes meses con datos para calcular variación (${fechasOrdenadas.length} encontrados)`);
        
        // Si solo hay un mes, devolver los datos sin comparación
        if (fechasOrdenadas.length === 1) {
          const fechaActualStr = fechasOrdenadas[0];
          return {
            fecha: fechaActualStr,
            monto: saldosPorFecha[fechaActualStr]
          };
        }
        
        return null;
      }
      
      // Obtener los dos meses más recientes
      const fechaActualStr = fechasOrdenadas[0];
      const fechaAnteriorStr = fechasOrdenadas[1];
      
      // Calcular la variación
      const montoActual = saldosPorFecha[fechaActualStr];
      const montoAnterior = saldosPorFecha[fechaAnteriorStr];
      const variacion = montoActual - montoAnterior;
      const variacionPorcentaje = (variacion / montoAnterior) * 100;
      
      // Formatear nombres de meses para la descripción
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const fechaActualObj = new Date(fechaActualStr);
      const fechaAnteriorObj = new Date(fechaAnteriorStr);
      
      const mesActual = meses[fechaActualObj.getMonth()];
      const mesAnterior = meses[fechaAnteriorObj.getMonth()];
      const anioActual = fechaActualObj.getFullYear();
      const anioAnterior = fechaAnteriorObj.getFullYear();
      
      // Crear descripción de la comparación
      const descripcionComparacion = `${mesActual} vs ${mesAnterior} ${anioAnterior !== anioActual ? anioAnterior : ''}`;
      
      console.log(`[${nombreRepositorio}] Datos procesados: ${fechaActualStr} (${montoActual}) vs ${fechaAnteriorStr} (${montoAnterior})`);
      console.log(`[${nombreRepositorio}] Variación: ${variacion} (${variacionPorcentaje.toFixed(2)}%)`);
      
      return {
        fecha: fechaActualStr,
        monto: montoActual,
        fechaAnterior: fechaAnteriorStr,
        montoAnterior,
        variacion,
        variacionPorcentaje,
        descripcionComparacion
      };
    } catch (error) {
      console.error(`[${nombreRepositorio}] Error al obtener saldos:`, error);
      throw error;
    }
  }
}
