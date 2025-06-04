import express from 'express';
import { CaptacionesController } from './captaciones.controller';

const router = express.Router();
const captacionesController = new CaptacionesController();

// Rutas para captaciones
router.get('/vista', captacionesController.obtenerCaptacionesVista.bind(captacionesController));
router.get('/plazo', captacionesController.obtenerCaptacionesPlazo.bind(captacionesController));

export default router;
