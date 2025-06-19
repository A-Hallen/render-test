"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteContabilidadIAService = void 0;
const genai_1 = require("@google/genai");
const reporte_contabilidad_repository_1 = require("./reporte-contabilidad.repository");
const oficinas_service_1 = require("../../oficinas/oficinas.service");
const configuracion_reportes_contabilidad_service_1 = require("../../configuracion-reportes/contabilidad/configuracion-reportes-contabilidad.service");
/**
 * Servicio para integrar los reportes de contabilidad con el módulo de IA
 * Este servicio contiene toda la lógica específica para que el módulo de IA
 * pueda interactuar con los reportes de contabilidad
 */
class ReporteContabilidadIAService {
    constructor() {
        this.reporteContabilidadRepository = new reporte_contabilidad_repository_1.ReporteContabilidadRepository();
        this.oficinaService = new oficinas_service_1.OficinaService();
        this.configuracionReportesService = new configuracion_reportes_contabilidad_service_1.ConfiguracionReportesContabilidadService();
    }
    /**
     * Obtiene la declaración de función para ser utilizada en la IA
     * @returns Declaración de función para generar reportes de contabilidad
     */
    getFunctionDeclaration() {
        return {
            name: 'fetch_accounting_report',
            description: 'Genera un reporte de contabilidad para una fecha o rango de fechas específico. El reporte incluye datos financieros organizados por categorías y cuentas.',
            parameters: {
                type: genai_1.Type.OBJECT,
                properties: {
                    fecha: {
                        type: genai_1.Type.STRING,
                        description: 'Fecha específica para el reporte en formato YYYY-MM-DD (opcional si se proporciona un rango)',
                    },
                    fechaInicio: {
                        type: genai_1.Type.STRING,
                        description: 'Fecha de inicio para el rango del reporte en formato YYYY-MM-DD (opcional si se proporciona una fecha específica)',
                    },
                    fechaFin: {
                        type: genai_1.Type.STRING,
                        description: 'Fecha de fin para el rango del reporte en formato YYYY-MM-DD (opcional si se proporciona una fecha específica)',
                    },
                    oficina: {
                        type: genai_1.Type.STRING,
                        description: 'Código o nombre de la oficina para la cual generar el reporte',
                    },
                    nombreConfiguracion: {
                        type: genai_1.Type.STRING,
                        description: 'Nombre de la configuración del reporte a utilizar',
                    },
                    tipoReporte: {
                        type: genai_1.Type.STRING,
                        description: 'Tipo de reporte: "diario" o "mensual" (opcional, por defecto es "mensual")',
                    },
                },
                required: ['oficina', 'nombreConfiguracion'],
            },
        };
    }
    /**
     * Procesa una llamada de función de IA para generar reportes de contabilidad
     * @param args Argumentos de la llamada de función
     * @param message Mensaje original del usuario
     * @returns Respuesta formateada para la IA
     */
    async processFunctionCall(args, message) {
        console.log("[ReporteContabilidadIAService] Procesando llamada de función para reportes de contabilidad");
        // Validar y extraer parámetros
        const params = typeof args === 'object' && args !== null
            ? args
            : (typeof args === 'string'
                ? JSON.parse(args)
                : {});
        // Validar parámetros básicos
        if (!params.oficina || !params.nombreConfiguracion) {
            return 'Para generar un reporte de contabilidad, necesito saber la oficina y la configuración del reporte.';
        }
        try {
            // Buscar la mejor coincidencia para la oficina ingresada
            const oficinaIngresada = params.oficina;
            const oficinasDisponibles = await this.obtenerOficinasDisponibles();
            console.log(`[ReporteContabilidadIAService] Buscando coincidencia para oficina: "${oficinaIngresada}"`);
            console.log(`[ReporteContabilidadIAService] Oficinas disponibles: ${oficinasDisponibles.join(', ')}`);
            const oficinaCoincidente = this.encontrarMejorCoincidencia(oficinaIngresada, oficinasDisponibles);
            if (!oficinaCoincidente) {
                return `No se encontró ninguna oficina que coincida con "${oficinaIngresada}". Las oficinas disponibles son: ${oficinasDisponibles.join(', ')}`;
            }
            // Buscar la mejor coincidencia para la configuración ingresada
            const configuracionIngresada = params.nombreConfiguracion;
            const configuracionesDisponibles = await this.obtenerConfiguracionesDisponibles();
            console.log(`[ReporteContabilidadIAService] Buscando coincidencia para configuración: "${configuracionIngresada}"`);
            console.log(`[ReporteContabilidadIAService] Configuraciones disponibles: ${configuracionesDisponibles.join(', ')}`);
            const configuracionCoincidente = this.encontrarMejorCoincidencia(configuracionIngresada, configuracionesDisponibles);
            if (!configuracionCoincidente) {
                return `No se encontró ninguna configuración de reporte que coincida con "${configuracionIngresada}". Las configuraciones disponibles son: ${configuracionesDisponibles.join(', ')}`;
            }
            console.log(`[ReporteContabilidadIAService] Coincidencia de oficina: "${oficinaIngresada}" -> "${oficinaCoincidente}"`);
            console.log(`[ReporteContabilidadIAService] Coincidencia de configuración: "${configuracionIngresada}" -> "${configuracionCoincidente}"`);
            // Preparar los datos para la solicitud del reporte
            const reporteData = {
                oficina: oficinaCoincidente,
                nombreConfiguracion: configuracionCoincidente,
            };
            // Determinar si es un reporte por fecha específica o por rango
            if (params.fecha) {
                // Si se proporciona una fecha específica
                reporteData.fecha = params.fecha;
                console.log(`[ReporteContabilidadIAService] Usando fecha específica: ${params.fecha}`);
            }
            else if (params.fechaInicio && params.fechaFin) {
                // Si se proporciona un rango de fechas
                reporteData.fechaInicio = params.fechaInicio;
                reporteData.fechaFin = params.fechaFin;
                reporteData.tipoReporte = params.tipoReporte || 'mensual';
                console.log(`[ReporteContabilidadIAService] Usando rango de fechas: ${params.fechaInicio} a ${params.fechaFin}`);
            }
            else {
                // Si no se proporciona fecha ni rango, usar el mes actual automáticamente
                console.log("[ReporteContabilidadIAService] Usando fechas automáticas (mes actual)");
                const hoy = new Date();
                const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                // Para reportes mensuales, usar el rango del mes actual
                reporteData.fechaInicio = primerDiaMes.toISOString().split('T')[0]; // YYYY-MM-DD
                reporteData.fechaFin = ultimoDiaMes.toISOString().split('T')[0]; // YYYY-MM-DD
                reporteData.tipoReporte = 'mensual';
                console.log(`[ReporteContabilidadIAService] Fechas automáticas: ${reporteData.fechaInicio} a ${reporteData.fechaFin}`);
            }
            // Generar el reporte usando el repositorio
            const resultado = await this.reporteContabilidadRepository.generarReporteContabilidad(reporteData);
            if (!resultado.success) {
                return `No se pudo generar el reporte: ${resultado.message}`;
            }
            // Formatear los resultados para presentarlos al usuario
            const reporteInfo = resultado.data || {};
            const descripcionPeriodo = 'descripcionPeriodo' in reporteInfo ? reporteInfo.descripcionPeriodo : 'No especificado';
            // Generar prompt para la IA con los datos obtenidos
            const prompt = `
                He generado un reporte de contabilidad con la siguiente información:
                
                Oficina: ${reporteData.oficina}
                Periodo: ${descripcionPeriodo}
                Configuración: ${reporteData.nombreConfiguracion}
                
                Datos del reporte:
                ${JSON.stringify(reporteInfo, null, 2)}
                
                Por favor, analiza estos datos y presenta un resumen claro y conciso para el usuario, destacando:
                1. Los totales generales por fecha
                2. Las categorías con mayores cambios (si hay datos comparativos)
                3. Cualquier tendencia o patrón importante
                4. Recomendaciones basadas en los datos financieros
                
                Responde a la consulta original del usuario: ${message}
            `;
            return prompt;
        }
        catch (error) {
            console.error("[ReporteContabilidadIAService] Error al procesar reporte:", error);
            // Manejar específicamente el error de sobrecarga del modelo
            if (error.message && (error.message.includes("The model is overloaded") ||
                error.message.includes("503 Service Unavailable"))) {
                return "Lo siento, el servicio de inteligencia artificial está experimentando alta demanda en este momento. " +
                    "Por favor, espera unos minutos e intenta nuevamente. Este es un problema temporal del servicio.";
            }
            return `Ocurrió un error al generar el reporte de contabilidad: ${error.message}. Por favor, intenta nuevamente.`;
        }
    }
    /**
     * Obtiene la lista de oficinas disponibles en el sistema utilizando el servicio existente
     * @returns Array con los nombres de las oficinas
     */
    async obtenerOficinasDisponibles() {
        try {
            // Utilizar el servicio de oficinas existente
            const respuesta = await this.oficinaService.obtenerTodas();
            if (!respuesta || !respuesta.oficinas) {
                return [];
            }
            // Extraer los nombres/códigos de las oficinas
            return respuesta.oficinas.map(oficina => oficina.codigo || oficina.nombre);
        }
        catch (error) {
            console.error('[ReporteContabilidadIAService] Error al obtener oficinas disponibles:', error);
            return [];
        }
    }
    /**
     * Obtiene la lista de configuraciones de reportes disponibles utilizando el servicio existente
     * @returns Array con los nombres de las configuraciones
     */
    async obtenerConfiguracionesDisponibles() {
        try {
            // Utilizar el servicio de configuración de reportes existente
            const respuesta = await this.configuracionReportesService.obtenerConfiguracionesActivas();
            if (!respuesta || !respuesta.configuraciones) {
                return [];
            }
            // Extraer los nombres de las configuraciones
            return respuesta.configuraciones.map(config => config.nombre);
        }
        catch (error) {
            console.error('[ReporteContabilidadIAService] Error al obtener configuraciones disponibles:', error);
            return [];
        }
    }
    /**
     * Encuentra la mejor coincidencia entre un texto de entrada y una lista de opciones
     * @param entrada Texto ingresado por el usuario
     * @param opciones Lista de opciones válidas
     * @returns La mejor coincidencia o undefined si no hay coincidencias aceptables
     */
    encontrarMejorCoincidencia(entrada, opciones) {
        if (!entrada || opciones.length === 0) {
            return undefined;
        }
        // Normalizar la entrada (minúsculas, sin acentos, etc.)
        const entradaNormalizada = this.normalizarTexto(entrada);
        // Buscar coincidencia exacta primero (después de normalizar)
        const coincidenciaExacta = opciones.find(opcion => this.normalizarTexto(opcion) === entradaNormalizada);
        if (coincidenciaExacta) {
            return coincidenciaExacta;
        }
        // Buscar coincidencia parcial (si la entrada está contenida en alguna opción o viceversa)
        const coincidenciaParcial = opciones.find(opcion => {
            const opcionNormalizada = this.normalizarTexto(opcion);
            return opcionNormalizada.includes(entradaNormalizada) ||
                entradaNormalizada.includes(opcionNormalizada);
        });
        if (coincidenciaParcial) {
            return coincidenciaParcial;
        }
        // Calcular similitud usando distancia de Levenshtein
        let mejorCoincidencia;
        let mejorPuntuacion = Number.MAX_VALUE;
        for (const opcion of opciones) {
            const opcionNormalizada = this.normalizarTexto(opcion);
            const distancia = this.calcularDistanciaLevenshtein(entradaNormalizada, opcionNormalizada);
            const umbralMaximo = Math.max(entradaNormalizada.length, opcionNormalizada.length) * 0.4; // 40% de diferencia máxima
            if (distancia < mejorPuntuacion && distancia <= umbralMaximo) {
                mejorPuntuacion = distancia;
                mejorCoincidencia = opcion;
            }
        }
        return mejorCoincidencia;
    }
    /**
     * Normaliza un texto para comparaciones (minúsculas, sin acentos, etc.)
     */
    normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .replace(/[^a-z0-9]/g, ""); // Eliminar caracteres especiales
    }
    /**
     * Calcula la distancia de Levenshtein entre dos cadenas
     * (número mínimo de operaciones para transformar una cadena en otra)
     */
    calcularDistanciaLevenshtein(a, b) {
        if (a.length === 0)
            return b.length;
        if (b.length === 0)
            return a.length;
        const matrix = [];
        // Inicializar la primera fila y columna
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        // Rellenar la matriz
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const costo = a[j - 1] === b[i - 1] ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, // Eliminación
                matrix[i][j - 1] + 1, // Inserción
                matrix[i - 1][j - 1] + costo // Sustitución
                );
            }
        }
        return matrix[b.length][a.length];
    }
}
exports.ReporteContabilidadIAService = ReporteContabilidadIAService;
