"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAConversacionService = void 0;
const genai_1 = require("@google/genai");
/**
 * Servicio para el manejo de conversaciones con IA
 */
class IAConversacionService {
    constructor() {
        this.ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    /**
     * Formatea una conversación para su uso con la API de Gemini
     * @param conversation Historial de conversación
     * @returns Conversación formateada para Gemini
     */
    formatearConversacion(conversation) {
        console.log('[IAConversacionService] Formateando conversación con', conversation.length, 'mensajes');
        // Formatear la conversación para la API de Gemini
        return conversation.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
    }
}
exports.IAConversacionService = IAConversacionService;
