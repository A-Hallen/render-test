import { Request, Response } from 'express';
import { ReporteContabilidadService } from './reporte-contabilidad.service';
import { ReporteContabilidadRangoRequest } from 'shared/src/types/reportes.types';

export class ReporteContabilidadController {
    private reporteContabilidadService: ReporteContabilidadService;
    
    constructor() {
        this.reporteContabilidadService = new ReporteContabilidadService();
    }

    /**
     * Genera un reporte de contabilidad para una fecha específica
     */
    async generarReporteContabilidad(req: Request, res: Response): Promise<void> {
        try {
            const { fecha, oficina, nombreConfiguracion } = req.body;
            
            if (!fecha || !oficina || !nombreConfiguracion) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos: fecha, oficina o nombreConfiguracion'
                });
                return;
            }
            
            const response = await this.reporteContabilidadService.generarReporteContabilidad(
                fecha,
                oficina,
                nombreConfiguracion
            );
            res.status(response.success ? 200 : 400).json(response);
        } catch (error: any) {
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
    async generarReportePorRango(req: Request, res: Response): Promise<void> {
        try {
            const data: ReporteContabilidadRangoRequest = req.body;
            
            if (!data.fechaInicio || !data.fechaFin || !data.oficina || !data.nombreConfiguracion) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos: fechaInicio, fechaFin, oficina o nombreConfiguracion'
                });
                return;
            }
            
            // Validar que tipoReporte sea uno de los valores permitidos
            const tipoReporteValidado = data.tipoReporte === 'diario' ? 'diario' : 'mensual';
            
            const response = await this.reporteContabilidadService.generarReportePorRango(
                data.fechaInicio,
                data.fechaFin,
                data.oficina,
                data.nombreConfiguracion,
                tipoReporteValidado
            );
            res.status(response.success ? 200 : 400).json(response);
        } catch (error: any) {
            console.error('Error al generar reporte por rango', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte por rango',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    /**
     * Obtiene datos históricos de contabilidad para un rango de fechas
     */
    async obtenerDatosHistoricos(req: Request, res: Response): Promise<void> {
        try {
            const { fechaInicio, fechaFin, oficina, nombreConfiguracion, tipoReporte } = req.body;
            
            if (!fechaInicio || !fechaFin || !oficina || !nombreConfiguracion) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos'
                });
                return;
            }
            
            // Validar que tipoReporte sea uno de los valores permitidos
            const tipoReporteValidado = tipoReporte === 'diario' ? 'diario' : 'mensual';
            
            const response = await this.reporteContabilidadService.obtenerDatosHistoricos(
                fechaInicio,
                fechaFin,
                oficina,
                nombreConfiguracion,
                tipoReporteValidado
            );
            
            res.status(response.success ? 200 : 400).json(response);
        } catch (error: any) {
            console.error('Error al obtener datos históricos de contabilidad', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener datos históricos de contabilidad',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    /**
     * Genera un reporte consolidado para un periodo específico
     */
    async generarReporteConsolidado(req: Request, res: Response): Promise<void> {
        try {
            const { anio, mes, oficina, nombreConfiguracion } = req.body;
            
            if (!anio || !mes || !oficina || !nombreConfiguracion) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos: anio, mes, oficina o nombreConfiguracion'
                });
                return;
            }
            
            const response = await this.reporteContabilidadService.generarReporteConsolidado(
                anio,
                mes,
                oficina,
                nombreConfiguracion
            );
            
            res.status(response.success ? 200 : 400).json(response);
        } catch (error: any) {
            console.error('Error al generar reporte consolidado', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte consolidado',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    /**
     * Obtiene un reporte por su ID
     */
    async obtenerReportePorId(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de reporte inválido'
                });
                return;
            }
            
            const response = await this.reporteContabilidadService.obtenerReportePorId(id);
            res.status(response.success ? 200 : 404).json(response);
        } catch (error: any) {
            console.error('Error al obtener reporte por ID', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener reporte por ID',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    /**
     * Obtiene todos los reportes para una oficina
     */
    async obtenerReportesPorOficina(req: Request, res: Response): Promise<void> {
        try {
            const { oficina } = req.params;
            
            if (!oficina) {
                res.status(400).json({
                    success: false,
                    message: 'Falta el parámetro oficina'
                });
                return;
            }
            
            const response = await this.reporteContabilidadService.obtenerReportesPorOficina(oficina);
            res.status(response.success ? 200 : 400).json(response);
        } catch (error: any) {
            console.error('Error al obtener reportes por oficina', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener reportes por oficina',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    
    /**
     * Actualiza un reporte existente
     */
    async actualizarReporte(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const datos = req.body;
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de reporte inválido'
                });
                return;
            }
            
            const response = await this.reporteContabilidadService.actualizarReporte(id, datos);
            res.status(response.success ? 200 : 400).json(response);
        } catch (error: any) {
            console.error('Error al actualizar reporte', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar reporte',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    /**
     * Elimina un reporte lógicamente
     */
    async eliminarReporte(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de reporte inválido'
                });
                return;
            }
            
            const response = await this.reporteContabilidadService.eliminarReporte(id);
            res.status(response.success ? 200 : 400).json(response);
        } catch (error: any) {
            console.error('Error al eliminar reporte', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar reporte',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}
