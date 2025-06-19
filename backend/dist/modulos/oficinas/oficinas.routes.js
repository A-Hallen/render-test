"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const oficinas_controller_1 = require("./oficinas.controller");
const router = (0, express_1.Router)();
const oficinasController = new oficinas_controller_1.OficinasController();
// Ruta para obtener todas las oficinas
router.get('/', oficinasController.obtenerOficinas.bind(oficinasController));
exports.default = router;
