"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportes_controller_1 = require("./reportes.controller");
const router = (0, express_1.Router)();
const reportesController = new reportes_controller_1.ReportesController();
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
exports.default = router;
