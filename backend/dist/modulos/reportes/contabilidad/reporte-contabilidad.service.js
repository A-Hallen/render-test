"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteContabilidadService = void 0;
const reporte_contabilidad_repository_1 = require("./reporte-contabilidad.repository");
class ReporteContabilidadService {
    constructor() {
        /**
         * Genera un reporte de contabilidad basado en los parámetros proporcionados
         * @param fecha Fecha del reporte (para reportes de un solo día)
         * @param oficina Código de la oficina
         * @param nombreConfiguracion Nombre de la configuración del reporte
         * @returns Resultado del reporte de contabilidad
         */
        this.generarReporteContabilidad = async (fecha, oficina, nombreConfiguracion) => {
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
        this.generarReportePorRango = async (fechaInicio, fechaFin, oficina, nombreConfiguracion, tipoReporte = 'mensual') => {
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
        this.generarReporteConsolidado = async (anio, mes, oficina, nombreConfiguracion) => {
            try {
                // Calcular fechas de inicio y fin del mes
                const fechaInicio = new Date(anio, mes - 1, 1).toISOString().split('T')[0];
                const fechaFin = new Date(anio, mes, 0).toISOString().split('T')[0];
                // Generar reporte mensual
                return this.generarReportePorRango(fechaInicio, fechaFin, oficina, nombreConfiguracion, 'mensual');
            }
            catch (error) {
                console.error('Error al generar reporte consolidado:', error);
                return {
                    success: false,
                    message: `Error al generar reporte consolidado: ${error.message || 'Error desconocido'}`
                };
            }
        };
        this.reporteContabilidadRepository = new reporte_contabilidad_repository_1.ReporteContabilidadRepository();
    }
}
exports.ReporteContabilidadService = ReporteContabilidadService;
