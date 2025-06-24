import { SaldosRepository } from '../saldosContables/saldos.repository';
import { firestore } from '../../config/firebase.config';
import { SaldosContables } from '../saldosContables/saldos.model';

/**
 * Servicio para gestionar operaciones relacionadas con fechas de saldos contables
 */
export class FechasSaldosService {
  private saldosRepository: SaldosRepository;

  constructor() {
    this.saldosRepository = new SaldosRepository();
  }

  private static fechasCache: { [key: string]: { fecha: string, timestamp: number } } = {};
  private static CACHE_TTL = 30 * 60 * 1000;

  /**
   * Obtiene los saldos contables del último día con datos, el penúltimo día con datos, 
   * y el último día con datos del mes anterior al último día con datos
   * @param codigoOficina Código de la oficina para la cual obtener los datos
   * @param codigosCuenta Códigos de cuentas contables a consultar
   * @param nombreRepositorio Nombre del repositorio para logs
   * @returns Objeto con los saldos contables organizados por tipo de fecha
   */
  public async ObtenerUltimaYPenultimaFechaConDatos(
    codigoOficina: string, 
    codigosCuenta: string[], 
    nombreRepositorio: string)
    : Promise<{
      saldoActual: SaldosContables | null;
      saldoPenultimo: SaldosContables | null;
      saldoMesAnterior: SaldosContables | null;
    }> {
    try {
      console.log(`[${nombreRepositorio}] Obteniendo saldos contables para oficina ${codigoOficina}`);
      
      // Inicializar el objeto de resultado
      const resultado = {
        saldoActual: null as SaldosContables | null,
        saldoPenultimo: null as SaldosContables | null,
        saldoMesAnterior: null as SaldosContables | null
      };

      // 1. Primera consulta: Obtener los saldos de los dos últimos días con datos (el último y el penúltimo)
      const queryUltimosDias = firestore.collection('SaldosContables')
        .where('codigoOficina', '==', codigoOficina)
        .where('codigoCuentaContable', 'in', codigosCuenta)
        .orderBy('fechaTimestamp', 'desc')
        .limit(2);
      
      const snapshotUltimosDias = await queryUltimosDias.get();
      
      if (snapshotUltimosDias.empty) {
        console.log(`[${nombreRepositorio}] No se encontraron saldos para la oficina ${codigoOficina}`);
        return resultado;
      }
      
      // Convertir los documentos a objetos SaldosContables
      const saldosUltimosDias: SaldosContables[] = snapshotUltimosDias.docs.map(doc => {
        const data = doc.data() as SaldosContables;
        return data;
      });
      
      // Verificar que tenemos al menos un saldo
      if (saldosUltimosDias.length === 0) {
        return resultado;
      }
      
      // Asignar el saldo actual y el penúltimo
      resultado.saldoActual = saldosUltimosDias[0] || null;
      resultado.saldoPenultimo = saldosUltimosDias.length > 1 ? saldosUltimosDias[1] : null;
      
      // Obtener la fecha de referencia para calcular el mes anterior
      // Usamos la fecha del saldo actual como referencia
      const fechaReferencia = resultado.saldoActual?.fechaTimestamp?.toDate() || new Date();
      
      // 2. Segunda consulta: Obtener el saldo del último día con datos del mes anterior
      
      // Calcular el primer día del mes de la fecha de referencia
      const primerDiaMesActual = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), 1);
      
      // Calcular el último día del mes anterior (un día antes del primer día del mes actual)
      const ultimoDiaMesAnterior = new Date(primerDiaMesActual);
      ultimoDiaMesAnterior.setDate(ultimoDiaMesAnterior.getDate() - 1);
      
      // Calcular el primer día del mes anterior
      const primerDiaMesAnterior = new Date(ultimoDiaMesAnterior.getFullYear(), ultimoDiaMesAnterior.getMonth(), 1);
      
      console.log(`[${nombreRepositorio}] Buscando saldos del mes anterior: ${primerDiaMesAnterior.toISOString().split('T')[0]} - ${ultimoDiaMesAnterior.toISOString().split('T')[0]}`);
      
