import { Router } from 'express';
import { CooperativaController } from './cooperativa.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

const router = Router();
const controller = CooperativaController.getInstance();
const authMiddleware = new AuthMiddleware();

// Ruta pública para obtener información básica de la cooperativa (nombre)
router.get('/public', controller.obtenerCooperativa);

// Rutas protegidas que requieren autenticación
router.get('/', 
  authMiddleware.verifyToken.bind(authMiddleware), 
  controller.obtenerCooperativa
);
router.put('/', 
  authMiddleware.verifyToken.bind(authMiddleware), 
  controller.actualizarCooperativa
);
router.post('/', 
  authMiddleware.verifyToken.bind(authMiddleware), 
  controller.crearCooperativa
);

export default router;
