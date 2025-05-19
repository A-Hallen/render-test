import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, Loader2 } from 'lucide-react';
import { InputAudio } from './InputAudio';
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  audio: Blob | null;
  timestamp: Date;
  state: 'sending' | 'received' | 'error';
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hola, soy el asistente financiero IA de la cooperativa. ¿En qué puedo ayudarte hoy?',
      audio: null,
      timestamp: new Date(),
      state: "received"
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const setInputAudio = (audioBlob: Blob) => {
    const id = Date.now().toString();
    //const audioUrl = URL.createObjectURL(audioBlob);
    const userMessage: Message = {
      id: id,
      sender: 'user',
      text: '',
      audio: audioBlob,
      timestamp: new Date(),
      state: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const formData = new FormData();
    const audioFile = new File([audioBlob], 'audio.mp3', {
      type: 'audio/mpeg' // Ajusta el tipo MIME según tu formato de audio
    });
    formData.append('audio', audioFile);

    fetch('api/chat/audio', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id
              ? {
                ...msg,
                state: 'received',
                text: data.transcription || 'No se pudo transcribir el audio.',
              }
              : msg
          )
        );

        const aiMessage: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: data.response || 'Lo siento, no tengo información específica sobre esa consulta.',
          audio: null,
          timestamp: new Date(),
          state: 'received',
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error processing audio:', error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id
              ? { ...msg, state: 'error', text: 'Error al enviar el audio.' }
              : msg
          )
        );
        setIsLoading(false);
      });
  }

  // Autoscroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const id = Date.now().toString();

    // Add user message
    const userMessage: Message = {
      id: id,
      sender: 'user',
      text: inputText,
      timestamp: new Date(),
      state: 'sending',
      audio: null,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    fetch('api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage.text }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const aiMessage: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: data.message || 'Lo siento, no tengo información específica sobre esa consulta.',
          timestamp: new Date(),
          audio: null,
          state: 'received',
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching AI response:', error);
        const aiMessage: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'Hubo un error al procesar tu consulta. Por favor, inténtalo de nuevo más tarde.',
          timestamp: new Date(),
          audio: null,
          state: 'received',
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      }).finally(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id
              ? { ...msg, state: 'received', text: inputText }
              : msg
          )
        );
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <h2 className="text-lg font-semibold text-blue-900 flex items-center">
          <Bot className="mr-2" size={20} />
          Asistente Financiero IA
        </h2>
        <p className="text-sm text-blue-700">
          Consulta información, genera reportes o analiza indicadores financieros
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] rounded-lg p-3 ${message.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
            >
              <div className="flex-shrink-0 mr-2 mt-0.5">
                {message.sender === 'user' ? (
                  <User size={18} className="text-blue-200" />
                ) : (
                  <Bot size={18} className="text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm whitespace-pre-wrap">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </p>
                {
                  message.audio ? (
                    <audio controls className="mt-1">
                      <source src={URL.createObjectURL(message.audio)} type="audio/wav" />
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  ) : <p className="text-xs mt-1 opacity-70">
                    {message.state === 'sending' ? (
                      <span className="text-gray-500">Enviando...</span>
                    ) : (
                      <>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                    )}
                  </p>
                }
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-3">
              <div className="flex items-center">
                <Loader2 size={18} className="text-blue-600 animate-spin mr-2" />
                <span className="text-sm">El asistente está escribiendo...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <Paperclip size={20} />
          </button>

          <div className="flex-1 rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              className="w-full p-3 text-gray-800 resize-none focus:outline-none rounded-lg max-h-32"
              rows={1}
              style={{ minHeight: '44px' }}
            />
          </div>

          <InputAudio onInput={setInputAudio} />

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`p-2.5 rounded-full ${inputText.trim() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
          >
            <Send size={18} />
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Sugerencias:
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            {['Mostrar índice de morosidad', 'Generar reporte de liquidez', 'Análisis de cartera'].map((suggestion) => (
              <button
                key={suggestion}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs"
                onClick={() => setInputText(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};