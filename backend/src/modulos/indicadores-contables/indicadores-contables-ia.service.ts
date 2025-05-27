import { Type } from '@google/genai';
import { IndicadoresContablesRepository } from './indicadores-contables.repository';

/**
 * Servicio para integrar los indicadores contables con el módulo de IA
 * Este servicio contiene toda la lógica específica para que el módulo de IA
 * pueda interactuar con los indicadores contables
 */
export class IndicadoresContablesIAService {
    private indicadoresRepository: IndicadoresContablesRepository;

    constructor() {
        this.indicadoresRepository = new IndicadoresContablesRepository();
    }

    /**
     * Obtiene la declaración de función para ser utilizada en la IA
     * @returns Declaración de función para obtener datos de indicadores contables
     */
    getFunctionDeclaration() {
        return {
            name: 'fetch_indicator_data',
            description: 'Obtiene datos de indicadores contables de la base de datos y los muestra de manera comprensible para un usuario no técnico. Los datos incluyen nombre, id, descripción, meta, umbrales, numerador, denominador, color, esActivo, estaEnPantallaPrincipal, mayorEsMejor, numeradorAbsoluto, ordenMuestra y denominadorAbsoluto.',
            parameters: {
                type: Type.OBJECT,
                properties: {},
                required: [],
            },
        };
    }

    /**
     * Procesa una llamada de función de IA para obtener datos de indicadores
     * @param message Mensaje original del usuario
     * @returns Respuesta formateada para la IA
     */
    async processFunctionCall(message: string): Promise<string> {
        console.log("[IndicadoresContablesIAService] Procesando llamada de función para indicadores contables");
        
        try {
            // Obtener todos los indicadores
            console.log("[IndicadoresContablesIAService] Obteniendo indicadores...");
            const indicadores = await this.indicadoresRepository.obtenerTodos();
            
            // Generar prompt para la IA con los datos obtenidos
            const prompt = `
                He obtenido los siguientes indicadores contables:
                
                ${JSON.stringify(indicadores, null, 2)}
                
                Por favor, analiza estos datos y presenta un resumen claro y conciso para el usuario, destacando:
                1. Los indicadores más relevantes y sus características
                2. Información sobre metas y umbrales
                3. Cualquier otra información útil para el usuario
                
                Responde a la consulta original del usuario: ${message}
            `;
            
            return prompt;
        } catch (error: any) {
            console.error("[IndicadoresContablesIAService] Error al procesar indicadores:", error);
            
            // Manejar específicamente el error de sobrecarga del modelo
            if (error.message && (
                error.message.includes("The model is overloaded") ||
                error.message.includes("503 Service Unavailable")
            )) {
                return "Lo siento, el servicio de inteligencia artificial está experimentando alta demanda en este momento. " +
                       "Por favor, espera unos minutos e intenta nuevamente. Este es un problema temporal del servicio.";
            }
            
            return `Ocurrió un error al obtener los datos de indicadores contables: ${error.message}. Por favor, intenta nuevamente.`;
        }
    }
}
