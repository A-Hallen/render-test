import { Router } from 'express';
import { ReportesController } from './reportes.controller';

const router = Router();
const reportesController = new ReportesController();

// Ruta para obtener configuraciones activas
router.get('/activos', reportesController.obtenerConfiguracionesActivas.bind(reportesController));
router.post('/tendencia', reportesController.generarReporteTendencia.bind(reportesController));
router.get('/cuentas', reportesController.obtenerCuentas.bind(reportesController));
router.post('/configuracion', reportesController.guardarConfiguracion.bind(reportesController));

// Ruta para actualizar una configuración existente
router.put('/configuracion', reportesController.actualizarConfiguracion.bind(reportesController));
router.delete('/configuracion', reportesController.eliminarConfiguracion.bind(reportesController));
/**
 * Exporta el router de reportes, que contiene las rutas para obtener
 * configuraciones activas, generar reportes de tendencia y obtener cuentas.
 */
export default router;