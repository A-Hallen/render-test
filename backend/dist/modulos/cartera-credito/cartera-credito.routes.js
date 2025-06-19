"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartera_credito_controller_1 = require("./cartera-credito.controller");
const router = (0, express_1.Router)();
const carteraCreditoController = new cartera_credito_controller_1.CarteraCreditoController();
/**
 * @route GET /api/cartera-credito
 * @desc Obtiene la información de la cartera de crédito actual
 * @access Public
 */
router.get('/', (req, res) => carteraCreditoController.obtenerCarteraCredito(req, res));
exports.default = router;
