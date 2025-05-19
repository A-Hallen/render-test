import { useState } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

const initializeGemini = (apiKey: string) => {
    genAI = new GoogleGenerativeAI(apiKey);
};

export const InputAudio: React.FC<{ onInput: (audioBlob: Blob) => void }> = ({ onInput }) => {
    const GEMINI_API_KEY = "AIzaSyDjw_g1kQZAofU-DOsdsCjgkf3_06R2UEk";
    const [isProcessing, setIsProcessing] = useState(false);

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleRecordingComplete = async (audioBlob: Blob) => onInput(audioBlob);

    return (
        <div>
            {isProcessing ?
                <div className="flex p-2 items-center justify-center">
                    <div className="w-[20px] h-[20px] border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
                </div> : <VoiceRecorder onRecordingComplete={handleRecordingComplete} />}
        </div>

    );
};