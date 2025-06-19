"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesController = void 0;
const reportes_service_1 = require("./reportes.service");
class ReportesController {
    constructor() {
        this.reportesService = new reportes_service_1.ReportesService();
    }
    async obtenerConfiguracionesActivas(req, res) {
        try {
            const configuraciones = await this.reportesService.obtenerConfiguracionesActivas();
            res.status(200).json(configuraciones);
        }
        catch (error) {
            console.error('Error fetching configuraciones activas:', error);
            res.status(500).json({ error: 'Error fetching configuraciones activas' });
        }
    }
    async obtenerCuentas(req, res) {
        try {
            const cuentas = await this.reportesService.obtenerCuentas();
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
            const response = await this.reportesService.generarReporteTendencia(reporteData);
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error al generar reportes de tendencia', error);
            res.status(500).json({ error: 'Error generando reportes de tendencia' });
        }
    }
    async guardarConfiguracion(req, res) {
        try {
            const configuracion = req.body;
            const response = await this.reportesService.guardarConfiguracion(configuracion);
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
            const response = await this.reportesService.actualizarConfiguracion(configuracion);
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
            console.log("[Controller] body: ", configuracion);
            const response = await this.reportesService.eliminarConfiguracion(configuracion);
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error al eliminar la configuración', error);
            res.status(500).json({ error: 'Error eliminando configuración' });
        }
    }
}
exports.ReportesController = ReportesController;
