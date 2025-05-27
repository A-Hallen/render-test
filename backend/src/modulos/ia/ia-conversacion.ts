import { GoogleGenAI } from '@google/genai';

/**
 * Interfaz para representar un mensaje en una conversación
 */
export interface MensajeConversacion {
    role: string;
    content: string;
}

/**
 * Servicio para el manejo de conversaciones con IA
 */
export class IAConversacionService {
    private ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    /**
     * Formatea una conversación para su uso con la API de Gemini
     * @param conversation Historial de conversación
     * @returns Conversación formateada para Gemini
     */
    formatearConversacion(conversation: Array<MensajeConversacion>) {
        console.log('[IAConversacionService] Formateando conversación con', conversation.length, 'mensajes');
        
        // Formatear la conversación para la API de Gemini
        return conversation.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
    }
}
