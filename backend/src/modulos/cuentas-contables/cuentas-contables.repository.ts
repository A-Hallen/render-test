import { BaseFirebaseRepository } from '../../base/base.firebaseRepository';
import { CuentaData } from 'shared/src/types/reportes.types';

/**
 * Repositorio para gestionar las cuentas contables en Firebase
 * Reemplaza las consultas a las tablas TABLA_DIVISION y TABLA_CUENTACONTABLE
 */
export class CuentasContablesRepository extends BaseFirebaseRepository<CuentaData> {
  private static instance: CuentasContablesRepository;

  private constructor() {
    super('CuentasContables');
  }

  /**
   * Implementa el patrón Singleton para asegurar una sola instancia
   */
  public static getInstance(): CuentasContablesRepository {
    if (!CuentasContablesRepository.instance) {
      CuentasContablesRepository.instance = new CuentasContablesRepository();
    }
    return CuentasContablesRepository.instance;
  }

  /**
   * Obtiene todas las cuentas contables activas
   * Reemplaza la consulta SQL que unía TABLA_DIVISION y TABLA_CUENTACONTABLE
   */
  async obtenerCuentas(): Promise<CuentaData[]> {
    try {
      const snapshot = await this.collection.get();
      
      const res = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          CODIGO: data.CODIGO,
          NOMBRE: data.NOMBRE
        } as CuentaData;
      });
      return res;
    } catch (error) {
      console.error('Error al obtener cuentas contables:', error);
      throw error;
    }
  }

  /**
   * Obtiene cuentas contables específicas por sus códigos
   * @param codigos Array de códigos de cuenta a buscar
   */
  async obtenerCuentasPorCodigos(codigos: string[]): Promise<CuentaData[]> {
    try {
      // Firebase no permite consultas IN con más de 10 valores
      // Si hay más de 10 códigos, dividimos en múltiples consultas
      const resultadosConDuplicados: CuentaData[] = [];

      // Procesar en lotes de 10
      for (let i = 0; i < codigos.length; i += 10) {
        const lote = codigos.slice(i, i + 10);
        const query = this.collection
          .where('CODIGO', 'in', lote);
        const snapshot = await query.get();
        
        const cuentasLote = snapshot.docs.map(doc => {
          const data = doc.data();
          return data as CuentaData;
        });
        
        resultadosConDuplicados.push(...cuentasLote);
      }
      
      // Eliminar duplicados usando un Map para mantener solo una cuenta por código
      const cuentasPorCodigo = new Map<string, CuentaData>();
      
      for (const cuenta of resultadosConDuplicados) {
        if (!cuentasPorCodigo.has(cuenta.CODIGO.toString())) {
          cuentasPorCodigo.set(cuenta.CODIGO.toString(), cuenta);
        }
      }
      
      // Convertir el Map de vuelta a un array
      const resultadosSinDuplicados = Array.from(cuentasPorCodigo.values());
      
      return resultadosSinDuplicados;
    } catch (error) {
      console.error('Error al obtener cuentas por códigos:', error);
      throw error;
    }
  }
}
