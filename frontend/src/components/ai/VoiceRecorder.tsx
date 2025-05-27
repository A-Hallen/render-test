import { useState, useRef } from 'react';
import { Mic, StopCircle } from 'lucide-react';

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        console.log("comenzando a gravar");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                // Convert webm to mp3 before sending to Gemini
                convertToMp3(audioBlob).then(mp3Blob => {
                    onRecordingComplete(mp3Blob);
                });

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        console.log("terminando gravacion");
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Convert webm to mp3 using Web Audio API
    const convertToMp3 = async (webmBlob: Blob): Promise<Blob> => {
        const audioContext = new AudioContext();
        const arrayBuffer = await webmBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Create an offline context for rendering
        const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();

        const renderedBuffer = await offlineContext.startRendering();

        // Convert to WAV format (since MP3 encoding is not natively supported)
        const wavBlob = await audioBufferToWav(renderedBuffer);
        return new Blob([wavBlob], { type: 'audio/wav' });
    };

    // Convert AudioBuffer to WAV format
    const audioBufferToWav = (buffer: AudioBuffer): Promise<Blob> => {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2;
        const result = new Float32Array(length);
        let offset = 0;

        // Extract the audio data
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                result[offset++] = channelData[i];
            }
        }

        // Create WAV header
        const wavHeader = createWavHeader(length, buffer.sampleRate);
        const wavBlob = new Blob([wavHeader, result], { type: 'audio/wav' });
        return Promise.resolve(wavBlob);
    };

    // Create WAV header
    const createWavHeader = (dataLength: number, sampleRate: number): ArrayBuffer => {
        const header = new ArrayBuffer(44);
        const view = new DataView(header);

        // RIFF identifier
        writeString(view, 0, 'RIFF');
        // File length
        view.setUint32(4, 36 + dataLength, true);
        // WAVE identifier
        writeString(view, 8, 'WAVE');
        // Format chunk identifier
        writeString(view, 12, 'fmt ');
        // Format chunk length
        view.setUint32(16, 16, true);
        // Sample format (float)
        view.setUint16(20, 3, true);
        // Channel count
        view.setUint16(22, 1, true);
        // Sample rate
        view.setUint32(24, sampleRate, true);
        // Byte rate
        view.setUint32(28, sampleRate * 4, true);
        // Block align
        view.setUint16(32, 4, true);
        // Bits per sample
        view.setUint16(34, 32, true);
        // Data chunk identifier
        writeString(view, 36, 'data');
        // Data chunk length
        view.setUint32(40, dataLength, true);

        return header;
    };

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    return (
        <div className="flex items-center gap-4">
            <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                className={`p-2 rounded-full transition-colors ${isRecording 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'}`}
                title={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
            >
                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>
        </div>
    );
}
