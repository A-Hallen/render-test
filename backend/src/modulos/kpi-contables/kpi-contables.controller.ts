import { Request, Response } from 'express';
import { KPIContablesService } from './kpi-contables.service';

export class KPIContablesController {
    private kpiContablesService: KPIContablesService;

    constructor() {
        this.kpiContablesService = new KPIContablesService();
    }

    /**
     * Compara los KPIs entre dos oficinas para una fecha específica
     * @param req Request con parámetros de consulta (oficina1, oficina2, fecha)
     * @param res Response para enviar la comparación de KPIs
     */
    async compararKPIsEntreOficinas(req: Request, res: Response): Promise<void> {
        try {
            const oficina1 = req.query["oficina1"] as string;
            const oficina2 = req.query["oficina2"] as string;
            const fecha = req.query["fecha"] as string;
            
            // Validar parámetros requeridos
            if (!oficina1 || !oficina2 || !fecha) {
                res.status(400).json({ 
                    mensaje: 'Los parámetros oficina1, oficina2 y fecha son obligatorios' 
                });
                return;
            }
            
            // Intentar obtener la comparación de KPIs
            try {
                const comparacion = await this.kpiContablesService.compararKPIsEntreOficinas(
                    oficina1, 
                    oficina2, 
                    fecha
                );
                
                // Si no hay KPIs, devolver un objeto vacío pero con la estructura correcta
                if (!comparacion || !comparacion.indicadores || comparacion.indicadores.length === 0) {
                    res.status(200).json({
                        indicadores: [],
                        kpisOficina1: {},
                        kpisOficina2: {},
                        fecha: fecha,
                        nombreOficina1: oficina1,
                        nombreOficina2: oficina2,
                        mensaje: 'No hay KPIs disponibles para los filtros seleccionados'
                    });
                    return;
                }
                
                res.status(200).json(comparacion);
                return;
            } catch (error: any) {
                console.error("[Controller] Error al comparar KPIs entre oficinas:", error);
                res.status(500).json({ 
                    mensaje: 'Error al comparar KPIs entre oficinas', 
                    error: error.message 
                });
                return;
            }
        } catch (error: any) {
            console.error("[Controller] Error al comparar KPIs entre oficinas:", error);
            res.status(500).json({ 
                mensaje: 'Error al comparar KPIs entre oficinas', 
                error: error.message 
            });
            return;
        }
    }

    /**
     * Obtiene los KPIs promediados por periodo para una oficina
     * @param req Request con parámetros de consulta (oficina, fechaInicio, fechaFin)
     * @param res Response para enviar los KPIs
     */
    async obtenerPromedioKPIsOficina(req: Request, res: Response): Promise<void> {
        try {
            const oficina = req.query["oficina"];
            const fechaInicio = req.query["fechaInicio"];
            const fechaFin = req.query["fechaFin"];
            const promedioKPIs = await this.kpiContablesService.obtenerPromedioKPIsOficina(
                oficina as string, 
                fechaInicio as string, 
                fechaFin as string
            );
            res.status(200).json(promedioKPIs);
        } catch (error) {
            console.error("[controller] Error al obtener el promedio de KPIs:", error);
            res.status(500).json({ message: 'Error al obtener los KPIs calculados', error });
        }
    }

    /**
     * Obtiene los KPIs por oficina y rango de fechas sin promediar
     * @param req Request con parámetros de consulta (oficina, fechaInicio, fechaFin)
     * @param res Response para enviar los KPIs
     */
    async obtenerKPIsPorOficinaRangosFecha(req: Request, res: Response): Promise<void> {
        try {
            console.log("[controller] Obteniendo KPIs por oficina y rango de fechas...");
            const oficina = req.query["oficina"] as string || 'MATRIZ';
            let fechaInicio = req.query["fechaInicio"] as string;
            let fechaFin = req.query["fechaFin"] as string;
            
            // Validar parámetros requeridos
            if (!fechaInicio || !fechaFin) {
                res.status(400).json({ 
                    mensaje: 'Los parámetros fechaInicio y fechaFin son obligatorios' 
                });
                return;
            }
            
            // Intentar obtener los KPIs
            try {
                const kpis = await this.kpiContablesService.obtenerKPIsPorOficinaRangosFecha(
                    oficina, 
                    fechaInicio, 
                    fechaFin
                );
                
                // Si no hay KPIs, devolver un objeto vacío pero con la estructura correcta
                if (!kpis || !kpis.kpisCalculados || Object.keys(kpis.kpisCalculados).length === 0) {
                    res.status(200).json({
                        indicadores: [],
                        kpisCalculados: {},
                        mensaje: 'No hay KPIs disponibles para los filtros seleccionados'
                    });
                    return;
                }
                
                res.status(200).json(kpis);
                return;
            } catch (error: any) {
                console.error("[Controller] Error al obtener KPIs por rango de fechas:", error);
                res.status(500).json({ 
                    mensaje: 'Error al obtener los KPIs por rango de fechas', 
                    error: error.message 
                });
                return;
            }
        } catch (error: any) {
            console.error("[Controller] Error al obtener KPIs por rango de fechas:", error);
            res.status(500).json({ 
                mensaje: 'Error al obtener los KPIs por rango de fechas', 
                error: error.message 
            });
            return;
        }
    }

    /**
     * Obtiene un KPI específico para una oficina en una fecha determinada
     * @param req Request con parámetros de consulta (oficina, idIndicador, fecha)
     * @param res Response para enviar el KPI
     */
    async obtenerKPIEspecifico(req: Request, res: Response): Promise<void> {
        try {
            const oficina = req.query.oficina as string;
            const idIndicador = req.query.idIndicador as string;
            const fecha = req.query.fecha as string;
            
            // Validar parámetros requeridos
            if (!oficina || !idIndicador || !fecha) {
                res.status(400).json({ 
                    mensaje: 'Los parámetros oficina, idIndicador y fecha son obligatorios' 
                });
                return;
            }
            
            const kpi = await this.kpiContablesService.obtenerKPIEspecifico(
                oficina,
                idIndicador,
                fecha
            );
            
            if (!kpi) {
                res.status(404).json({
                    mensaje: 'No se encontró el KPI solicitado para los parámetros especificados'
                });
                return;
            }
            
            res.status(200).json(kpi);
        } catch (error: any) {
            console.error("[Controller] Error al obtener KPI específico:", error);
            res.status(500).json({ 
                mensaje: 'Error al obtener el KPI específico', 
                error: error.message 
            });
        }
    }
}