      // Consulta para obtener el saldo del último día con datos del mes anterior
      const queryMesAnterior = firestore.collection('SaldosContables')
        .where('codigoOficina', '==', codigoOficina)
        .where('codigoCuentaContable', 'in', codigosCuenta)
        .where('fechaTimestamp', '>=', primerDiaMesAnterior)
        .where('fechaTimestamp', '<=', ultimoDiaMesAnterior)
        .orderBy('fechaTimestamp', 'desc')
        .limit(1);
      
      const snapshotMesAnterior = await queryMesAnterior.get();
      
      // Agregar el saldo del mes anterior si existe
      if (!snapshotMesAnterior.empty) {
        const saldoMesAnterior = snapshotMesAnterior.docs[0].data() as SaldosContables;
        resultado.saldoMesAnterior = saldoMesAnterior;
        
        const fechaMesAnterior = saldoMesAnterior.fechaTimestamp?.toDate().toISOString().split('T')[0] || 'fecha desconocida';
        console.log(`[${nombreRepositorio}] Encontrado saldo del mes anterior: ${fechaMesAnterior}`);
      } else {
        console.log(`[${nombreRepositorio}] No se encontraron saldos para el mes anterior`);
      }
      
      // Mostrar las fechas encontradas para depuración
      const fechasLog = [];
      if (resultado.saldoActual?.fechaTimestamp) {
        fechasLog.push(resultado.saldoActual.fechaTimestamp.toDate().toISOString().split('T')[0]);
      }
      if (resultado.saldoPenultimo?.fechaTimestamp) {
        fechasLog.push(resultado.saldoPenultimo.fechaTimestamp.toDate().toISOString().split('T')[0]);
      }
      if (resultado.saldoMesAnterior?.fechaTimestamp) {
        fechasLog.push(resultado.saldoMesAnterior.fechaTimestamp.toDate().toISOString().split('T')[0]);
      }
      
      console.log(`[${nombreRepositorio}] Saldos encontrados para fechas:`, fechasLog.join(', '));
      
      return resultado;
    } catch (error) {
      console.error(`[${nombreRepositorio}] Error al obtener saldos contables:`, error);
      throw error;
    }
  }

  /**
 * Obtiene la última fecha con datos disponibles para las cuentas especificadas
 * @param codigoOficina Código de la oficina para la cual obtener los datos
 * @param codigosCuenta Códigos de cuentas contables a consultar
 * @param nombreRepositorio Nombre del repositorio para logs
 * @returns Fecha en formato YYYY-MM-DD con los últimos datos disponibles
 */
