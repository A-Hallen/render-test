import { Router } from 'express';
import { ConfiguracionReportesContabilidadController } from './configuracion-reportes-contabilidad.controller';

const router = Router();
const configuracionReportesContabilidadController = new ConfiguracionReportesContabilidadController();

// Ruta para obtener configuraciones activas
router.get('/activos', configuracionReportesContabilidadController.obtenerConfiguracionesActivas.bind(configuracionReportesContabilidadController));
router.post('/tendencia', configuracionReportesContabilidadController.generarReporteTendencia.bind(configuracionReportesContabilidadController));
router.get('/cuentas', configuracionReportesContabilidadController.obtenerCuentas.bind(configuracionReportesContabilidadController));
router.post('/configuracion', configuracionReportesContabilidadController.guardarConfiguracion.bind(configuracionReportesContabilidadController));

// Ruta para actualizar una configuración existente
router.put('/configuracion', configuracionReportesContabilidadController.actualizarConfiguracion.bind(configuracionReportesContabilidadController));
router.delete('/configuracion', configuracionReportesContabilidadController.eliminarConfiguracion.bind(configuracionReportesContabilidadController));

// Las rutas de reportes de contabilidad ahora son independientes

/**
 * Exporta el router de configuración de reportes de contabilidad, que contiene las rutas para obtener
 * configuraciones activas, generar reportes de tendencia, obtener cuentas,
 * y gestionar configuraciones de reportes de contabilidad.
 */
export default router;
