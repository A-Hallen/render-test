import { Router } from 'express';
import { KPIContablesController } from './kpi-contables.controller';

const router = Router();
const kpiContablesController = new KPIContablesController();

// Rutas para KPIs contables
router.get('/promedio', kpiContablesController.obtenerPromedioKPIsOficina.bind(kpiContablesController));
router.get('/rango-fechas', kpiContablesController.obtenerKPIsPorOficinaRangosFecha.bind(kpiContablesController));

export default router;
