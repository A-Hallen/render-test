import { Request, Response } from 'express';
import { ConfiguracionReportesContabilidadService } from './configuracion-reportes-contabilidad.service';

export class ConfiguracionReportesContabilidadController {
    private configuracionReportesContabilidadService: ConfiguracionReportesContabilidadService;
    
    constructor() {
        this.configuracionReportesContabilidadService = new ConfiguracionReportesContabilidadService();
    }

    async obtenerConfiguracionesActivas(req: Request, res: Response): Promise<void> {
        try {
            const configuraciones = await this.configuracionReportesContabilidadService.obtenerConfiguracionesActivas();
            res.status(200).json(configuraciones);
        } catch (error) {
            console.error('Error fetching configuraciones activas:', error);
            res.status(500).json({ error: 'Error fetching configuraciones activas' });
        }
    }

    async obtenerCuentas(req: Request, res: Response): Promise<void> {
        try {
            const cuentas = await this.configuracionReportesContabilidadService.obtenerCuentas();
            res.status(200).json(cuentas);
        } catch (error) {
            console.error('Error fetching cuentas:', error);
            res.status(500).json({ error: 'Error fetching cuentas' });
        }
    }

    async generarReporteTendencia(req: Request, res: Response): Promise<void> {
        try {
            const reporteData = req.body;
            const response = await this.configuracionReportesContabilidadService.generarReporteTendencia(reporteData);
            res.status(200).json(response);
        } catch (error) {
            console.error('Error al generar reportes de tendencia', error);
            res.status(500).json({error: 'Error generando reportes de tendencia'});
        }
    }

    // Los métodos relacionados con reportes de contabilidad se han movido a ReportesContabilidadController

    async guardarConfiguracion(req: Request, res: Response): Promise<void> {
        try {
            const configuracion = req.body;
            const response = await this.configuracionReportesContabilidadService.guardarConfiguracion(configuracion);
            res.status(200).json(response);
        } catch (error) {
            console.error('Error al guardar configuración', error);
            res.status(500).json({error: 'Error guardando configuración'});
        }
    }

    async actualizarConfiguracion(req: Request, res: Response): Promise<void> {
        try {
            const configuracion = req.body;
            const response = await this.configuracionReportesContabilidadService.actualizarConfiguracion(configuracion);
            res.status(200).json(response);
        } catch (error) {
            console.error('Error al actualizar la configuración', error);
            res.status(500).json({error: 'Error actualizando configuración'});
        }
    }

    async eliminarConfiguracion(req: Request, res: Response): Promise<void> {
        try {
            const configuracion = req.body;
            console.log("[ConfiguracionReportesContabilidadController] body: ", configuracion);
            const response = await this.configuracionReportesContabilidadService.eliminarConfiguracion(configuracion);
            res.status(200).json(response);
        } catch (error) {
            console.error('Error al eliminar la configuración', error);
            res.status(500).json({error: 'Error eliminando configuración'});
        }
    }
}
