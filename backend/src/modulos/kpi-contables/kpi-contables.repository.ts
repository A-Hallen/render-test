import * as admin from 'firebase-admin';
import { IndicadorContable } from "../indicadores-contables/interfaces/IndicadorContable.interface";
import { devolverKPIsPorOficinaRangoFechas } from "./transformers/devolverKPIsPorOficinaRangoFechas";
import { IndicadoresContablesRepository } from "../indicadores-contables/indicadores-contables.repository";
import { KPICalculado } from "./interfaces/KPICalculado.interface";

// Definimos localmente la interfaz necesaria para evitar problemas de importación
interface IndicadorColor {
  id: string;
  nombre: string;
  color: string;
}

export class KPIContablesRepository {
  indicadoresRepository: IndicadoresContablesRepository;

  constructor() {
    this.indicadoresRepository = new IndicadoresContablesRepository();
  }

  async obtenerPromedioKPIsOficina(
    oficina: string,
    fechaInicio: string,
    fechaFin: string
  ) {
    const indicadores = await this.indicadoresRepository.obtenerTodos();
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
      const indicadores = await this.indicadoresRepository.obtenerTodos();
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

  /**
   * Obtiene un KPI específico para una oficina en una fecha determinada
   * @param oficina Código de la oficina
   * @param idIndicador ID del indicador
   * @param fecha Fecha en formato YYYY-MM-DD
   * @returns Objeto con el KPI solicitado o null si no existe
   */
  async obtenerKPIEspecifico(
    oficina: string,
    idIndicador: string,
    fecha: string
  ): Promise<{
    indicador: IndicadorColor | null;
    kpi: KPICalculado | null;
    mensaje?: string;
  }> {
    try {
      console.log(`[KPIContablesRepository] Obteniendo KPI específico para oficina: ${oficina}, indicador: ${idIndicador}, fecha: ${fecha}`);
      
      // Obtener el indicador solicitado
      const indicador = await this.indicadoresRepository.obtenerPorId(idIndicador);
      
      if (!indicador) {
        console.log(`[KPIContablesRepository] No se encontró el indicador con ID: ${idIndicador}`);
        return {
          indicador: null,
          kpi: null,
          mensaje: `No se encontró el indicador con ID: ${idIndicador}`
        };
      }
      
      // Obtener los KPIs calculados para esa fecha
      const resultado = await devolverKPIsPorOficinaRangoFechas(
        [indicador],
        oficina,
        fecha,
        fecha
      );
      
      // Verificar si hay resultados para la fecha solicitada
      if (!resultado.kpisCalculados || !resultado.kpisCalculados[fecha]) {
        console.log(`[KPIContablesRepository] No hay KPIs calculados para la fecha: ${fecha}`);
        return {
          indicador: {
            id: indicador.id,
            nombre: indicador.nombre,
            color: indicador.color
          },
          kpi: null,
          mensaje: `No hay datos disponibles para el indicador en la fecha solicitada`
        };
      }
      
      // Buscar el KPI específico
      const kpiEncontrado = resultado.kpisCalculados[fecha].find(
        kpi => kpi.idIndicador.toString() === idIndicador && kpi.codigoOficina.toString() === oficina
      );
      
      if (!kpiEncontrado) {
        console.log(`[KPIContablesRepository] No se encontró el KPI específico`);
        return {
          indicador: {
            id: indicador.id,
            nombre: indicador.nombre,
            color: indicador.color
          },
          kpi: null,
          mensaje: `No se encontró el KPI para el indicador ${indicador.nombre} en la fecha ${fecha}`
        };
      }
      
      console.log(`[KPIContablesRepository] KPI encontrado correctamente`);
      
      return {
        indicador: {
          id: indicador.id,
          nombre: indicador.nombre,
          color: indicador.color
        },
        kpi: kpiEncontrado,
        mensaje: 'KPI obtenido correctamente'
      };
    } catch (error: any) {
      console.error(`[KPIContablesRepository] Error al obtener KPI específico: ${error.message}`);
      
      return {
        indicador: null,
        kpi: null,
        mensaje: `Error al obtener el KPI: ${error.message}`
      };
    }
  }
}
