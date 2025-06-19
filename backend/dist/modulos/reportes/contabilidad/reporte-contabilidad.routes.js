"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reporte_contabilidad_controller_1 = require("./reporte-contabilidad.controller");
const export_controller_1 = require("./export.controller");
const router = (0, express_1.Router)();
const reporteContabilidadController = new reporte_contabilidad_controller_1.ReporteContabilidadController();
const exportController = new export_controller_1.ExportController();
// Rutas para reportes por fecha específica
router.post('/', reporteContabilidadController.generarReporteContabilidad.bind(reporteContabilidadController));
// Rutas para reportes por rango de fechas
router.post('/rango', reporteContabilidadController.generarReportePorRango.bind(reporteContabilidadController));
// Ruta para reportes consolidados
router.post('/consolidado', reporteContabilidadController.generarReporteConsolidado.bind(reporteContabilidadController));
// Rutas para exportación de reportes
router.post('/exportar/excel', exportController.exportarReportePorRangoExcel.bind(exportController));
router.post('/exportar/pdf', exportController.exportarReportePorRangoPDF.bind(exportController));
router.get('/descargar/:fileName', exportController.descargarArchivo.bind(exportController));
/**
 * Exporta el router de reportes de contabilidad, que contiene las rutas para
 * generar reportes, obtener datos históricos, gestionar reportes existentes y exportar reportes.
 */
exports.default = router;
