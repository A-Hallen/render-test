"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kpi_contables_controller_1 = require("./kpi-contables.controller");
const router = (0, express_1.Router)();
const kpiContablesController = new kpi_contables_controller_1.KPIContablesController();
// Rutas para KPIs contables
router.get('/promedio', kpiContablesController.obtenerPromedioKPIsOficina.bind(kpiContablesController));
router.get('/rango-fechas', kpiContablesController.obtenerKPIsPorOficinaRangosFecha.bind(kpiContablesController));
router.get('/indicador', kpiContablesController.obtenerKPIEspecifico.bind(kpiContablesController));
router.get('/comparar-oficinas', kpiContablesController.compararKPIsEntreOficinas.bind(kpiContablesController));
exports.default = router;
