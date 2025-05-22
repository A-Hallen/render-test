import { BaseFirebaseRepository } from '../../base/base.firebaseRepository';
import { SaldosContables } from './saldos.model';

export class SaldosRepository extends BaseFirebaseRepository<SaldosContables> {
  constructor() {
    super('SaldosContables');
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
