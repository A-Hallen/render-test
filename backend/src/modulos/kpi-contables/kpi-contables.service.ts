import { KPIContablesRepository } from './kpi-contables.repository';

export class KPIContablesService {
    private kpiContablesRepository: KPIContablesRepository;

    constructor() {
        this.kpiContablesRepository = new KPIContablesRepository();
    }

    /**
     * Obtiene los KPIs promediados por periodo para una oficina
     * @param oficina Código de la oficina
     * @param fechaInicio Fecha de inicio en formato YYYY-MM-DD
     * @param fechaFin Fecha de fin en formato YYYY-MM-DD
     * @returns Objeto con los KPIs promediados
     */
    async obtenerPromedioKPIsOficina(oficina: string, fechaInicio: string, fechaFin: string) {
        console.log("[service] Obteniendo KPIs promediados por periodo...");
        return await this.kpiContablesRepository.obtenerPromedioKPIsOficina(oficina, fechaInicio, fechaFin);
    }

    /**
     * Obtiene los KPIs por oficina y rango de fechas sin promediar
     * @param oficina Código de la oficina
     * @param fechaInicio Fecha de inicio en formato YYYY-MM-DD
     * @param fechaFin Fecha de fin en formato YYYY-MM-DD
     * @returns Objeto con los KPIs calculados por fecha
     */
    async obtenerKPIsPorOficinaRangosFecha(oficina: string, fechaInicio: string, fechaFin: string) {
        console.log("[service] Obteniendo KPIs por oficina y rango de fechas...");
        return await this.kpiContablesRepository.obtenerKPIsPorOficinaRangosFecha(oficina, fechaInicio, fechaFin);
    }

    /**
     * Obtiene un KPI específico para una oficina en una fecha determinada
     * @param oficina Código de la oficina
     * @param idIndicador ID del indicador
     * @param fecha Fecha en formato YYYY-MM-DD
     * @returns Objeto con el KPI solicitado o null si no existe
     */
    async obtenerKPIEspecifico(oficina: string, idIndicador: string, fecha: string) {
        console.log("[service] Obteniendo KPI específico...");
        return await this.kpiContablesRepository.obtenerKPIEspecifico(oficina, idIndicador, fecha);
    }
}
