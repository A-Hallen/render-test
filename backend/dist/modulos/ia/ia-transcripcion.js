"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IATranscripcionService = void 0;
const genai_1 = require("@google/genai");
/**
 * Servicio para la transcripción de audio utilizando IA
 */
class IATranscripcionService {
    constructor() {
        /**
         * Convierte un buffer a formato Base64
         * @param buffer Buffer de datos a convertir
         * @returns Promesa con la cadena en formato Base64
         */
        this.convertToBase64 = (buffer) => {
            return new Promise((resolve, reject) => {
                try {
                    const base64String = buffer.toString('base64');
                    resolve(base64String);
                }
                catch (error) {
                    reject(error);
                }
            });
        };
        this.ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    /**
     * Transcribe un archivo de audio a texto utilizando IA
     * @param audioBlob Buffer con el contenido del audio
     * @returns Promesa con el texto transcrito
     */
    async transcribirAudio(audioBlob) {
        try {
            console.log("[IATranscripcionService] Transcribiendo audio...");
            // Convertir el audio a Base64
            const base64Audio = await this.convertToBase64(audioBlob);
            // Enviar a la IA para transcripción
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
        }
        catch (error) {
            console.error('[IATranscripcionService] Error al transcribir audio:', error);
            // Manejar específicamente el error de sobrecarga del modelo
            if (error.message && (error.message.includes("The model is overloaded") ||
                error.message.includes("503 Service Unavailable"))) {
                return "Lo siento, el servicio de inteligencia artificial está experimentando alta demanda en este momento. " +
                    "Por favor, espera unos minutos e intenta nuevamente. Este es un problema temporal del servicio.";
            }
            throw error;
        }
    }
}
exports.IATranscripcionService = IATranscripcionService;
