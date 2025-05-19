import { Router } from 'express';
import { OficinasController } from './oficinas.controller';

const router = Router();
const oficinasController = new OficinasController();

// Ruta para obtener todas las oficinas
router.get('/', oficinasController.obtenerOficinas.bind(oficinasController));

export default router;
