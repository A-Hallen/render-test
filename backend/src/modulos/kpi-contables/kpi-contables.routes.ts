import { Router } from 'express';
import { KPIContablesController } from './kpi-contables.controller';

const router = Router();
const kpiContablesController = new KPIContablesController();

// Rutas para KPIs contables
router.get('/promedio', kpiContablesController.obtenerPromedioKPIsOficina.bind(kpiContablesController));
router.get('/rango-fechas', kpiContablesController.obtenerKPIsPorOficinaRangosFecha.bind(kpiContablesController));
router.get('/indicador', kpiContablesController.obtenerKPIEspecifico.bind(kpiContablesController));
router.get('/comparar-oficinas', kpiContablesController.compararKPIsEntreOficinas.bind(kpiContablesController));
router.get('/comparar-indicadores', kpiContablesController.compararOficinasPorKpis.bind(kpiContablesController));
export default router;
