"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionReportesContabilidadController = void 0;
const configuracion_reportes_contabilidad_service_1 = require("./configuracion-reportes-contabilidad.service");
class ConfiguracionReportesContabilidadController {
    constructor() {
        this.configuracionReportesContabilidadService = new configuracion_reportes_contabilidad_service_1.ConfiguracionReportesContabilidadService();
    }
    async obtenerConfiguracionesActivas(req, res) {
        try {
            const configuraciones = await this.configuracionReportesContabilidadService.obtenerConfiguracionesActivas();
            res.status(200).json(configuraciones);
        }
        catch (error) {
            console.error('Error fetching configuraciones activas:', error);
            res.status(500).json({ error: 'Error fetching configuraciones activas' });
        }
    }
    async obtenerCuentas(req, res) {
        try {
            const cuentas = await this.configuracionReportesContabilidadService.obtenerCuentas();
            res.status(200).json(cuentas);
        }
        catch (error) {
            console.error('Error fetching cuentas:', error);
            res.status(500).json({ error: 'Error fetching cuentas' });
        }
    }
    async generarReporteTendencia(req, res) {
        try {
            const reporteData = req.body;
            const response = await this.configuracionReportesContabilidadService.generarReporteTendencia(reporteData);
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error al generar reportes de tendencia', error);
            res.status(500).json({ error: 'Error generando reportes de tendencia' });
        }
    }
    // Los métodos relacionados con reportes de contabilidad se han movido a ReportesContabilidadController
    async guardarConfiguracion(req, res) {
        try {
            const configuracion = req.body;
            const response = await this.configuracionReportesContabilidadService.guardarConfiguracion(configuracion);
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error al guardar configuración', error);
            res.status(500).json({ error: 'Error guardando configuración' });
        }
    }
    async actualizarConfiguracion(req, res) {
        try {
            const configuracion = req.body;
            const response = await this.configuracionReportesContabilidadService.actualizarConfiguracion(configuracion);
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error al actualizar la configuración', error);
            res.status(500).json({ error: 'Error actualizando configuración' });
        }
    }
    async eliminarConfiguracion(req, res) {
        try {
            const configuracion = req.body;
            console.log("[ConfiguracionReportesContabilidadController] body: ", configuracion);
            const response = await this.configuracionReportesContabilidadService.eliminarConfiguracion(configuracion);
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error al eliminar la configuración', error);
            res.status(500).json({ error: 'Error eliminando configuración' });
        }
    }
}
exports.ConfiguracionReportesContabilidadController = ConfiguracionReportesContabilidadController;
