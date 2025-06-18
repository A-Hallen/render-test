import { ReporteContabilidadRepository } from './reporte-contabilidad.repository';

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
