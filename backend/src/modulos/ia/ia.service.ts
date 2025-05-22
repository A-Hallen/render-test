import { GoogleGenAI, Type } from '@google/genai';
import { IndicadoresRepository } from '../indicadores/indicadores.repository';
import { ReporteContabilidadRepository } from '../reportes/contabilidad/reporte-contabilidad.repository';
import { OficinaService } from '../oficinas/oficinas.service';
import { ConfiguracionReportesContabilidadService } from '../configuracion-reportes/contabilidad/configuracion-reportes-contabilidad.service';

export class IaService {
    private ai: GoogleGenAI;
    private oficinaService: OficinaService;
    private configuracionReportesService: ConfiguracionReportesContabilidadService;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        this.oficinaService = new OficinaService();
        this.configuracionReportesService = new ConfiguracionReportesContabilidadService();
    }

    indicadoresRepository = new IndicadoresRepository();
    reporteContabilidadRepository = new ReporteContabilidadRepository();

    convertToBase64 = (buffer: Buffer<ArrayBufferLike>): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                const base64String = buffer.toString('base64');
                resolve(base64String);
            } catch (error) {
                reject(error);
            }
        });
    };

    transcribeAudio = async (base64Audio: string): Promise<string> => {
        try {
            const result = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [
                    'Please transcribe this audio file accurately.',
                    {
                        inlineData: {
                            mimeType: 'audio/mp3',
                            data: base64Audio
                        }
                    },
                ],
            });

            return result.text || 'No se pudo transcribir el audio.';
        } catch (error) {
            console.error('Error transcribing audio:', error);
            throw error;
        }
    };

    async obtenerRespuesta(message: string | undefined, audioBlob: Buffer<ArrayBufferLike> | null, conversation?: Array<{role: string, content: string}>): Promise<string> {
        // Define the function declarations
        const fetchIndicatorDataFunctionDeclaration = {
            name: 'fetch_indicator_data',
            description: 'Fetches specific indicator data from the database muestra los datos como consideres conveniente para un usuario no tecnico, indicator data includes name, id, description, meta, thresholds, numerador, denominador, color, esActivo, estaEnPantallaPrincipal, mayorEsMejor, numeradorAbsoluto, ordenMuestra y denominadorAbsoluto, ',
            parameters: {
                type: Type.OBJECT,
                properties: {},
                required: [],
            },
        };

        const fetchAccountingReportFunctionDeclaration = {
            name: 'fetch_accounting_report',
            description: 'Genera un reporte de contabilidad para una fecha o rango de fechas específico. El reporte incluye datos financieros organizados por categorías y cuentas.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    fecha: {
                        type: Type.STRING,
                        description: 'Fecha específica para el reporte en formato YYYY-MM-DD (opcional si se proporciona un rango)',
                    },
                    fechaInicio: {
                        type: Type.STRING,
                        description: 'Fecha de inicio para el rango del reporte en formato YYYY-MM-DD (opcional si se proporciona una fecha específica)',
                    },
                    fechaFin: {
                        type: Type.STRING,
                        description: 'Fecha de fin para el rango del reporte en formato YYYY-MM-DD (opcional si se proporciona una fecha específica)',
                    },
                    oficina: {
                        type: Type.STRING,
                        description: 'Código o nombre de la oficina para la cual generar el reporte',
                    },
                    nombreConfiguracion: {
                        type: Type.STRING,
                        description: 'Nombre de la configuración del reporte a utilizar',
                    },
                    tipoReporte: {
                        type: Type.STRING,
                        description: 'Tipo de reporte: "diario" o "mensual" (opcional, por defecto es "mensual")',
                    },
                },
                required: ['oficina', 'nombreConfiguracion'],
            },
        };

        let contents;

        if (audioBlob) {
            const base64Audio = await this.convertToBase64(audioBlob);
            contents = [
                '',
                {
                    inlineData: {
                        mimeType: 'audio/mp3',
                        data: base64Audio
                    }
                },
            ];
        } else if (conversation && conversation.length > 0) {
            // Use the full conversation history for context
            contents = conversation.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));
        } else {
            contents = [message || ""];
        }

        // Send request with function declarations
        let response;
        
        if (conversation && conversation.length > 0) {
            // For conversation history, format the contents properly for the Gemini API
            // The Gemini API expects a specific format for conversations
            console.log('Using conversation history with', conversation.length, 'messages');
            
            // Format the conversation for Gemini API
            const formattedContents = conversation.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));
            
            response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: formattedContents,
                config: {
                    tools: [{
                        functionDeclarations: [
                            fetchIndicatorDataFunctionDeclaration,
                            fetchAccountingReportFunctionDeclaration,
                        ],
                    }],
                },
            });
        } else {
            // For single messages or audio, use the standard API
            response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: contents,
                config: {
                    tools: [{
                        functionDeclarations: [
                            fetchIndicatorDataFunctionDeclaration,
                            fetchAccountingReportFunctionDeclaration,
                        ],
                    }],
                },
            });
        }

        // Check for function calls in the response
        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCall = response.functionCalls[0];
            if (functionCall.name === 'fetch_indicator_data') {
                console.log("obteniendo indicadores ....")
                const indicadores = await this.indicadoresRepository.obtenerTodos();
                const prompt = `Dados los siguientes indicadores ${JSON.stringify(indicadores)}, devuelve lo que el usuario quiere aqui. ${message}`
                const response = await this.ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: [prompt],
                });
                return response.text || 'No se encontró una respuesta adecuada.';
            } else if (functionCall.name === 'fetch_accounting_report') {
                console.log("Generando reporte de contabilidad....");
                // Inspeccionar el tipo de dato real
                console.log("Tipo de functionCall.args:", typeof functionCall.args);
                console.log("Valor de functionCall.args:", functionCall.args);
                
                // Manejar el objeto directamente si ya es un objeto
                const params = typeof functionCall.args === 'object' && functionCall.args !== null 
                    ? functionCall.args 
                    : (typeof functionCall.args === 'string' 
                        ? JSON.parse(functionCall.args) 
                        : {});
                
                // Validar parámetros
                if (!params.oficina || !params.nombreConfiguracion) {
                    return 'Para generar un reporte de contabilidad, necesito saber la oficina y la configuración del reporte.';
                }
                
                // Declarar reporteData fuera del bloque try-catch para que esté disponible en todo el ámbito
                let reporteData: any;
                
                try {
                    // Obtener listas de oficinas y configuraciones disponibles
                    const oficinasDisponibles = await this.obtenerOficinasDisponibles();
                    const configuracionesDisponibles = await this.obtenerConfiguracionesDisponibles();
                    
                    console.log('Oficinas disponibles:', oficinasDisponibles);
                    console.log('Configuraciones disponibles:', configuracionesDisponibles);
                    
                    // Encontrar la mejor coincidencia para la oficina
                    const oficinaIngresada = params.oficina;
                    const oficinaCoincidente = this.encontrarMejorCoincidencia(oficinaIngresada, oficinasDisponibles);
                    
                    if (!oficinaCoincidente) {
                        return `No se encontró ninguna oficina que coincida con "${oficinaIngresada}". Las oficinas disponibles son: ${oficinasDisponibles.join(', ')}`;
                    }
                    
                    // Encontrar la mejor coincidencia para la configuración
                    const configuracionIngresada = params.nombreConfiguracion;
                    const configuracionCoincidente = this.encontrarMejorCoincidencia(configuracionIngresada, configuracionesDisponibles);
                    
                    if (!configuracionCoincidente) {
                        return `No se encontró ninguna configuración de reporte que coincida con "${configuracionIngresada}". Las configuraciones disponibles son: ${configuracionesDisponibles.join(', ')}`;
                    }
                    
                    console.log(`Coincidencia de oficina: "${oficinaIngresada}" -> "${oficinaCoincidente}"`);
                    console.log(`Coincidencia de configuración: "${configuracionIngresada}" -> "${configuracionCoincidente}"`);
                    
                    // Preparar los datos para la solicitud del reporte con las coincidencias encontradas
                    reporteData = {
                        oficina: oficinaCoincidente,
                        nombreConfiguracion: configuracionCoincidente,
                    };
                } catch (error) {
                    console.error('Error al buscar coincidencias:', error);
                    // Preparar los datos para la solicitud del reporte con los valores originales
                    reporteData = {
                        oficina: params.oficina,
                        nombreConfiguracion: params.nombreConfiguracion,
                    };
                }
                
                // Determinar si es un reporte por fecha específica o por rango
                if (params.fecha) {
                    reporteData.fecha = params.fecha;
                } else if (params.fechaInicio && params.fechaFin) {
                    reporteData.fechaInicio = params.fechaInicio;
                    reporteData.fechaFin = params.fechaFin;
                    reporteData.tipoReporte = params.tipoReporte || 'mensual';
                } else {
                    // Si no se proporciona fecha ni rango, usar la fecha actual
                    const hoy = new Date();
                    reporteData.fecha = hoy.toISOString().split('T')[0];
                }
                
                try {
                    // Generar el reporte usando el repositorio
                    const resultado = await this.reporteContabilidadRepository.generarReporteContabilidad(reporteData);
                    
                    if (!resultado.success) {
                        return `No se pudo generar el reporte: ${resultado.message}`;
                    }
                    
                    // Formatear los resultados para presentarlos al usuario
                    const reporteInfo = resultado.data || {};
                    const descripcionPeriodo = 'descripcionPeriodo' in reporteInfo ? reporteInfo.descripcionPeriodo : 'No especificado';
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
                    
                    const aiResponse = await this.ai.models.generateContent({
                        model: 'gemini-2.0-flash',
                        contents: [prompt],
                    });
                    
                    return aiResponse.text || 'Se generó el reporte de contabilidad, pero no se pudo crear un resumen.';
                } catch (error) {
                    console.error('Error al generar reporte de contabilidad con IA:', error);
                    return 'Ocurrió un error al generar el reporte de contabilidad. Por favor, intenta nuevamente.';
                }
            }
        }

        console.log("Respuesta de Gemini:", response.text);
        console.log("function calls:", response.functionCalls);
        return response.text || 'No se encontró una respuesta adecuada.';
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
            console.error('Error al obtener oficinas disponibles:', error);
            return [];
        }
    }
    
    /**
     * Obtiene la lista de configuraciones de reportes disponibles utilizando el servicio existente
     * @returns Array con los nombres de las configuraciones
     */
    private async obtenerConfiguracionesDisponibles(): Promise<string[]> {
        try {
            // Utilizar el servicio de configuración de reportes existente
            const respuesta = await this.configuracionReportesService.obtenerConfiguracionesActivas();
            
            if (!respuesta || !respuesta.configuraciones) {
                return [];
            }
            
            // Extraer los nombres de las configuraciones
            return respuesta.configuraciones.map(config => config.nombre);
        } catch (error) {
            console.error('Error al obtener configuraciones disponibles:', error);
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