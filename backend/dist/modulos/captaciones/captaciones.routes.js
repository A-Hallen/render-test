"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const captaciones_controller_1 = require("./captaciones.controller");
const router = express_1.default.Router();
const captacionesController = new captaciones_controller_1.CaptacionesController();
// Rutas para captaciones
router.get('/vista', captacionesController.obtenerCaptacionesVista.bind(captacionesController));
router.get('/plazo', captacionesController.obtenerCaptacionesPlazo.bind(captacionesController));
exports.default = router;
