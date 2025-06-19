"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ia_controller_1 = require("./ia.controller");
const router = (0, express_1.Router)();
const iaController = new ia_controller_1.IaController();
// Ruta para enviar un mensaje al chat de IA
router.post('/audio', iaController.uploadMiddleware.single('audio').bind(iaController), iaController.obtenerRespuestaAudio.bind(iaController));
router.post('/', iaController.obtenerRespuestaTexto.bind(iaController));
exports.default = router;