public async obtenerUltimaFechaConDatos(
  codigoOficina: string,
  codigosCuenta: string[],
  nombreRepositorio: string
): Promise<string> {
  try {
    // Optimización 1: Usar un hash más eficiente para la clave de caché
    const cacheKey = `${codigoOficina}:${codigosCuenta.length}:${codigosCuenta.join('').length}`;
    const ahora = Date.now();
    
    // Verificar caché primero para evitar consultas innecesarias
    if (FechasSaldosService.fechasCache[cacheKey] && 
        (ahora - FechasSaldosService.fechasCache[cacheKey].timestamp) < FechasSaldosService.CACHE_TTL) {
      return FechasSaldosService.fechasCache[cacheKey].fecha;
    }
    
    // Optimización 2: Usar directamente una consulta ordenada por fechaTimestamp descendente
    // Esta es la principal optimización que aprovecha el nuevo campo fechaTimestamp
    try {
      // Dividir los códigos de cuentas en lotes de 30 (límite de Firestore para operador 'in')
      const lotesDeCuentas = [];
      for (let i = 0; i < codigosCuenta.length; i += 30) {
        lotesDeCuentas.push(codigosCuenta.slice(i, i + 30));
      }
      
      // Realizar consultas para cada lote de cuentas
      for (const loteCuentas of lotesDeCuentas) {
        let query = firestore.collection('SaldosContables')
          .orderBy('fechaTimestamp', 'desc')
          .limit(1);
        
        // Filtrar por oficina si no es 'TODAS'
        if (codigoOficina !== 'TODAS') {
          query = query.where('codigoOficina', '==', codigoOficina);
        }
        
        // Filtrar por códigos de cuenta
        if (loteCuentas.length === 1) {
          query = query.where('codigoCuentaContable', '==', Number(loteCuentas[0]));
        } else {
          // Nota: No podemos usar 'in' junto con orderBy, así que omitimos este filtro
          // y filtramos los resultados después
        }
        
        const snapshot = await query.get();
        
        if (!snapshot.empty) {
          // Encontramos un documento con fechaTimestamp
          const doc = snapshot.docs[0];
          const data = doc.data();
          
          // Verificar si el documento pertenece a uno de los códigos de cuenta solicitados
          if (loteCuentas.length > 1 && !loteCuentas.includes(String(data.codigoCuentaContable))) {
            continue; // No es una de las cuentas que buscamos, continuar con el siguiente lote
          }
          
          // Convertir el Timestamp a string en formato YYYY-MM-DD
          const fechaTimestamp = data.fechaTimestamp;
          if (fechaTimestamp) {
            const fecha = fechaTimestamp.toDate();
            const fechaStr = fecha.toISOString().split('T')[0];
            
            // Guardar en caché
            FechasSaldosService.fechasCache[cacheKey] = {
              fecha: fechaStr,
              timestamp: ahora
            };
            
            return fechaStr;
          } else if (data.fecha) {
            // Si no hay fechaTimestamp pero sí hay fecha en string
            const fechaStr = data.fecha;
            
            // Guardar en caché
            FechasSaldosService.fechasCache[cacheKey] = {
              fecha: fechaStr,
              timestamp: ahora
            };
            
            return fechaStr;
          }
        }
      }
    } catch (error) {
      console.error(`[${nombreRepositorio}] Error al consultar por fechaTimestamp:`, error);
      // Continuamos con el método anterior como fallback
    }
    
    // Fallback: Si la consulta optimizada falla, usar el método original
    console.log(`[${nombreRepositorio}] Usando método de búsqueda tradicional como fallback`);
    
    // Optimización 3: Estrategia de búsqueda incremental
    // Primero intentamos con fechas recientes (últimos 7 días) antes de buscar en 30 días
    const fechaActual = new Date();
    const fechaActualStr = fechaActual.toISOString().split('T')[0];
    
    // Consultar primero las fechas más probables (últimos 7 días)
    const fechasRecientes: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaActual);
      fecha.setDate(fecha.getDate() - i);
      fechasRecientes.push(fecha);
    }
    
    // Añadir fin de mes anterior que suele ser una fecha común con datos
    const finMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0);
    if (!fechasRecientes.some(f => f.getTime() === finMesAnterior.getTime())) {
      fechasRecientes.push(finMesAnterior);
    }
    
    // Consulta inicial con fechas más probables
    // Crear fechas de inicio y fin para el rango
    const fechaInicioRecientes = new Date(fechasRecientes[fechasRecientes.length - 1]); // La fecha más antigua
    const fechaFinRecientes = new Date(fechasRecientes[0]); // La fecha más reciente
    
    let saldos = await this.saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(
      codigoOficina,
      fechaInicioRecientes,
      fechaFinRecientes,
      codigosCuenta,
      true // Usar modo diario para buscar fechas recientes con datos
    );
    
    // Si no encontramos datos en las fechas recientes, expandir la búsqueda
    if (saldos.length === 0) {
      const fechasAdicionales: Date[] = [];
      for (let i = 7; i < 30; i++) {
        const fecha = new Date(fechaActual);
        fecha.setDate(fecha.getDate() - i);
        fechasAdicionales.push(fecha);
      }
      
      // Crear fechas de inicio y fin para el rango adicional
      const fechaInicioAdicionales = new Date(fechasAdicionales[fechasAdicionales.length - 1]); // La fecha más antigua
      const fechaFinAdicionales = new Date(fechasAdicionales[0]); // La fecha más reciente
      
      saldos = await this.saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(
        codigoOficina,
        fechaInicioAdicionales,
        fechaFinAdicionales,
        codigosCuenta,
        true // Usar modo diario para buscar fechas adicionales con datos
      );
    }
    
    // Procesamiento más eficiente de resultados
    if (saldos.length > 0) {
      // Usar un objeto simple en lugar de Map para mejor rendimiento
      const saldosPorFecha: {[fecha: string]: number} = {};
      let fechaMasReciente = '';
      let timestampMasReciente = 0;
      
      // Procesar saldos y encontrar la fecha más reciente en una sola pasada
      for (const saldo of saldos) {
        // Preferir fechaTimestamp si está disponible
        let fechaStr;
        if (saldo.fechaTimestamp) {
          fechaStr = saldo.fechaTimestamp.toDate().toISOString().split('T')[0];
        } else {
          fechaStr = typeof saldo.fecha === 'string' 
            ? saldo.fecha 
            : (saldo.fecha as Date).toISOString().split('T')[0];
        }
          
        if (!saldosPorFecha[fechaStr]) {
          saldosPorFecha[fechaStr] = 0;
          
          // Actualizar fecha más reciente durante el procesamiento
          const timestamp = new Date(fechaStr).getTime();
          if (timestamp > timestampMasReciente) {
            timestampMasReciente = timestamp;
            fechaMasReciente = fechaStr;
          }
        }
        
        saldosPorFecha[fechaStr]++;
      }
      
      // Si encontramos una fecha con datos, usarla
      if (fechaMasReciente) {
        FechasSaldosService.fechasCache[cacheKey] = {
          fecha: fechaMasReciente,
          timestamp: ahora
        };
        
        return fechaMasReciente;
      }
    }
    
    // Si no hay datos, usar la fecha actual como fallback
    FechasSaldosService.fechasCache[cacheKey] = {
      fecha: fechaActualStr,
      timestamp: ahora
    };
    
    return fechaActualStr;
  } catch (error) {
    console.error(`[${nombreRepositorio}] Error al obtener última fecha con datos:`, error);
    return new Date().toISOString().split('T')[0];
  }
}
  
  /**
   * Genera un array de fechas para consultar saldos
   * @param fechaActual Fecha actual
   * @param fechaUltima Última fecha con datos disponibles
   * @param mesInicial Mes inicial para la consulta (0 = mes actual, 1 = mes anterior, etc.)
   * @param tamanoLote Tamaño del lote de meses a consultar
   * @returns Array de fechas para consultar
   */
  public generarFechasConsulta(
    fechaActual: Date,
    fechaUltima: string,
    mesInicial: number,
    tamanoLote: number
  ): Date[] {
    const fechasLote: Date[] = [];
    console.log(`Generando fechas para consulta: mesInicial=${mesInicial}, tamanoLote=${tamanoLote}, fechaUltima=${fechaUltima}`);
    
    for (let i = 0; i < tamanoLote; i++) {
      const mes = mesInicial + i;
      let fecha: Date;
      
      if (mes === 0) {
        // Para el mes actual (mes 0), usar la última fecha con datos disponibles
        const [year, month, day] = fechaUltima.split('-').map(Number);
        fecha = new Date(year, month - 1, day); // Los meses en JS son 0-indexed
      } else {
        // Para meses anteriores, usar el último día del mes correspondiente
        // Ejemplo: si mesInicial=1 e i=0, obtenemos el último día del mes anterior
        // Si mesInicial=1 e i=1, obtenemos el último día del mes anterior al anterior
        fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - mes + 1, 0);
      }
      
      console.log(`  Fecha generada para mes ${mes}: ${fecha.toISOString().split('T')[0]}`);
      fechasLote.push(fecha);
    }
    
    return fechasLote;
  }
}
