/**
 * Servicio para gestionar las interacciones con el chat de IA
 * Utiliza el cliente HTTP centralizado para manejar automáticamente
 * tokens y errores de autenticación
 */

import { httpClient } from './httpClient';

/**
 * Envía un mensaje al chat de IA
 * @param mensaje Mensaje a enviar
 * @param historial Historial de conversación (opcional)
 * @returns Respuesta del chat
 */
export async function enviarMensaje(mensaje: string, historial: any[] = []) {
  try {
    return await httpClient.post('api/chat', { message: mensaje, conversation: historial });
  } catch (error) {
    console.error('Error al enviar mensaje al chat:', error);
    throw error;
  }
}

/**
 * Envía un audio al chat de IA para transcripción y respuesta
 * @param audioFormData FormData con el archivo de audio y el historial de conversación
 * @returns Respuesta del chat con transcripción y respuesta
 */
export async function enviarAudio(audioFile: File, historial: any[] = []) {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('conversation', JSON.stringify(historial));
    
    return await httpClient.upload('api/chat/audio', formData);
  } catch (error) {
    console.error('Error al enviar audio al chat:', error);
    throw error;
  }
}

/**
 * Convierte texto a audio usando el servicio de IA
 * @param texto Texto a convertir en audio
 * @returns URL del audio generado
 */
export async function generarAudio(texto: string) {
  try {
    const formData = new FormData();
    formData.append('texto', texto);
    
    return await httpClient.upload('api/chat/audio', formData);
  } catch (error) {
    console.error('Error al generar audio:', error);
    throw error;
  }
}

/**
 * Obtiene un blob de audio a partir de una URL
 * @param audioUrl URL del audio a obtener
 * @returns Blob del audio
 */
export async function obtenerAudioBlob(audioUrl: string): Promise<Blob> {
  try {
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Error al obtener el audio: ${response.status} ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Error al obtener el blob de audio:', error);
    throw error;
  }
}
