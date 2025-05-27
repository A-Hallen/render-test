import { KPIContablesService } from './kpi-contables.service';
import { OficinaService } from '../oficinas/oficinas.service';
import { Type } from '@google/genai';

/**
 * Servicio para integrar los KPIs contables con el módulo de IA
 * Este servicio contiene toda la lógica específica para que el módulo de IA
 * pueda interactuar con los KPIs contables
 */
export class KPIContablesIAService {
    private kpiContablesService: KPIContablesService;
    private oficinaService: OficinaService;

    constructor() {
        this.kpiContablesService = new KPIContablesService();
        this.oficinaService = new OficinaService();
    }

    /**
     * Obtiene la declaración de función para ser utilizada en la IA
     * @returns Declaración de función para obtener datos de KPIs contables
     */
    getFunctionDeclaration() {
        return {
            name: 'fetch_kpi_data',
            description: 'Obtiene datos de KPIs contables para una oficina y rango de fechas específicos. Los KPIs contables son indicadores financieros que miden el desempeño contable de la empresa, el color de los indicadores es irrelevante para el usuario ok?',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    oficina: {
                        type: Type.STRING,
                        description: 'Código o nombre de la oficina para la cual obtener los KPIs',
                    },
                    fechaInicio: {
                        type: Type.STRING,
                        description: 'Fecha de inicio para el rango en formato YYYY-MM-DD',
                    },
                    fechaFin: {
                        type: Type.STRING,
                        description: 'Fecha de fin para el rango en formato YYYY-MM-DD',
                    },
                    promediado: {
                        type: Type.BOOLEAN,
                        description: 'Si es true, devuelve los KPIs promediados por periodo. Si es false, devuelve los KPIs por fecha',
                    }
                },
                required: ['oficina', 'fechaInicio', 'fechaFin'],
            },
        };
    }

    /**
     * Procesa una llamada de función de IA para obtener datos de KPIs
     * @param args Argumentos de la llamada de función
     * @param message Mensaje original del usuario
     * @returns Respuesta formateada para la IA
     */
    async processFunctionCall(args: any, message: string): Promise<string> {
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
        
        // Si no se proporcionan fechas, usar fechas automáticas (mes actual)
        if (!params.fechaInicio || !params.fechaFin) {
            console.log("[KPIContablesIAService] Usando fechas automáticas");
            
            const hoy = new Date();
            const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
            
            params.fechaInicio = primerDiaMes.toISOString().split('T')[0]; // YYYY-MM-DD
            params.fechaFin = ultimoDiaMes.toISOString().split('T')[0]; // YYYY-MM-DD
            
            console.log(`[KPIContablesIAService] Fechas automáticas: ${params.fechaInicio} a ${params.fechaFin}`);
        }
        
        try {
            // Buscar la mejor coincidencia para la oficina ingresada
            const oficinaIngresada = params.oficina;
            const oficinasDisponibles = await this.obtenerOficinasDisponibles();
            
            console.log(`[KPIContablesIAService] Buscando coincidencia para oficina: "${oficinaIngresada}"`);
            console.log(`[KPIContablesIAService] Oficinas disponibles: ${oficinasDisponibles.join(', ')}`);
            
            const oficinaCoincidente = this.encontrarMejorCoincidencia(oficinaIngresada, oficinasDisponibles);
            
            if (!oficinaCoincidente) {
                return `No se encontró ninguna oficina que coincida con "${oficinaIngresada}". Las oficinas disponibles son: ${oficinasDisponibles.join(', ')}`;
            }
            
            console.log(`[KPIContablesIAService] Coincidencia de oficina: "${oficinaIngresada}" -> "${oficinaCoincidente}"`);
            
            // Determinar si se solicitan KPIs promediados o por fecha
            let resultado;
            if (params.promediado === true) {
                console.log("[KPIContablesIAService] Obteniendo KPIs promediados");
                resultado = await this.kpiContablesService.obtenerPromedioKPIsOficina(
                    oficinaCoincidente,
                    params.fechaInicio,
                    params.fechaFin
                );
            } else {
                console.log("[KPIContablesIAService] Obteniendo KPIs por fecha");
                resultado = await this.kpiContablesService.obtenerKPIsPorOficinaRangosFecha(
                    oficinaCoincidente,
                    params.fechaInicio,
                    params.fechaFin
                );
            }
            
            // Generar prompt para la IA con los datos obtenidos
            const prompt = `
                He obtenido los siguientes datos de KPIs contables:
                
                Oficina: ${params.oficina}
                Periodo: ${params.fechaInicio} a ${params.fechaFin}
                ${params.promediado ? 'KPIs promediados por periodo' : 'KPIs por fecha'}
                
                Datos de los KPIs:
                ${JSON.stringify(resultado, null, 2)}
                
                Por favor, analiza estos datos y presenta un resumen claro y conciso para el usuario, destacando:
                1. Los indicadores más relevantes y su desempeño
                2. Tendencias observadas en el periodo analizado
                3. Recomendaciones basadas en los datos financieros
                
                Responde a la consulta original del usuario: ${message}
            `;
            
            return prompt;
        } catch (error: any) {
            console.error("[KPIContablesIAService] Error al procesar KPIs:", error);
            
            // Manejar específicamente el error de sobrecarga del modelo
            if (error.message && (
                error.message.includes("The model is overloaded") ||
                error.message.includes("503 Service Unavailable")
            )) {
                return "Lo siento, el servicio de inteligencia artificial está experimentando alta demanda en este momento. " +
                       "Por favor, espera unos minutos e intenta nuevamente. Este es un problema temporal del servicio.";
            }
            
            return `Ocurrió un error al obtener los datos de KPIs contables: ${error.message}. Por favor, verifica los parámetros e intenta nuevamente.`;
        }
    }
    
    /**
     * Obtiene la lista de oficinas disponibles en el sistema utilizando el servicio existente
     * @returns Array con los nombres de las oficinas
     */
    private async obtenerOficinasDisponibles(): Promise<string[]> {
        try {
            // Utilizar el servicio de oficinas existente
            const respuesta = await this.oficinaService.obtenerTodas();
            
            if (!respuesta || !respuesta.oficinas) {
                return [];
            }
            
            // Extraer los nombres/códigos de las oficinas
            return respuesta.oficinas.map(oficina => oficina.codigo || oficina.nombre);
        } catch (error) {
            console.error('[KPIContablesIAService] Error al obtener oficinas disponibles:', error);
            return [];
        }
    }
    
    /**
     * Encuentra la mejor coincidencia entre un texto de entrada y una lista de opciones
     * @param entrada Texto ingresado por el usuario
     * @param opciones Lista de opciones válidas
     * @returns La mejor coincidencia o undefined si no hay coincidencias aceptables
     */
    private encontrarMejorCoincidencia(entrada: string, opciones: string[]): string | undefined {
        if (!entrada || opciones.length === 0) {
            return undefined;
        }
        
        // Normalizar la entrada (minúsculas, sin acentos, etc.)
        const entradaNormalizada = this.normalizarTexto(entrada);
        
        // Buscar coincidencia exacta primero (después de normalizar)
        const coincidenciaExacta = opciones.find(opcion => 
            this.normalizarTexto(opcion) === entradaNormalizada
        );
        
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
        let mejorCoincidencia: string | undefined;
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
    private normalizarTexto(texto: string): string {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .replace(/[^a-z0-9]/g, "");     // Eliminar caracteres especiales
    }
    
    /**
     * Calcula la distancia de Levenshtein entre dos cadenas
     * (número mínimo de operaciones para transformar una cadena en otra)
     */
    private calcularDistanciaLevenshtein(a: string, b: string): number {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        const matrix: number[][] = [];
        
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
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // Eliminación
                    matrix[i][j - 1] + 1,      // Inserción
                    matrix[i - 1][j - 1] + costo // Sustitución
                );
            }
        }
        
        return matrix[b.length][a.length];
    }
}
