import { Router } from 'express';
import { ReporteContabilidadController } from './reporte-contabilidad.controller';
import { ExportController } from './export.controller';

const router = Router();
const reporteContabilidadController = new ReporteContabilidadController();
const exportController = new ExportController();

// Rutas para reportes por fecha específica
router.post('/', reporteContabilidadController.generarReporteContabilidad.bind(reporteContabilidadController));

// Rutas para reportes por rango de fechas
router.post('/rango', reporteContabilidadController.generarReportePorRango.bind(reporteContabilidadController));

// Rutas para datos históricos
router.post('/historico', reporteContabilidadController.obtenerDatosHistoricos.bind(reporteContabilidadController));

// Ruta para reportes consolidados
router.post('/consolidado', reporteContabilidadController.generarReporteConsolidado.bind(reporteContabilidadController));

// Rutas para obtener reportes
router.get('/oficina/:oficina', reporteContabilidadController.obtenerReportesPorOficina.bind(reporteContabilidadController));
router.get('/:id', reporteContabilidadController.obtenerReportePorId.bind(reporteContabilidadController));

// Rutas para actualizar y eliminar reportes
router.put('/:id', reporteContabilidadController.actualizarReporte.bind(reporteContabilidadController));
router.delete('/:id', reporteContabilidadController.eliminarReporte.bind(reporteContabilidadController));

// Rutas para exportación de reportes
router.post('/exportar/excel', exportController.exportarReportePorRangoExcel.bind(exportController));
router.post('/exportar/pdf', exportController.exportarReportePorRangoPDF.bind(exportController));
router.get('/descargar/:fileName', exportController.descargarArchivo.bind(exportController));

/**
 * Exporta el router de reportes de contabilidad, que contiene las rutas para
 * generar reportes, obtener datos históricos, gestionar reportes existentes y exportar reportes.
 */
export default router;
