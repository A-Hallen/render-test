import { Router } from 'express';
import { IndicadoresContablesController } from './indicadores-contables.controller';

const router = Router();
const indicadoresContablesController = new IndicadoresContablesController();

// Rutas para indicadores contables (CRUD)
router.get('/', indicadoresContablesController.obtenerIndicadores.bind(indicadoresContablesController));
router.get('/:id', indicadoresContablesController.obtenerIndicadorPorId.bind(indicadoresContablesController));
router.post('/', indicadoresContablesController.crearIndicador.bind(indicadoresContablesController));
router.put('/:id', indicadoresContablesController.actualizarIndicador.bind(indicadoresContablesController));
router.delete('/:id', indicadoresContablesController.eliminarIndicador.bind(indicadoresContablesController));

export default router;
