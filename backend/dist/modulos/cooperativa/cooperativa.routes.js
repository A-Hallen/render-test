"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cooperativa_controller_1 = require("./cooperativa.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const upload_controller_1 = require("./upload.controller");
const router = (0, express_1.Router)();
const controller = cooperativa_controller_1.CooperativaController.getInstance();
const authMiddleware = new auth_middleware_1.AuthMiddleware();
const uploadController = new upload_controller_1.UploadCooperativaController();
// Ruta pública para obtener información básica de la cooperativa (nombre)
router.get('/public', controller.obtenerCooperativa);
// Rutas protegidas que requieren autenticación
router.get('/', authMiddleware.verifyToken.bind(authMiddleware), controller.obtenerCooperativa);
router.put('/', authMiddleware.verifyToken.bind(authMiddleware), controller.actualizarCooperativa);
router.post('/', authMiddleware.verifyToken.bind(authMiddleware), controller.crearCooperativa);
// Ruta para subir logo de la cooperativa
router.post('/logo', authMiddleware.verifyToken.bind(authMiddleware), uploadController.uploadMiddleware, uploadController.uploadLogo.bind(uploadController));
exports.default = router;
