"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteContabilidadController = void 0;
const reporte_contabilidad_service_1 = require("./reporte-contabilidad.service");
class ReporteContabilidadController {
    constructor() {
        this.reporteContabilidadService = new reporte_contabilidad_service_1.ReporteContabilidadService();
    }
    /**
     * Genera un reporte de contabilidad para una fecha específica
     */
    async generarReporteContabilidad(req, res) {
        try {
            const { fecha, oficina, nombreConfiguracion } = req.body;
            if (!fecha || !oficina || !nombreConfiguracion) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos: fecha, oficina o nombreConfiguracion'
                });
                return;
            }
            const response = await this.reporteContabilidadService.generarReporteContabilidad(fecha, oficina, nombreConfiguracion);
            res.status(response.success ? 200 : 400).json(response);
        }
        catch (error) {
            console.error('Error al generar reporte de contabilidad', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte de contabilidad',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    /**
     * Genera un reporte de contabilidad para un rango de fechas
     */
    async generarReportePorRango(req, res) {
        try {
            const data = req.body;
            if (!data.fechaInicio || !data.fechaFin || !data.oficina || !data.nombreConfiguracion) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos: fechaInicio, fechaFin, oficina o nombreConfiguracion'
                });
                return;
            }
            // Validar que tipoReporte sea uno de los valores permitidos
            const tipoReporteValidado = data.tipoReporte === 'diario' ? 'diario' : 'mensual';
            const response = await this.reporteContabilidadService.generarReportePorRango(data.fechaInicio, data.fechaFin, data.oficina, data.nombreConfiguracion, tipoReporteValidado);
            res.status(response.success ? 200 : 400).json(response);
        }
        catch (error) {
            console.error('Error al generar reporte por rango', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte por rango',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    /**
     * Genera un reporte consolidado para un periodo específico
     */
    async generarReporteConsolidado(req, res) {
        try {
            const { anio, mes, oficina, nombreConfiguracion } = req.body;
            if (!anio || !mes || !oficina || !nombreConfiguracion) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos: anio, mes, oficina o nombreConfiguracion'
                });
                return;
            }
            const response = await this.reporteContabilidadService.generarReporteConsolidado(anio, mes, oficina, nombreConfiguracion);
            res.status(response.success ? 200 : 400).json(response);
        }
        catch (error) {
            console.error('Error al generar reporte consolidado', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte consolidado',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}
exports.ReporteContabilidadController = ReporteContabilidadController;
