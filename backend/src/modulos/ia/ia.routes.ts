import { Router } from 'express';
import { IaController } from './ia.controller';

const router = Router();
const iaController = new IaController();

// Ruta para enviar un mensaje al chat de IA
router.post('/audio', iaController.uploadMiddleware.single('audio').bind(iaController), iaController.obtenerRespuestaAudio.bind(iaController));
router.post('/', iaController.obtenerRespuestaTexto.bind(iaController));

export default router;