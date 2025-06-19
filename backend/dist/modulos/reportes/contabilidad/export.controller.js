"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const reporte_contabilidad_service_1 = require("./reporte-contabilidad.service");
const export_service_1 = require("./export.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
class ExportController {
    constructor() {
        this.reporteContabilidadService = new reporte_contabilidad_service_1.ReporteContabilidadService();
        this.exportService = new export_service_1.ExportService();
    }
    /**
     * Exporta un reporte de contabilidad por rango a formato Excel
     */
    async exportarReportePorRangoExcel(req, res) {
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
            // Generar el reporte
            const response = await this.reporteContabilidadService.generarReportePorRango(data.fechaInicio, data.fechaFin, data.oficina, data.nombreConfiguracion, tipoReporteValidado);
            if (!response.success || !response.data) {
                res.status(400).json(response);
                return;
            }
            // Adaptar los datos del modelo al formato esperado por el servicio de exportación
            const reporteData = this.adaptarDatosParaExportacion(response.data);
            // Exportar a Excel
            const filePath = await this.exportService.generarExcel(reporteData);
            // Enviar respuesta con la ruta del archivo
            res.status(200).json({
                success: true,
                message: 'Reporte exportado a Excel correctamente',
                data: {
                    filePath: filePath,
                    fileName: path.basename(filePath)
                }
            });
        }
        catch (error) {
            console.error('Error al exportar reporte a Excel:', error);
            res.status(500).json({
                success: false,
                message: 'Error al exportar reporte a Excel',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    /**
     * Exporta un reporte de contabilidad por rango a formato PDF
     */
    async exportarReportePorRangoPDF(req, res) {
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
            // Generar el reporte
            const response = await this.reporteContabilidadService.generarReportePorRango(data.fechaInicio, data.fechaFin, data.oficina, data.nombreConfiguracion, tipoReporteValidado);
            if (!response.success || !response.data) {
                res.status(400).json(response);
                return;
            }
            // Adaptar los datos del modelo al formato esperado por el servicio de exportación
            const reporteData = this.adaptarDatosParaExportacion(response.data);
            // Exportar a PDF
            const filePath = await this.exportService.generarPDF(reporteData);
            // Enviar respuesta con la ruta del archivo
            res.status(200).json({
                success: true,
                message: 'Reporte exportado a PDF correctamente',
                data: {
                    filePath: filePath,
                    fileName: path.basename(filePath)
                }
            });
        }
        catch (error) {
            console.error('Error al exportar reporte a PDF:', error);
            res.status(500).json({
                success: false,
                message: 'Error al exportar reporte a PDF',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    /**
     * Adapta los datos del modelo ReporteContabilidad al formato ReporteData esperado por el servicio de exportación
     * @param reporteResponse Respuesta del servicio de reportes que contiene los datos del reporte
     * @returns Datos adaptados al formato esperado
     */
    adaptarDatosParaExportacion(reporteResponse) {
        // Extraer los datos del reporte de la respuesta
        const reporteData = reporteResponse.data || reporteResponse;
        // Extraer las fechas únicas de los valores por fecha
        const fechasSet = new Set();
        // Recopilar todas las fechas de todas las categorías y cuentas
        if (reporteData.categorias && Array.isArray(reporteData.categorias)) {
            reporteData.categorias.forEach((categoria) => {
                // Añadir fechas de totalesPorFecha
                if (categoria.totalesPorFecha) {
                    Object.keys(categoria.totalesPorFecha).forEach(fecha => fechasSet.add(fecha));
                }
                // Recorrer las cuentas
                if (categoria.cuentas && Array.isArray(categoria.cuentas)) {
                    categoria.cuentas.forEach((cuenta) => {
                        // Añadir fechas de cada cuenta
                        if (cuenta.valoresPorFecha) {
                            Object.keys(cuenta.valoresPorFecha).forEach(fecha => fechasSet.add(fecha));
                        }
                    });
                }
            });
        }
        // Convertir el Set a un array ordenado
        const fechas = Array.from(fechasSet).sort();
        // Si no hay fechas, usar al menos la fecha actual como fallback
        if (fechas.length === 0) {
            console.error('Error: No se encontraron fechas en los datos del reporte');
            fechas.push(new Date().toISOString().split('T')[0]);
        }
        // Crear estructura para los datos adaptados
        const datosAdaptados = {
            fechaInicio: reporteData.fechaInicio,
            fechaFin: reporteData.fechaFin,
            oficina: reporteData.oficina,
            nombreConfiguracion: reporteData.nombreConfiguracion,
            tipoReporte: reporteData.tipoReporte,
            fechas: fechas,
            categorias: [],
            totalesGeneralesPorFecha: reporteData.totalesGeneralesPorFecha || {},
            descripcionPeriodo: reporteData.descripcionPeriodo
        };
        // Si no hay totales generales, inicializarlos
        if (!datosAdaptados.totalesGeneralesPorFecha || Object.keys(datosAdaptados.totalesGeneralesPorFecha).length === 0) {
            datosAdaptados.totalesGeneralesPorFecha = {};
            fechas.forEach((fecha) => {
                datosAdaptados.totalesGeneralesPorFecha[fecha] = 0;
            });
        }
        // Adaptar categorías y cuentas
        if (reporteData.categorias && Array.isArray(reporteData.categorias)) {
            datosAdaptados.categorias = reporteData.categorias.map((categoria) => {
                // Asegurarse de que estamos trabajando con el objeto de categoría
                const categoriaObj = categoria;
                // Inicializar o usar los totales por fecha existentes
                const totalesPorFecha = {};
                // Asegurarse de que todos los totales por fecha estén inicializados
                fechas.forEach((fecha) => {
                    totalesPorFecha[fecha] = categoriaObj.totalesPorFecha && categoriaObj.totalesPorFecha[fecha] !== undefined
                        ? categoriaObj.totalesPorFecha[fecha]
                        : 0;
                });
                // Adaptar cuentas
                const cuentasAdaptadas = categoriaObj.cuentas.map((cuenta) => {
                    // Asegurarse de que estamos trabajando con el objeto de cuenta
                    const cuentaObj = cuenta;
                    // Inicializar o usar los valores por fecha existentes
                    const valoresPorFecha = {};
                    // Asegurarse de que todos los valores por fecha estén inicializados
                    fechas.forEach((fecha) => {
                        valoresPorFecha[fecha] = cuentaObj.valoresPorFecha && cuentaObj.valoresPorFecha[fecha] !== undefined
                            ? cuentaObj.valoresPorFecha[fecha]
                            : 0;
                        // Acumular al total de la categoría si no estaba inicializado previamente
                        if (!(categoriaObj.totalesPorFecha && categoriaObj.totalesPorFecha[fecha] !== undefined)) {
                            totalesPorFecha[fecha] += valoresPorFecha[fecha];
                        }
                    });
                    // Calcular diferencias entre períodos para esta cuenta si no existen
                    const diferencias = {};
                    if (fechas.length > 1) {
                        for (let i = 1; i < fechas.length; i++) {
                            const fechaActual = fechas[i];
                            const fechaAnterior = fechas[i - 1];
                            const valorActual = valoresPorFecha[fechaActual];
                            const valorAnterior = valoresPorFecha[fechaAnterior];
                            // Si ya existe la diferencia para esta fecha, usarla
                            if (cuentaObj.diferencias && cuentaObj.diferencias[fechaActual]) {
                                diferencias[fechaActual] = cuentaObj.diferencias[fechaActual];
                            }
                            else {
                                // Calcular la diferencia
                                const diferencia = valorActual - valorAnterior;
                                let porcentaje = 0;
                                if (valorAnterior !== 0) {
                                    porcentaje = (diferencia / Math.abs(valorAnterior)) * 100;
                                }
                                else if (diferencia !== 0) {
                                    porcentaje = diferencia > 0 ? 100 : -100;
                                }
                                diferencias[fechaActual] = {
                                    valor: diferencia,
                                    porcentaje: parseFloat(porcentaje.toFixed(2))
                                };
                            }
                        }
                    }
                    return {
                        codigo: cuentaObj.codigo,
                        nombre: cuentaObj.nombre,
                        valoresPorFecha,
                        diferencias
                    };
                });
                // Calcular diferencias entre períodos para la categoría si no existen
                const diferencias = {};
                if (fechas.length > 1) {
                    for (let i = 1; i < fechas.length; i++) {
                        const fechaActual = fechas[i];
                        const fechaAnterior = fechas[i - 1];
                        const valorActual = totalesPorFecha[fechaActual];
                        const valorAnterior = totalesPorFecha[fechaAnterior];
                        // Si ya existe la diferencia para esta fecha, usarla
                        if (categoriaObj.diferencias && categoriaObj.diferencias[fechaActual]) {
                            diferencias[fechaActual] = categoriaObj.diferencias[fechaActual];
                        }
                        else {
                            // Calcular la diferencia
                            const diferencia = valorActual - valorAnterior;
                            let porcentaje = 0;
                            if (valorAnterior !== 0) {
                                porcentaje = (diferencia / Math.abs(valorAnterior)) * 100;
                            }
                            else if (diferencia !== 0) {
                                porcentaje = diferencia > 0 ? 100 : -100;
                            }
                            diferencias[fechaActual] = {
                                valor: diferencia,
                                porcentaje: parseFloat(porcentaje.toFixed(2))
                            };
                        }
                    }
                }
                // Actualizar los totales generales por fecha
                Object.entries(totalesPorFecha).forEach(([fecha, total]) => {
                    datosAdaptados.totalesGeneralesPorFecha[fecha] += total;
                });
                return {
                    nombre: categoriaObj.nombre,
                    cuentas: cuentasAdaptadas,
                    totalesPorFecha,
                    diferencias
                };
            });
        }
        // Calcular diferencias generales entre períodos
        if (fechas.length > 1) {
            datosAdaptados.diferenciasGenerales = {};
            // Intentar usar las diferencias generales que ya vienen en la respuesta
            if (reporteData.diferenciasGenerales && Object.keys(reporteData.diferenciasGenerales).length > 0) {
                datosAdaptados.diferenciasGenerales = reporteData.diferenciasGenerales;
            }
            else {
                // Calcular las diferencias generales si no existen
                for (let i = 1; i < fechas.length; i++) {
                    const fechaActual = fechas[i];
                    const fechaAnterior = fechas[i - 1];
                    const valorActual = datosAdaptados.totalesGeneralesPorFecha[fechaActual];
                    const valorAnterior = datosAdaptados.totalesGeneralesPorFecha[fechaAnterior];
                    const diferencia = valorActual - valorAnterior;
                    let porcentaje = 0;
                    if (valorAnterior !== 0) {
                        porcentaje = (diferencia / Math.abs(valorAnterior)) * 100;
                    }
                    else if (diferencia !== 0) {
                        porcentaje = diferencia > 0 ? 100 : -100;
                    }
                    datosAdaptados.diferenciasGenerales[fechaActual] = {
                        valor: diferencia,
                        porcentaje: parseFloat(porcentaje.toFixed(2))
                    };
                }
            }
        }
        return datosAdaptados;
    }
    /**
     * Descarga un archivo exportado
     */
    async descargarArchivo(req, res) {
        try {
            const { fileName } = req.params;
            if (!fileName) {
                res.status(400).json({
                    success: false,
                    message: 'Nombre de archivo no proporcionado'
                });
                return;
            }
            // Construir ruta completa del archivo
            const filePath = path.join(__dirname, '../../../../exports', fileName);
            // Verificar si el archivo existe
            if (!fs.existsSync(filePath)) {
                res.status(404).json({
                    success: false,
                    message: 'Archivo no encontrado'
                });
                return;
            }
            // Determinar el tipo MIME según la extensión
            const extension = path.extname(fileName).toLowerCase();
            let contentType = 'application/octet-stream';
            if (extension === '.xlsx') {
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }
            else if (extension === '.pdf') {
                contentType = 'application/pdf';
            }
            // Configurar encabezados para la descarga
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            // Enviar el archivo
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        }
        catch (error) {
            console.error('Error al descargar archivo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al descargar archivo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}
exports.ExportController = ExportController;
