import * as admin from 'firebase-admin';
import { IndicadorContable } from "../indicadores-contables/interfaces/IndicadorContable.interface";
import { devolverKPIsPorOficinaRangoFechas } from "./transformers/devolverKPIsPorOficinaRangoFechas";

// Definimos localmente la interfaz necesaria para evitar problemas de importación
interface IndicadorColor {
  id: string;
  nombre: string;
  color: string;
}

export class KPIContablesRepository {
  private collection: admin.firestore.CollectionReference;

  constructor() {
    this.collection = admin.firestore().collection("Indicadores");
  }

  async obtenerTodos(): Promise<IndicadorContable[]> {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map(doc => doc.data() as IndicadorContable);
    } catch (error) {
      console.error("Error al obtener todos los indicadores:", error);
      return [];
    }
  }

  async obtenerPromedioKPIsOficina(
    oficina: string,
    fechaInicio: string,
    fechaFin: string
  ) {
    const indicadores = await this.obtenerTodos();
    const resultado = await devolverKPIsPorOficinaRangoFechas(
      indicadores,
      oficina,
      fechaInicio,
      fechaFin
    );

    const indicadoresColor: IndicadorColor[] = indicadores.map((i) => {
      return { id: i.id, nombre: i.nombre, color: i.color };
    });

    return {
      indicadores: indicadoresColor,
      kpisCalculados: resultado.kpisCalculados,
    };
  }

  /**
   * Obtiene los KPIs por oficina y rango de fechas sin promediar
   * @param oficina Código de la oficina
   * @param fechaInicio Fecha de inicio en formato YYYY-MM-DD
   * @param fechaFin Fecha de fin en formato YYYY-MM-DD
   * @returns Objeto con los KPIs calculados por fecha
   */
  async obtenerKPIsPorOficinaRangosFecha(
    oficina: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<{
    indicadores: IndicadorColor[];
    kpisCalculados: { [key: string]: any };
    mensaje?: string;
  }> {
    try {
      console.log(`[KPIContablesRepository] Obteniendo KPIs para oficina: ${oficina}, desde: ${fechaInicio}, hasta: ${fechaFin}`);
      
      // Obtener todos los indicadores configurados
      const indicadores = await this.obtenerTodos();
      console.log(`[KPIContablesRepository] Se encontraron ${indicadores.length} indicadores configurados`);
      
      // Obtener los KPIs calculados
      const resultado = await devolverKPIsPorOficinaRangoFechas(
        indicadores,
        oficina,
        fechaInicio,
        fechaFin
      );
      
      // Extraer los colores de los indicadores para facilitar la visualización
      const indicadoresColor: IndicadorColor[] = indicadores.map((i) => {
        return { id: i.id, nombre: i.nombre, color: i.color };
      });
      
      console.log(`[KPIContablesRepository] KPIs calculados correctamente`);
      
      return {
        indicadores: indicadoresColor,
        kpisCalculados: resultado.kpisCalculados,
        mensaje: 'KPIs calculados correctamente'
      };
    } catch (error: any) {
      console.error(`[KPIContablesRepository] Error al obtener KPIs: ${error.message}`);
      
      // En caso de error, devolver una estructura vacía pero válida
      return {
        indicadores: [],
        kpisCalculados: {},
        mensaje: `Error al obtener KPIs: ${error.message}`
      };
    }
  }
}
