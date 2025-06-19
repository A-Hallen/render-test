"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionReportesContabilidadService = void 0;
const configuracion_reportes_contabilidad_repository_1 = require("./configuracion-reportes-contabilidad.repository");
const shared_1 = require("shared");
class ConfiguracionReportesContabilidadService {
    constructor() {
        this.configuracionReportesContabilidadRepository = new configuracion_reportes_contabilidad_repository_1.ConfiguracionReportesContabilidadRepository();
    }
    async obtenerConfiguracionesActivas() {
        const configuraciones = await this.configuracionReportesContabilidadRepository.obtenerConfiguracionesActivas();
        return {
            configuraciones: configuraciones,
        };
    }
    async obtenerCuentas() {
        return {
            cuentas: await this.configuracionReportesContabilidadRepository.obtenerCuentas(),
        };
    }
    async generarReporteTendencia(reporteData) {
        const response = await this.configuracionReportesContabilidadRepository.generarReporteTendencia(reporteData);
        if (!response.data) {
            return {
                success: response.success,
                message: response.message
            };
        }
        // Crear un objeto que cumpla con la estructura ReporteContabilidadData
        const reporteContabilidadData = {
            esActivo: true,
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString(),
            id: 0,
            fechaInicio: reporteData.fechaInicio,
            fechaFin: reporteData.fechaFin,
            oficina: response.data.oficina,
            nombreConfiguracion: reporteData.tipo.nombre,
            tipoReporte: reporteData.periodo,
            categorias: response.data.categorias.map(cat => ({
                nombre: cat.nombre,
                cuentas: cat.cuentas.map(cuenta => ({
                    codigo: cuenta.codigo.toString(),
                    nombre: cuenta.nombre,
                    valoresPorFecha: cuenta.valores,
                    diferencias: {},
                    valores: cuenta.valores
                })),
                totalesPorFecha: cat.valores,
                diferencias: {},
                valores: cat.valores
            })),
            fechas: response.data.fechas
        };
        // Adaptar los datos usando la función de utilidad
        const adaptedData = (0, shared_1.adaptarDatosReporte)(reporteContabilidadData);
        return {
            success: true,
            message: "Reporte generado correctamente",
            data: adaptedData,
        };
    }
    async guardarConfiguracion(configuracion) {
        //convertir al modelo para guardar en la bd mapeando sus propiedades
        await this.configuracionReportesContabilidadRepository.crear(configuracion);
        return {
            success: true,
            message: "Configuración guardada correctamente",
        };
    }
    async actualizarConfiguracion(configuracion) {
        const response = await this.configuracionReportesContabilidadRepository.actualizarConfiguracion(configuracion);
        return response;
    }
    async eliminarConfiguracion(configuracion) {
        console.log("[ConfiguracionReportesContabilidadService] eliminando configuracion... ", configuracion);
        await this.configuracionReportesContabilidadRepository.eliminarConfiguracion(configuracion);
        return {
            success: true,
            message: "Configuracion de reporte eliminada correctamente",
        };
    }
}
exports.ConfiguracionReportesContabilidadService = ConfiguracionReportesContabilidadService;
