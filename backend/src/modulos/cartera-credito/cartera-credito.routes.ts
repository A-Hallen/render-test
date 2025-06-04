import { Router } from 'express';
import { CarteraCreditoController } from './cartera-credito.controller';

const router = Router();
const carteraCreditoController = new CarteraCreditoController();

/**
 * @route GET /api/cartera-credito
 * @desc Obtiene la información de la cartera de crédito actual
 * @access Public
 */
router.get('/', (req, res) => carteraCreditoController.obtenerCarteraCredito(req, res));

export default router;
