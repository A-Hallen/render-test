import { BaseFirebaseRepository } from '../../base/base.firebaseRepository';
import { SaldosContables } from './saldos.model';

export class SaldosRepository extends BaseFirebaseRepository<SaldosContables> {
  constructor() {
    super('SaldosContables');
  }

  async obtenerSaldosPorOficinaYFecha(
    codigoOficina: string,
    fechas: string[]
  ): Promise<SaldosContables[]> {
    try {
      // Preparar los formatos de fecha para la consulta
      const fechasFormateadas = new Set<string>();
      
      // Agregar fechas en ambos formatos (YYYY-MM-DD y DD/MM/YYYY) para la consulta
      fechas.forEach(fecha => {
        // Agregar la fecha original
        fechasFormateadas.add(fecha);
        
        // Si la fecha está en formato YYYY-MM-DD, agregar también en formato DD/MM/YYYY
        if (fecha.includes('-')) {
          const [anio, mes, dia] = fecha.split('-');
          fechasFormateadas.add(`${dia}/${mes}/${anio}`);
        }
        // Si la fecha está en formato DD/MM/YYYY, agregar también en formato YYYY-MM-DD
        else if (fecha.includes('/')) {
          const [dia, mes, anio] = fecha.split('/');
          fechasFormateadas.add(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);
        }
      });
      
      // Convertir el Set a Array para la consulta
      const fechasArray = Array.from(fechasFormateadas);
      
      // Realizar la consulta optimizada
      const querySnapshot = await this.collection
        .where('codigoOficina', '==', codigoOficina)
        .where('fecha', 'in', fechasArray)
        .get();
      
      // Procesar los resultados
      const saldos: SaldosContables[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data() as SaldosContables;
        saldos.push(data);
      });
      
      return saldos;
    } catch (error) {
      console.error('Error al obtener saldos:', error);
      throw error;
    }
  }
}
