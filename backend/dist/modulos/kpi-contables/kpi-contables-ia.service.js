"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KPIContablesIAService = void 0;
const kpi_contables_service_1 = require("./kpi-contables.service");
const genai_1 = require("@google/genai");
const fuzzy_matcher_1 = require("../../utils/fuzzy-matcher");
const indicadores_contables_repository_1 = require("../indicadores-contables/indicadores-contables.repository");
const oficinas_repository_1 = require("../oficinas/oficinas.repository");
/**
 * Servicio para integrar los KPIs contables con el módulo de IA
 * Este servicio contiene toda la lógica específica para que el módulo de IA
 * pueda interactuar con los KPIs contables
 */
class KPIContablesIAService {
    constructor() {
        this.kpiContablesService = new kpi_contables_service_1.KPIContablesService();
        this.oficinasRepository = new oficinas_repository_1.OficinasRepository();
        this.indicadoresRepository = new indicadores_contables_repository_1.IndicadoresContablesRepository();
    }
    /**
     * Obtiene la declaración de función para ser utilizada en la IA
     * @returns Declaración de función para obtener datos de KPIs contables
     */
    getFunctionDeclaration() {
        return {
            name: 'fetch_kpi_data',
            description: 'Obtiene datos de KPIs contables para una oficina y rango de fechas específicos o para un indicador específico. Los KPIs contables son indicadores financieros que miden el desempeño contable de la empresa.',
            parameters: {
                type: genai_1.Type.OBJECT,
                properties: {
                    oficina: { type: genai_1.Type.STRING, description: 'Código o nombre de la oficina para la cual obtener los KPIs' },
                    fechaInicio: { type: genai_1.Type.STRING, description: 'Fecha de inicio para el rango en formato YYYY-MM-DD' },
                    fechaFin: { type: genai_1.Type.STRING, description: 'Fecha de fin para el rango en formato YYYY-MM-DD' },
                    fecha: { type: genai_1.Type.STRING, description: 'Fecha específica para consultar un indicador en formato YYYY-MM-DD. Si se proporciona, se ignoran fechaInicio y fechaFin' },
                    indicador: { type: genai_1.Type.STRING, description: 'Nombre o ID del indicador específico a consultar. Si se proporciona, se consultará solo este indicador' },
                    promediado: { type: genai_1.Type.BOOLEAN, description: 'Si es true, devuelve los KPIs promediados por periodo. Si es false, devuelve los KPIs por fecha. Solo aplica cuando no se especifica un indicador' }
                },
                required: ['oficina'],
            },
        };
    }
    /**
     * Procesa una llamada de función de IA para obtener datos de KPIs
     * @param args Argumentos de la llamada de función
     * @param message Mensaje original del usuario
     * @returns Prompt con los datos de KPIs para la IA
     */
    async processFunctionCall(args, message) {
        console.log("[KPIContablesIAService] Procesando llamada de función para KPIs contables");
        // Validar y extraer parámetros
        const params = typeof args === 'object' && args !== null
            ? args
            : (typeof args === 'string'
                ? JSON.parse(args)
                : {});
        // Validar parámetros básicos
        if (!params.oficina) {
            return 'Para obtener datos de KPIs contables, necesito saber la oficina.';
        }
        try {
            // Buscar la mejor coincidencia para la oficina ingresada
            const oficinaIngresada = params.oficina;
            const oficinasDisponibles = await this.oficinasRepository.obtenerTodas();
            const nombresOficinasDisponibles = oficinasDisponibles.map((oficina) => oficina.nombre);
            console.log(`[KPIContablesIAService] Buscando coincidencia para oficina: "${oficinaIngresada}"`);
            console.log(`[KPIContablesIAService] Oficinas disponibles: ${nombresOficinasDisponibles.join(', ')}`);
            const nombreOficinaCoincidente = fuzzy_matcher_1.FuzzyMatcher.encontrarMejorCoincidencia(oficinaIngresada, nombresOficinasDisponibles);
            const oficinaCoincidente = oficinasDisponibles.find(oficina => oficina.nombre === nombreOficinaCoincidente);
            if (!oficinaCoincidente) {
                return `No se encontró ninguna oficina que coincida con "${oficinaIngresada}". Las oficinas disponibles son: ${oficinasDisponibles.join(', ')}`;
            }
            console.log(`[KPIContablesIAService] Coincidencia de oficina: "${oficinaIngresada}" -> "${oficinaCoincidente.nombre}"`);
            // Verificar si se está solicitando un indicador específico
            if (params.indicador) {
                // Si se solicita un indicador específico, buscar la mejor coincidencia
                const indicadorIngresado = params.indicador;
                const indicadoresDisponibles = await this.indicadoresRepository.obtenerTodos();
                const nombresIndicadores = indicadoresDisponibles.map((ind) => ind.nombre);
                console.log(`[KPIContablesIAService] Buscando coincidencia para indicador: "${indicadorIngresado}"`);
                console.log(`[KPIContablesIAService] Indicadores disponibles: ${nombresIndicadores.join(', ')}`);
                const indicadorCoincidente = fuzzy_matcher_1.FuzzyMatcher.encontrarMejorCoincidencia(indicadorIngresado, nombresIndicadores);
                if (!indicadorCoincidente) {
                    return `No se encontró ningún indicador que coincida con "${indicadorIngresado}". Los indicadores disponibles son: ${nombresIndicadores.join(', ')}`;
                }
                console.log(`[KPIContablesIAService] Coincidencia de indicador: "${indicadorIngresado}" -> "${indicadorCoincidente}"`);
                // Determinar si la coincidencia es un nombre o un ID
                let idIndicador;
                let nombreIndicador;
                const indicadorPorNombre = indicadoresDisponibles.find((ind) => ind.nombre === indicadorCoincidente);
                if (indicadorPorNombre) {
                    idIndicador = indicadorPorNombre.id;
                    nombreIndicador = indicadorPorNombre.nombre;
                }
                else {
                    // Si no se encuentra por nombre, buscar por ID
                    const indicadorPorId = indicadoresDisponibles.find((ind) => ind.id === indicadorCoincidente);
                    if (indicadorPorId) {
                        idIndicador = indicadorPorId.id;
                        nombreIndicador = indicadorPorId.nombre;
                    }
                    else {
                        return `Error al identificar el indicador "${indicadorCoincidente}".`;
                    }
                }
                // Determinar la fecha a utilizar
                let fechaConsulta = params.fecha;
                // Si no se proporciona una fecha específica, usar la fecha actual
                if (!fechaConsulta) {
                    if (params.fechaInicio && params.fechaFin) {
                        // Si hay un rango de fechas, usar la fecha final
                        fechaConsulta = params.fechaFin;
                    }
                    else {
                        // Usar la fecha actual formateada como YYYY-MM-DD
                        const hoy = new Date();
                        fechaConsulta = hoy.toISOString().split('T')[0];
                    }
                }
                console.log(`[KPIContablesIAService] Consultando indicador específico: ${nombreIndicador} (${idIndicador}) para la fecha ${fechaConsulta}`);
                // Obtener el KPI específico
                const resultadoKPI = await this.kpiContablesService.obtenerKPIEspecifico(oficinaCoincidente.codigo, idIndicador.toString(), fechaConsulta);
                // Generar prompt para la IA con los datos obtenidos
                const prompt = `
                    He obtenido los siguientes datos del indicador financiero solicitado:
                    
                    Oficina: ${params.oficina} (${oficinaCoincidente})
                    Indicador: ${nombreIndicador} (${idIndicador})
                    Fecha: ${fechaConsulta}
                    
                    Datos del indicador:
                    ${JSON.stringify(resultadoKPI, null, 2)}
                    
                    Por favor, analiza estos datos y presenta una explicación clara y concisa para el usuario, incluyendo:
                    1. El valor del indicador y su significado
                    2. Los componentes que forman el cálculo (numerador y denominador)
                    3. Una interpretación del resultado en el contexto financiero
                    
                    Responde a la consulta original del usuario: ${message}
                `;
                return prompt;
            }
            else {
                // Si no se solicita un indicador específico, proceder con la consulta de todos los KPIs
                // Si no se proporcionan fechas, usar fechas automáticas (mes actual)
                if (!params.fechaInicio || !params.fechaFin) {
                    console.log("[KPIContablesIAService] Usando fechas automáticas");
                    const hoy = new Date();
                    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                    params.fechaInicio = primerDiaMes.toISOString().split('T')[0];
                    params.fechaFin = ultimoDiaMes.toISOString().split('T')[0];
                    console.log(`[KPIContablesIAService] Fechas automáticas: ${params.fechaInicio} a ${params.fechaFin}`);
                }
                // Determinar si se solicitan KPIs promediados o por fecha
                let resultado;
                if (params.promediado === true) {
                    console.log("[KPIContablesIAService] Obteniendo KPIs promediados");
                    resultado = await this.kpiContablesService.obtenerPromedioKPIsOficina(oficinaCoincidente.codigo, params.fechaInicio, params.fechaFin);
                }
                else {
                    console.log("[KPIContablesIAService] Obteniendo KPIs por fecha");
                    resultado = await this.kpiContablesService.obtenerKPIsPorOficinaRangosFecha(oficinaCoincidente.codigo, params.fechaInicio, params.fechaFin);
                }
                // Generar prompt para la IA con los datos obtenidos
                const prompt = `
                    He obtenido los siguientes datos de KPIs contables:
                    
                    Oficina: ${params.oficina} (${oficinaCoincidente})
                    Periodo: ${params.fechaInicio} a ${params.fechaFin}
                    Tipo de datos: ${params.promediado ? 'Promediados por periodo' : 'Detallados por fecha'}
                    
                    Datos de KPIs:
                    ${JSON.stringify(resultado, null, 2)}
                    
                    Por favor, analiza estos datos y presenta un resumen claro y conciso para el usuario, incluyendo:
                    1. Los indicadores más relevantes y sus valores
                    2. Tendencias observadas en el periodo analizado
                    3. Recomendaciones basadas en los datos financieros
                    4. Cualquier área que requiera atención especial
                    
                    Responde a la consulta original del usuario: ${message}
                `;
                return prompt;
            }
        }
        catch (error) {
            console.error('[KPIContablesIAService] Error al procesar la llamada de función:', error);
            return `Lo siento, ocurrió un error al procesar la consulta de KPIs contables: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        }
    }
    /**
     * Obtiene la lista de oficinas disponibles en el sistema utilizando el servicio existente
     * @returns Array con los nombres de las oficinas
     */
    async obtenerOficinasDisponibles() {
        try {
            const oficinas = await this.oficinasRepository.obtenerTodas();
            // Extraer códigos y nombres para la búsqueda fuzzy
            const codigosOficinas = oficinas.map((oficina) => oficina.codigo).filter(Boolean);
            const nombresOficinas = oficinas.map((oficina) => oficina.nombre).filter(Boolean);
            // Combinar códigos y nombres para tener todas las opciones posibles
            return [...codigosOficinas, ...nombresOficinas];
        }
        catch (error) {
            console.error('[KPIContablesIAService] Error al obtener oficinas:', error);
            return [];
        }
    }
}
exports.KPIContablesIAService = KPIContablesIAService;
