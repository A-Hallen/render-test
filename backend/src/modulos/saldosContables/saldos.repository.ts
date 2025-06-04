import { BaseFirebaseRepository } from '../../base/base.firebaseRepository';
import { SaldosContables } from './saldos.model';
import { Component } from 'shared/src/types/indicadores.types';

export class SaldosRepository extends BaseFirebaseRepository<SaldosContables> {
  constructor() {
    super('SaldosContables');
  }

  /**
   * Extrae todos los códigos de cuentas contables de los componentes de indicadores
   * @param componentes Array de componentes (numerador o denominador)
   * @returns Array de códigos de cuentas contables únicos
   */
  private extraerCodigosCuentasDeComponentes(componentes: Component[]): string[] {
    const codigosCuentas = new Set<string>();
    
    componentes.forEach(componente => {
      if (componente.componentes) {
        componente.componentes.forEach(comp => {
          if (comp.cuentas && Array.isArray(comp.cuentas)) {
            comp.cuentas.forEach(cuenta => {
              // Mantener como string
              codigosCuentas.add(cuenta);
            });
          }
        });
      }
    });
    
    return Array.from(codigosCuentas);
  }

  /**
   * Obtiene saldos contables filtrados por oficina, fechas y códigos de cuentas contables
   * @param codigoOficina Código de la oficina
   * @param fechas Array de fechas a consultar
   * @param codigosCuentas Array de códigos de cuentas contables a filtrar
   * @returns Array de saldos contables que cumplen los criterios
   */
  async obtenerSaldosPorOficinaFechaYCuentas(
    codigoOficina: string,
    fechas: Date[],
    codigosCuentas: string[]
  ): Promise<SaldosContables[]> {
    try {
      // Convertir fechas a formato string YYYY-MM-DD
      const fechasFormateadas = fechas.map(f => f.toISOString().split('T')[0]);
      
      // Dividir los códigos de cuentas en lotes de 30 (límite de Firestore para operador 'in')
      const lotesDeCuentas = [];
      for (let i = 0; i < codigosCuentas.length; i += 30) {
        lotesDeCuentas.push(codigosCuentas.slice(i, i + 30));
      }
      
      console.log(`[saldos.repository] Procesando ${fechasFormateadas.length} fechas`);
      console.log(`[saldos.repository] Procesando ${codigosCuentas.length} cuentas en ${lotesDeCuentas.length} lotes`);
      
      // Realizar consultas individuales para cada fecha y cada lote de cuentas
      // Esto evita el problema de demasiadas disyunciones
      const saldos: SaldosContables[] = [];
      const promesas = [];
      
      // Para cada fecha y cada lote de cuentas, crear una consulta separada
      for (const fecha of fechasFormateadas) {
        for (const loteCuentas of lotesDeCuentas) {
          // Crear una consulta base
          let query = this.collection
            .where('fecha', '==', fecha) // Consulta por fecha individual, no usando 'in'
            .where('codigoCuentaContable', 'in', loteCuentas);
          
          // Si no es 'TODAS', filtrar por oficina específica
          if (codigoOficina !== 'TODAS') {
            query = query.where('codigoOficina', '==', codigoOficina);
          }
          
          const promesa = query
            .get()
            .then(querySnapshot => {
              querySnapshot.forEach((doc) => {
                const data = doc.data() as SaldosContables;
                saldos.push(data);
              });
              return querySnapshot.size; // Devolver el número de documentos procesados
            })
            .catch(error => {
              console.error(`[saldos.repository] Error en consulta para fecha ${fecha}:`, error);
              return 0; // Devolver 0 en caso de error
            });
            
          promesas.push(promesa);
        }
      }
      
      // Esperar a que todas las consultas se completen
      const resultados = await Promise.all(promesas);
      const totalDocumentosProcesados = resultados.reduce((total, count) => total + count, 0);
      
      console.log(`[saldos.repository] Total de consultas realizadas: ${promesas.length}`);
      console.log(`[saldos.repository] Total de documentos procesados: ${totalDocumentosProcesados}`);
      console.log(`[saldos.repository] Total de saldos obtenidos: ${saldos.length}`);
      
      return saldos;
    } catch (error) {
      console.error('Error al obtener saldos por oficina, fechas y cuentas:', error);
      throw error;
    }
  }

  async obtenerSaldosPorOficinaYFecha(
    codigoOficina: string,
    fechas: Date[]
  ): Promise<SaldosContables[]> {
    try {
      // Convertir fechas a formato string YYYY-MM-DD
      const fechasFormateadas = fechas.map(f => f.toISOString().split('T')[0]);
      
      // Dividir las fechas en lotes de 30 (límite de Firestore para operador 'in')
      const lotesDeFechas = [];
      for (let i = 0; i < fechasFormateadas.length; i += 30) {
        lotesDeFechas.push(fechasFormateadas.slice(i, i + 30));
      }
      
      console.log(`[saldos.repository] Procesando ${fechasFormateadas.length} fechas en ${lotesDeFechas.length} lotes`);
      
      // Realizar consultas para cada lote y combinar resultados
      const saldos: SaldosContables[] = [];
      
      // Ejecutar consultas en paralelo para mejorar rendimiento
      const promesas = lotesDeFechas.map(async (loteFechas) => {
        const querySnapshot = await this.collection
          .where('codigoOficina', '==', codigoOficina)
          .where('fecha', 'in', loteFechas)
          .get();
          
        return querySnapshot;
      });
      
      // Esperar a que todas las consultas se completen
      const resultados = await Promise.all(promesas);
      
      // Procesar los resultados de todas las consultas
      resultados.forEach(querySnapshot => {
        querySnapshot.forEach((doc) => {
          const data = doc.data() as SaldosContables;
          saldos.push(data);
        });
      });
      
      console.log(`[saldos.repository] Total de saldos obtenidos: ${saldos.length}`);
      return saldos;
    } catch (error) {
      console.error('Error al obtener saldos:', error);
      throw error;
    }
  }
}
