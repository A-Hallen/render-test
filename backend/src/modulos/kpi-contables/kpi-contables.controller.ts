import { Request, Response } from 'express';
import { KPIContablesService } from './kpi-contables.service';

export class KPIContablesController {
    private kpiContablesService: KPIContablesService;

    constructor() {
        this.kpiContablesService = new KPIContablesService();
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
            
            // Formatear fechas si es necesario (asegurar formato YYYY-MM-DD)
            console.log(`[Controller] Fechas recibidas: inicio=${fechaInicio}, fin=${fechaFin}`);
            
            if (fechaInicio && fechaInicio.includes('/')) {
                const [dia, mes, anio] = fechaInicio.split('/');
                fechaInicio = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                console.log(`[Controller] Fecha inicio formateada: ${fechaInicio}`);
            }
            
            if (fechaFin && fechaFin.includes('/')) {
                const [dia, mes, anio] = fechaFin.split('/');
                fechaFin = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                console.log(`[Controller] Fecha fin formateada: ${fechaFin}`);
            }
            
            console.log(`[Controller] Obteniendo KPIs para oficina: ${oficina}, desde: ${fechaInicio}, hasta: ${fechaFin}`);
            
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
}
