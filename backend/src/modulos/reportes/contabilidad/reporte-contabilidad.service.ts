import { ReporteContabilidadRepository } from './reporte-contabilidad.repository';

/**
 * Interfaz para las solicitudes de reportes de contabilidad
 */
interface ReporteRequest {
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
  oficina: string;
  nombreConfiguracion: string;
  tipoReporte?: 'diario' | 'mensual';
}

export class ReporteContabilidadService {
  private reporteContabilidadRepository: ReporteContabilidadRepository;

  constructor() {
    this.reporteContabilidadRepository = new ReporteContabilidadRepository();
  }

  /**
   * Genera un reporte de contabilidad basado en los parámetros proporcionados
   * @param fecha Fecha del reporte (para reportes de un solo día)
   * @param oficina Código de la oficina
   * @param nombreConfiguracion Nombre de la configuración del reporte
   * @returns Resultado del reporte de contabilidad
   */
  generarReporteContabilidad = async (
    fecha: string,
    oficina: string,
    nombreConfiguracion: string
  ) => {
    const reporteData = {
      fecha,
      oficina,
      nombreConfiguracion
    };
    return this.reporteContabilidadRepository.generarReporteContabilidad(reporteData);
  };
  
  /**
   * Genera un reporte de contabilidad para un rango de fechas
   * @param fechaInicio Fecha de inicio del rango
   * @param fechaFin Fecha de fin del rango
   * @param oficina Código de la oficina
   * @param nombreConfiguracion Nombre de la configuración del reporte
   * @param tipoReporte Tipo de reporte ('diario' o 'mensual')
   * @returns Resultado del reporte de contabilidad
   */
  generarReportePorRango = async (
    fechaInicio: string,
    fechaFin: string,
    oficina: string,
    nombreConfiguracion: string,
    tipoReporte: 'diario' | 'mensual' = 'mensual'
  ) => {
    const reporteData = {
      fechaInicio,
      fechaFin,
      oficina,
      nombreConfiguracion,
      tipoReporte
    };
    return this.reporteContabilidadRepository.generarReporteContabilidad(reporteData);
  };

  /**
   * Obtiene los datos históricos de contabilidad para un rango de fechas
   * @param fechaInicio Fecha de inicio del rango
   * @param fechaFin Fecha de fin del rango
   * @param oficina Código de la oficina
   * @param nombreConfiguracion Nombre de la configuración del reporte
   * @param tipoReporte Tipo de reporte ('diario' o 'mensual')
   * @returns Datos históricos de contabilidad
   */
  obtenerDatosHistoricos = async (
    fechaInicio: string,
    fechaFin: string,
    oficina: string,
    nombreConfiguracion: string,
    tipoReporte: 'diario' | 'mensual' = 'mensual'
  ) => {
    return this.reporteContabilidadRepository.obtenerDatosHistoricos(
      fechaInicio,
      fechaFin,
      oficina,
      nombreConfiguracion,
      tipoReporte
    );
  };
  
  /**
   * Obtiene un reporte de contabilidad existente por su ID
   * @param id ID del reporte
   * @returns Reporte de contabilidad
   */
  obtenerReportePorId = async (id: number) => {
    try {
      // Implementar método en el repositorio para obtener por ID
      const reporte = await this.reporteContabilidadRepository.obtenerReportePorId(id);
      
      if (!reporte) {
        return {
          success: false,
          message: 'Reporte no encontrado'
        };
      }
      
      return {
        success: true,
        message: 'Reporte obtenido correctamente',
        data: reporte
      };
    } catch (error: any) {
      console.error('Error al obtener reporte por ID:', error);
      return {
        success: false,
        message: `Error al obtener reporte: ${error.message || 'Error desconocido'}`
      };
    }
  };
  
  /**
   * Obtiene todos los reportes de contabilidad para una oficina
   * @param oficina Código de la oficina
   * @returns Lista de reportes de contabilidad
   */
  obtenerReportesPorOficina = async (oficina: string) => {
    try {
      // Implementar método en el repositorio para obtener por oficina
      const reportes = await this.reporteContabilidadRepository.obtenerReportesPorOficina(oficina);
      
      return {
        success: true,
        message: 'Reportes obtenidos correctamente',
        data: reportes
      };
    } catch (error: any) {
      console.error('Error al obtener reportes por oficina:', error);
      return {
        success: false,
        message: `Error al obtener reportes: ${error.message || 'Error desconocido'}`
      };
    }
  };
  
  /**
   * Actualiza un reporte de contabilidad existente
   * @param id ID del reporte a actualizar
   * @param datos Datos actualizados del reporte
   * @returns Resultado de la actualización
   */
  actualizarReporte = async (id: number, datos: any) => {
    return this.reporteContabilidadRepository.actualizarReporte(id, datos);
  };
  
  /**
   * Elimina lógicamente un reporte de contabilidad
   * @param id ID del reporte a eliminar
   * @returns Resultado de la eliminación
   */
  eliminarReporte = async (id: number) => {
    return this.reporteContabilidadRepository.eliminarReporte(id);
  };
  
  /**
   * Genera un reporte de contabilidad consolidado para un periodo específico
   * @param anio Año del periodo
   * @param mes Mes del periodo (1-12)
   * @param oficina Código de la oficina
   * @param nombreConfiguracion Nombre de la configuración del reporte
   * @returns Reporte consolidado
   */
  generarReporteConsolidado = async (
    anio: number,
    mes: number,
    oficina: string,
    nombreConfiguracion: string
  ) => {
    try {
      // Calcular fechas de inicio y fin del mes
      const fechaInicio = new Date(anio, mes - 1, 1).toISOString().split('T')[0];
      const fechaFin = new Date(anio, mes, 0).toISOString().split('T')[0];
      
      // Generar reporte mensual
      return this.generarReportePorRango(
        fechaInicio,
        fechaFin,
        oficina,
        nombreConfiguracion,
        'mensual'
      );
    } catch (error: any) {
      console.error('Error al generar reporte consolidado:', error);
      return {
        success: false,
        message: `Error al generar reporte consolidado: ${error.message || 'Error desconocido'}`
      };
    }
  };
}
