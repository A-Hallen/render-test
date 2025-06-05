import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, Loader2, Info, ChevronDown, Trash2 } from 'lucide-react';
import { InputAudio } from './InputAudio';
import ReactMarkdown from "react-markdown";
import { enviarMensaje, enviarAudio } from "../../services/chat.service";

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

  const setInputAudio = async (audioBlob: Blob) => {
    const id = Date.now().toString();
    const userMessage: Message = {
      id: id,
      sender: 'user',
      text: 'Enviando audio...',
      audio: audioBlob,
      timestamp: new Date(),
      state: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Preparar historial de conversación para contexto
    const conversationHistory = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      content: msg.text
    }));

    try {
      // Crear un archivo de audio a partir del blob
      const audioFile = new File([audioBlob], 'audio.mp3', {
        type: 'audio/mpeg'
      });
      
      // Usar el servicio centralizado para enviar el audio
      const data = await enviarAudio(audioFile, conversationHistory);
      
      // Actualizar el mensaje del usuario con la transcripción
      setMessages(prev =>
        prev.map(msg =>
          msg.id === id
            ? {
              ...msg,
              state: 'received',
              text: data.transcription || 'No se pudo transcribir el audio.',
            }
            : msg
        )
      );

      // Crear mensaje de respuesta del AI
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: data.response || 'Lo siento, no tengo información específica sobre esa consulta.',
        audio: null,
        timestamp: new Date(),
        state: 'received',
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing audio:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === id
            ? { ...msg, state: 'error', text: 'Error al enviar el audio.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Autoscroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const id = Date.now().toString();

    // Agregar mensaje del usuario
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
    
    // Preparar historial de conversación para contexto
    const conversationHistory = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      content: msg.text
    }));
    
    // Agregar el mensaje actual
    conversationHistory.push({
      role: 'user',
      content: inputText
    });

    try {
      // Usar el servicio centralizado para enviar el mensaje
      const data = await enviarMensaje(userMessage.text, conversationHistory);
      
      // Actualizar el estado del mensaje del usuario
      setMessages(prev =>
        prev.map(msg =>
          msg.id === id
            ? { ...msg, state: 'received' }
            : msg
        )
      );
      
      // Crear mensaje de respuesta del AI
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: data.message || 'Lo siento, no tengo información específica sobre esa consulta.',
        timestamp: new Date(),
        audio: null,
        state: 'received',
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      // Actualizar el estado del mensaje del usuario
      setMessages(prev =>
        prev.map(msg =>
          msg.id === id
            ? { ...msg, state: 'received' }
            : msg
        )
      );
      
      // Crear mensaje de error
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'Hubo un error al procesar tu consulta. Por favor, inténtalo de nuevo más tarde.',
        timestamp: new Date(),
        audio: null,
        state: 'received',
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const [showInfo, setShowInfo] = useState(false);

  const handleClearChat = () => {
    // Keep only the initial welcome message
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: 'Hola, soy el asistente financiero IA de la cooperativa. ¿En qué puedo ayudarte hoy?',
        audio: null,
        timestamp: new Date(),
        state: "received"
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-blue-100 overflow-hidden">
      <div className="p-4 border-b border-blue-100 bg-blue-600 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <Bot className="mr-2" size={22} />
            Asistente Financiero IA
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={handleClearChat}
              className="p-1.5 rounded-full hover:bg-blue-500 transition-colors"
              title="Limpiar chat"
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="p-1.5 rounded-full hover:bg-blue-500 transition-colors"
              title="Información"
            >
              <Info size={18} />
            </button>
          </div>
        </div>
        
        {showInfo && (
          <div className="mt-3 p-3 bg-blue-500 rounded-lg text-sm overflow-hidden transition-all duration-300 ease-in-out">
            <p className="mb-2">
              Este asistente te permite:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Consultar información financiera de la cooperativa</li>
              <li>Generar reportes personalizados</li>
              <li>Analizar indicadores y tendencias</li>
              <li>Obtener recomendaciones basadas en datos</li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-300 ease-in-out`}
          >
            <div
              className={`flex max-w-[80%] shadow-sm ${message.sender === 'user'
                ? 'bg-blue-600 text-white rounded-2xl rounded-br-none'
                : 'bg-white border border-blue-100 text-gray-800 rounded-2xl rounded-bl-none'
                }`}
            >
              <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full mt-2 ml-2 mr-1 ${message.sender === 'user' ? 'bg-blue-500' : 'bg-blue-100'}`}>
                {message.sender === 'user' ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-blue-600" />
                )}
              </div>
              <div className="p-3">
                <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                  {message.sender === 'ai' ? 
                    <ReactMarkdown>
                      {message.text}
                    </ReactMarkdown> : 
                    <p>
                      {message.text}
                      {message.state === 'sending' && (
                        <span className="ml-2 inline-block">
                          <Loader2 size={12} className="animate-spin text-blue-500" />
                        </span>
                      )}
                      {message.state === 'error' && (
                        <span className="ml-2 text-xs text-red-500">
                          Error al enviar
                        </span>
                      )}
                    </p>
                  }
                </div>
                {
                  message.audio ? (
                    <div className="mt-2 p-1 bg-blue-50 rounded-lg">
                      <audio controls className="w-full h-8">
                        <source src={URL.createObjectURL(message.audio)} type="audio/wav" />
                        Tu navegador no soporta el elemento de audio.
                      </audio>
                    </div>
                  ) : <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {message.state === 'sending' ? (
                      <span className="flex items-center">
                        <Loader2 size={10} className="animate-spin mr-1" />
                        Enviando...
                      </span>
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
            <div className="bg-white border border-blue-100 text-gray-800 rounded-2xl rounded-bl-none shadow-sm p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 mr-2">
                  <Bot size={16} className="text-blue-600" />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">El asistente está escribiendo</span>
                  <span className="ml-1 flex space-x-1">
                    <span className="h-1 w-1 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0s'}} />
                    <span className="h-1 w-1 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                    <span className="h-1 w-1 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-blue-100 bg-white">
        <div className="flex items-end space-x-2">
          <button className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors">
            <Paperclip size={20} />
          </button>

          <div className="flex-1 rounded-xl border border-blue-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all shadow-sm hover:shadow">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              className="w-full p-3 text-gray-800 resize-none focus:outline-none rounded-xl max-h-32"
              rows={1}
              style={{ minHeight: '44px' }}
            />
          </div>

          <InputAudio onInput={setInputAudio} />

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-full shadow-sm ${inputText.trim() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } transition-all`}
          >
            <Send size={18} />
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-center mb-2">
            <div className="h-px bg-gray-200 flex-grow"></div>
            <button 
              className="mx-2 text-xs text-gray-500 flex items-center hover:text-blue-600 transition-colors"
              onClick={() => document.getElementById('suggestions')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Sugerencias <ChevronDown size={14} className="ml-1" />
            </button>
            <div className="h-px bg-gray-200 flex-grow"></div>
          </div>
          <div id="suggestions" className="flex flex-wrap justify-center gap-2">
            {[
              'Mostrar índice de morosidad', 
              'Generar reporte de liquidez', 
              'Análisis de cartera',
              'Tendencias de ahorro',
              'Proyección financiera'
            ].map((suggestion) => (
              <button
                key={suggestion}
                className="px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-full text-sm text-blue-700 shadow-sm transition-all hover:scale-105 active:scale-95"
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