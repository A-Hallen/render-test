"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesService = void 0;
const reportes_model_1 = require("./reportes.model");
const reportes_repository_1 = require("./reportes.repository");
class ReportesService {
    constructor() {
        this.reportesRepository = new reportes_repository_1.ReportesRepository();
    }
    async obtenerConfiguracionesActivas() {
        const configuraciones = await this.reportesRepository.obtenerConfiguracionesActivas();
        return {
            configuraciones: configuraciones,
        };
    }
    async obtenerCuentas() {
        return {
            cuentas: await this.reportesRepository.obtenerCuentas(),
        };
    }
    async generarReporteTendencia(reporteData) {
        const response = await this.reportesRepository.generarReporteTendencia(reporteData);
        return response;
    }
    async guardarConfiguracion(configuracion) {
        //convertir al modelo para guardar en la bd mapeando sus propiedades
        const configuracionModel = new reportes_model_1.ConfiguracionReporte();
        configuracionModel.nombre = configuracion.nombre;
        configuracionModel.descripcion = configuracion.descripcion;
        configuracionModel.categorias = configuracion.categorias;
        configuracionModel.esActivo = configuracion.esActivo;
        configuracionModel.fechaCreacion = new Date();
        configuracionModel.fechaModificacion = new Date();
        await this.reportesRepository.crear(configuracionModel.toDbObject());
        return {
            success: true,
            message: "Configuración guardada correctamente",
        };
    }
    async actualizarConfiguracion(configuracion) {
        const response = await this.reportesRepository.actualizarConfiguracion(configuracion);
        return response;
    }
    async eliminarConfiguracion(configuracion) {
        console.log("[ReportesService] eliminando configuracion... ", configuracion);
        await this.reportesRepository.eliminarConfiguracion(configuracion);
        return {
            success: true,
            message: "Configuracion de reporte eliminada correctamente",
        };
    }
}
exports.ReportesService = ReportesService;
