import { GoogleGenAI } from '@google/genai';
import { IATranscripcionService } from './ia-transcripcion';
import { IAConversacionService, MensajeConversacion } from './ia-conversacion';
import { IAFuncionesService } from './ia-funciones';

/**
 * Servicio principal de IA que coordina los diferentes servicios especializados
 * Siguiendo el principio de separación de responsabilidades, este servicio
 * delega las tareas específicas a servicios especializados
 */
export class IaService {
    private ai: GoogleGenAI;
    private transcripcionService: IATranscripcionService;
    private conversacionService: IAConversacionService;
    private funcionesService: IAFuncionesService;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        this.transcripcionService = new IATranscripcionService();
        this.conversacionService = new IAConversacionService();
        this.funcionesService = new IAFuncionesService();
    }

    /**
     * Transcribe un archivo de audio a texto
     * @param audioBlob Buffer con el contenido del audio
     * @returns Promesa con el texto transcrito
     */
    async transcribirAudio(audioBlob: Buffer<ArrayBufferLike>): Promise<string> {
        return this.transcripcionService.transcribirAudio(audioBlob);
    }

    /**
     * Obtiene una respuesta de la IA basada en diferentes tipos de entrada
     * @param message Mensaje de texto (opcional)
     * @param audioBlob Buffer de audio (opcional)
     * @param conversation Historial de conversación (opcional)
     * @returns Promesa con la respuesta de la IA
     */
    async obtenerRespuesta(message: string | undefined, audioBlob: Buffer<ArrayBufferLike> | null, conversation?: Array<MensajeConversacion>): Promise<string> {
        try {
            console.log("[IaService] Procesando solicitud de respuesta");
            
            // Obtener las declaraciones de funciones
            const declaracionesFunciones = this.funcionesService.obtenerDeclaracionesFunciones();
            
            // Preparar el contenido según el tipo de entrada
            let contents;
            
            if (audioBlob) {
                // Si hay audio, primero transcribirlo
                const textoTranscrito = await this.transcribirAudio(audioBlob);
                console.log(`[IaService] Audio transcrito: "${textoTranscrito}"`);
                
                // Usar el texto transcrito como mensaje
                message = textoTranscrito;
                contents = [message];
            } else if (conversation && conversation.length > 0) {
                // Si hay conversación, formatearla
                contents = this.conversacionService.formatearConversacion(conversation);
            } else {
                // Si solo hay mensaje de texto
                contents = [message || ""];
            }
            
            // Enviar solicitud a la IA
            let response;
            
            if (conversation && conversation.length > 0) {
                // Para conversaciones, usar el formato adecuado
                console.log('[IaService] Usando historial de conversación con', conversation.length, 'mensajes');
                
                response = await this.ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: contents,
                    config: {
                        tools: [{
                            functionDeclarations: declaracionesFunciones,
                        }],
                    },
                });
            } else {
                // Para mensajes simples o audio transcrito
                response = await this.ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: contents,
                    config: {
                        tools: [{
                            functionDeclarations: declaracionesFunciones,
                        }],
                    },
                });
            }

            // Verificar si hay llamadas a funciones en la respuesta
            if (response.functionCalls && response.functionCalls.length > 0) {
                const functionCall = response.functionCalls[0];
                
                // Delegar el procesamiento de la llamada a función al servicio especializado
                return await this.funcionesService.procesarLlamadaFuncion(
                    functionCall, 
                    message || ''
                );
            }
            
            // Si no hay llamadas a funciones, devolver la respuesta directa
            console.log("[IaService] Respuesta directa de Gemini:", response.text);
            return response.text || 'No se encontró una respuesta adecuada.';
        
        } catch (error: any) {
            console.error("[IaService] Error al obtener una respuesta de la IA:", error);
            
            // Manejar específicamente el error de sobrecarga del modelo
            if (error.message && (
                error.message.includes("The model is overloaded") ||
                error.message.includes("503 Service Unavailable")
            )) {
                return "Lo siento, el servicio de inteligencia artificial está experimentando alta demanda en este momento. " +
                       "Por favor, espera unos minutos e intenta nuevamente. Este es un problema temporal del servicio.";
            }
            
            // Manejar otros errores
            return `Ocurrió un error al procesar tu solicitud: ${error.message}. Por favor, intenta nuevamente más tarde.`;
        }
    }

}