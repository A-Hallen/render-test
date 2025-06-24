"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KPIContablesRepository = void 0;
const devolverKPIsPorOficinaRangoFechas_1 = require("./transformers/devolverKPIsPorOficinaRangoFechas");
const indicadores_contables_repository_1 = require("../indicadores-contables/indicadores-contables.repository");
class KPIContablesRepository {
    constructor() {
        this.indicadoresRepository = new indicadores_contables_repository_1.IndicadoresContablesRepository();
    }
    async obtenerPromedioKPIsOficina(oficina, fechaInicio, fechaFin) {
        const indicadores = await this.indicadoresRepository.obtenerTodos();
        const resultado = await (0, devolverKPIsPorOficinaRangoFechas_1.devolverKPIsPorOficinaRangoFechas)(indicadores, oficina, fechaInicio, fechaFin);
        const indicadoresColor = indicadores.map((i) => {
            return { id: i.id, nombre: i.nombre, color: i.color };
        });
        return {
            indicadores: indicadoresColor,
            kpisCalculados: resultado.kpisCalculados,
        };
    }
    /**
     * Obtiene los KPIs por oficina y rango de fechas sin promediar
     * @param oficina Código de la oficina
     * @param fechaInicio Fecha de inicio en formato YYYY-MM-DD
     * @param fechaFin Fecha de fin en formato YYYY-MM-DD
     * @returns Objeto con los KPIs calculados por fecha
     */
    async obtenerKPIsPorOficinaRangosFecha(oficina, fechaInicio, fechaFin) {
        try {
            console.log(`[KPIContablesRepository] Obteniendo KPIs para oficina: ${oficina}, desde: ${fechaInicio}, hasta: ${fechaFin}`);
            // Obtener todos los indicadores configurados
            const indicadores = await this.indicadoresRepository.obtenerTodos();
            console.log(`[KPIContablesRepository] Se encontraron ${indicadores.length} indicadores configurados`);
            // Obtener los KPIs calculados
            const resultado = await (0, devolverKPIsPorOficinaRangoFechas_1.devolverKPIsPorOficinaRangoFechas)(indicadores, oficina, fechaInicio, fechaFin);
            // Extraer los colores de los indicadores para facilitar la visualización
            const indicadoresColor = indicadores.map((i) => {
                return { id: i.id, nombre: i.nombre, color: i.color };
            });
            console.log(`[KPIContablesRepository] KPIs calculados correctamente`);
            return {
                indicadores: indicadoresColor,
                kpisCalculados: resultado.kpisCalculados,
                mensaje: 'KPIs calculados correctamente'
            };
        }
        catch (error) {
            console.error(`[KPIContablesRepository] Error al obtener KPIs: ${error.message}`);
            // En caso de error, devolver una estructura vacía pero válida
            return {
                indicadores: [],
                kpisCalculados: {},
                mensaje: `Error al obtener KPIs: ${error.message}`
            };
        }
    }
    /**
     * Obtiene un KPI específico para una oficina en una fecha determinada
     * @param oficina Código de la oficina
     * @param idIndicador ID del indicador
     * @param fecha Fecha en formato YYYY-MM-DD
     * @returns Objeto con el KPI solicitado o null si no existe
     */
    async obtenerKPIEspecifico(oficina, idIndicador, fecha) {
        try {
            console.log(`[KPIContablesRepository] Obteniendo KPI específico para oficina: ${oficina}, indicador: ${idIndicador}, fecha: ${fecha}`);
            // Obtener el indicador solicitado
            const indicador = await this.indicadoresRepository.obtenerPorId(idIndicador);
            if (!indicador) {
                console.log(`[KPIContablesRepository] No se encontró el indicador con ID: ${idIndicador}`);
                return {
                    indicador: null,
                    kpi: null,
                    mensaje: `No se encontró el indicador con ID: ${idIndicador}`
                };
            }
            // Obtener los KPIs calculados para esa fecha
            const resultado = await (0, devolverKPIsPorOficinaRangoFechas_1.devolverKPIsPorOficinaRangoFechas)([indicador], oficina, fecha, fecha);
            // Verificar si hay resultados para la fecha solicitada
            if (!resultado.kpisCalculados || !resultado.kpisCalculados[fecha]) {
                console.log(`[KPIContablesRepository] No hay KPIs calculados para la fecha: ${fecha}`);
                return {
                    indicador: {
                        id: indicador.id,
                        nombre: indicador.nombre,
                        color: indicador.color
                    },
                    kpi: null,
                    mensaje: `No hay datos disponibles para el indicador en la fecha solicitada`
                };
            }
            // Buscar el KPI específico
            const kpiEncontrado = resultado.kpisCalculados[fecha].find(kpi => kpi.idIndicador.toString() === idIndicador && kpi.codigoOficina.toString() === oficina);
            if (!kpiEncontrado) {
                console.log(`[KPIContablesRepository] No se encontró el KPI específico`);
                return {
                    indicador: {
                        id: indicador.id,
                        nombre: indicador.nombre,
                        color: indicador.color
                    },
                    kpi: null,
                    mensaje: `No se encontró el KPI para el indicador ${indicador.nombre} en la fecha ${fecha}`
                };
            }
            console.log(`[KPIContablesRepository] KPI encontrado correctamente`);
            return {
                indicador: {
                    id: indicador.id,
                    nombre: indicador.nombre,
                    color: indicador.color
                },
                kpi: kpiEncontrado,
                mensaje: 'KPI obtenido correctamente'
            };
        }
        catch (error) {
            console.error(`[KPIContablesRepository] Error al obtener KPI específico: ${error.message}`);
            return {
                indicador: null,
                kpi: null,
                mensaje: `Error al obtener el KPI: ${error.message}`
            };
        }
    }
    /**
     * Compara los KPIs entre dos oficinas para una fecha específica
     * @param oficina1 Código de la primera oficina
     * @param oficina2 Código de la segunda oficina
     * @param fecha Fecha en formato YYYY-MM-DD
     * @returns Objeto con la comparación de KPIs entre las dos oficinas
     */
    async compararKPIsEntreOficinas(oficina1, oficina2, fecha) {
        try {
            console.log(`[KPIContablesRepository] Comparando KPIs entre oficinas: ${oficina1} y ${oficina2}, fecha: ${fecha}`);
            // Obtener todos los indicadores configurados
            const indicadores = await this.indicadoresRepository.obtenerTodos();
            console.log(`[KPIContablesRepository] Se encontraron ${indicadores.length} indicadores configurados`);
            // Obtener los KPIs para la primera oficina
            const resultadoOficina1 = await (0, devolverKPIsPorOficinaRangoFechas_1.devolverKPIsPorOficinaRangoFechas)(indicadores, oficina1, fecha, fecha);
            // Obtener los KPIs para la segunda oficina
            const resultadoOficina2 = await (0, devolverKPIsPorOficinaRangoFechas_1.devolverKPIsPorOficinaRangoFechas)(indicadores, oficina2, fecha, fecha);
            // Extraer los colores de los indicadores para facilitar la visualización
            const indicadoresColor = indicadores.map((i) => {
                return { id: i.id, nombre: i.nombre, color: i.color };
            });
            console.log(`[KPIContablesRepository] Comparación de KPIs completada`);
            return {
                indicadores: indicadoresColor,
                kpisOficina1: resultadoOficina1.kpisCalculados,
                kpisOficina2: resultadoOficina2.kpisCalculados,
                fecha: fecha,
                nombreOficina1: oficina1,
                nombreOficina2: oficina2,
                mensaje: 'Comparación de KPIs completada correctamente'
            };
        }
        catch (error) {
            console.error(`[KPIContablesRepository] Error al comparar KPIs: ${error.message}`);
            // En caso de error, devolver una estructura vacía pero válida
            return {
                indicadores: [],
                kpisOficina1: {},
                kpisOficina2: {},
                fecha: fecha,
                nombreOficina1: oficina1,
                nombreOficina2: oficina2,
                mensaje: `Error al comparar KPIs: ${error.message}`
            };
        }
    }
}
exports.KPIContablesRepository = KPIContablesRepository;
