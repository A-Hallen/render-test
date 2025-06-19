"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const indicadores_contables_controller_1 = require("./indicadores-contables.controller");
const router = (0, express_1.Router)();
const indicadoresContablesController = new indicadores_contables_controller_1.IndicadoresContablesController();
// Rutas para indicadores contables (CRUD)
router.get('/', indicadoresContablesController.obtenerIndicadores.bind(indicadoresContablesController));
router.get('/:id', indicadoresContablesController.obtenerIndicadorPorId.bind(indicadoresContablesController));
router.post('/', indicadoresContablesController.crearIndicador.bind(indicadoresContablesController));
router.put('/:id', indicadoresContablesController.actualizarIndicador.bind(indicadoresContablesController));
router.delete('/:id', indicadoresContablesController.eliminarIndicador.bind(indicadoresContablesController));
exports.default = router;
