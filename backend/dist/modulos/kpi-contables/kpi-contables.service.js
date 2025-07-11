"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KPIContablesService = void 0;
const kpi_contables_repository_1 = require("./kpi-contables.repository");
class KPIContablesService {
    constructor() {
        this.kpiContablesRepository = new kpi_contables_repository_1.KPIContablesRepository();
    }
    /**
     * Obtiene los KPIs promediados por periodo para una oficina
     * @param oficina Código de la oficina
     * @param fechaInicio Fecha de inicio en formato YYYY-MM-DD
     * @param fechaFin Fecha de fin en formato YYYY-MM-DD
     * @returns Objeto con los KPIs promediados
     */
    async obtenerPromedioKPIsOficina(oficina, fechaInicio, fechaFin) {
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
    async obtenerKPIsPorOficinaRangosFecha(oficina, fechaInicio, fechaFin) {
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
    async obtenerKPIEspecifico(oficina, idIndicador, fecha) {
        console.log("[service] Obteniendo KPI específico...");
        return await this.kpiContablesRepository.obtenerKPIEspecifico(oficina, idIndicador, fecha);
    }
    /**
     * Compara los KPIs entre dos oficinas para una fecha específica
     * @param oficina1 Código de la primera oficina
     * @param oficina2 Código de la segunda oficina
     * @param fecha Fecha en formato YYYY-MM-DD
     * @returns Objeto con la comparación de KPIs entre las dos oficinas
     */
    async compararKPIsEntreOficinas(oficina1, oficina2, fecha) {
        console.log(`[service] Comparando KPIs entre oficinas ${oficina1} y ${oficina2} para la fecha ${fecha}...`);
        return await this.kpiContablesRepository.compararKPIsEntreOficinas(oficina1, oficina2, fecha);
    }
}
exports.KPIContablesService = KPIContablesService;
