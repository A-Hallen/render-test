import { useState } from 'react';
import { VoiceRecorder } from './VoiceRecorder';

/**
 * Componente para manejar la entrada de audio en el chat
 */
export const InputAudio: React.FC<{ onInput: (audioBlob: Blob) => void }> = ({ onInput }) => {
    // Estado para controlar cuando se está procesando el audio
    const [isProcessing] = useState(false);
    
    // Función que maneja la finalización de la grabación
    const handleRecordingComplete = async (audioBlob: Blob) => onInput(audioBlob);

    return (
        <div>
            {isProcessing ?
                <div className="flex p-2 items-center justify-center">
                    <div className="w-[20px] h-[20px] border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                </div> : <VoiceRecorder onRecordingComplete={handleRecordingComplete} />}
        </div>

    );
};