/**
 * Componente de Asistente de IA
 * Permite interactuar con el sistema mediante lenguaje natural
 */

import React, { useState, useRef, useEffect } from 'react';
import { asistenteIAService, RespuestaIA } from '../../services/AsistenteIAService';
import Visualizacion from '../../features/visualizacion/componentes/Visualizacion';
import { useAutorizacion } from '../../context/AutorizacionContext';

interface MensajeChat {
  id: string;
  texto: string;
  esUsuario: boolean;
  visualizacion?: RespuestaIA['visualizacion'];
  datos?: RespuestaIA['datos'];
  sugerencias?: string[];
  timestamp: Date;
}

interface AsistenteIAProps {
  className?: string;
}

const AsistenteIA: React.FC<AsistenteIAProps> = ({ className = '' }) => {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [consulta, setConsulta] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [escuchando, setEscuchando] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { usuario } = useAutorizacion();
  
  // Mensaje de bienvenida
  useEffect(() => {
    const mensajeBienvenida: MensajeChat = {
      id: 'bienvenida',
      texto: `¡Hola${usuario ? `, ${usuario.nombre}` : ''}! Soy tu asistente financiero. ¿En qué puedo ayudarte hoy?`,
      esUsuario: false,
      sugerencias: [
        'Muéstrame un gráfico de barras 3D de ingresos por oficina',
        '¿Cuál es la tendencia de captaciones en los últimos 6 meses?',
        'Compara los resultados entre las oficinas'
      ],
      timestamp: new Date()
    };
    
    setMensajes([mensajeBienvenida]);
  }, [usuario]);
  
  // Desplazar al último mensaje
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [mensajes]);
  
  // Manejar envío de consulta
  const handleEnviarConsulta = async () => {
    if (!consulta.trim()) return;
    
    // Agregar mensaje del usuario
    const mensajeUsuario: MensajeChat = {
      id: `user-${Date.now()}`,
      texto: consulta,
      esUsuario: true,
      timestamp: new Date()
    };
    
    setMensajes(prev => [...prev, mensajeUsuario]);
    setCargando(true);
    setConsulta('');
    
    try {
      // Procesar consulta con el asistente
      const respuesta = await asistenteIAService.procesarConsulta({
        texto: consulta,
        usuario: usuario?.id,
        fecha: new Date()
      });
      
      // Agregar respuesta del asistente
      const mensajeAsistente: MensajeChat = {
        id: `assistant-${Date.now()}`,
        texto: respuesta.texto,
        esUsuario: false,
        visualizacion: respuesta.visualizacion,
        datos: respuesta.datos,
        sugerencias: respuesta.sugerencias,
        timestamp: new Date()
      };
      
      setMensajes(prev => [...prev, mensajeAsistente]);
    } catch (error) {
      console.error('Error al procesar consulta:', error);
      
      // Mensaje de error
      const mensajeError: MensajeChat = {
        id: `error-${Date.now()}`,
        texto: 'Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, inténtalo de nuevo.',
        esUsuario: false,
        timestamp: new Date()
      };
      
      setMensajes(prev => [...prev, mensajeError]);
    } finally {
      setCargando(false);
    }
  };
  
  // Manejar clic en sugerencia
  const handleClickSugerencia = (sugerencia: string) => {
    setConsulta(sugerencia);
  };
  
  // Manejar reconocimiento de voz
  const handleReconocimientoVoz = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setEscuchando(true);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setConsulta(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Error en reconocimiento de voz:', event.error);
      setEscuchando(false);
    };
    
    recognition.onend = () => {
      setEscuchando(false);
    };
    
    recognition.start();
  };
  
  return (
    <div className={`asistente-ia ${className}`}>
      <div className="chat-container" ref={chatContainerRef}>
        {mensajes.map(mensaje => (
          <div 
            key={mensaje.id} 
            className={`mensaje ${mensaje.esUsuario ? 'mensaje-usuario' : 'mensaje-asistente'}`}
          >
            <div className="mensaje-contenido">
              <p>{mensaje.texto}</p>
              
              {/* Visualización si existe */}
              {mensaje.visualizacion && mensaje.datos && (
                <div className="mensaje-visualizacion">
                  <Visualizacion 
                    datos={mensaje.datos} 
                    configuracion={mensaje.visualizacion}
                    altura={300}
                    tema="claro"
                  />
                </div>
              )}
              
              {/* Sugerencias */}
              {!mensaje.esUsuario && mensaje.sugerencias && mensaje.sugerencias.length > 0 && (
                <div className="mensaje-sugerencias">
                  {mensaje.sugerencias.map((sugerencia, index) => (
                    <button 
                      key={index} 
                      className="sugerencia-btn"
                      onClick={() => handleClickSugerencia(sugerencia)}
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mensaje-timestamp">
              {mensaje.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {cargando && (
          <div className="mensaje mensaje-asistente">
            <div className="mensaje-contenido">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="input-container">
        <input 
          type="text" 
          value={consulta} 
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Escribe tu consulta aquí..."
          onKeyPress={(e) => e.key === 'Enter' && handleEnviarConsulta()}
          disabled={cargando}
        />
        <button 
          className={`mic-btn ${escuchando ? 'listening' : ''}`}
          onClick={handleReconocimientoVoz}
          disabled={cargando}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>
        <button 
          className="send-btn"
          onClick={handleEnviarConsulta}
          disabled={!consulta.trim() || cargando}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      
      <style>{`
        .asistente-ia {
          display: flex;
          flex-direction: column;
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
          background-color: #f8f9fa;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .chat-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .mensaje {
          display: flex;
          flex-direction: column;
          max-width: 80%;
          animation: fadeIn 0.3s ease-out;
        }
        
        .mensaje-usuario {
          align-self: flex-end;
        }
        
        .mensaje-asistente {
          align-self: flex-start;
        }
        
        .mensaje-contenido {
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .mensaje-usuario .mensaje-contenido {
          background-color: #0084ff;
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .mensaje-asistente .mensaje-contenido {
          background-color: white;
          color: #333;
          border-bottom-left-radius: 4px;
        }
        
        .mensaje-contenido p {
          margin: 0;
          line-height: 1.5;
        }
        
        .mensaje-timestamp {
          font-size: 0.75rem;
          color: #999;
          margin-top: 4px;
          align-self: flex-end;
        }
        
        .mensaje-usuario .mensaje-timestamp {
          margin-right: 4px;
        }
        
        .mensaje-asistente .mensaje-timestamp {
          margin-left: 4px;
        }
        
        .mensaje-visualizacion {
          margin-top: 16px;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .mensaje-sugerencias {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        
        .sugerencia-btn {
          background-color: #f0f2f5;
          border: none;
          border-radius: 16px;
          padding: 6px 12px;
          font-size: 0.875rem;
          color: #1877f2;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .sugerencia-btn:hover {
          background-color: #e4e6eb;
        }
        
        .input-container {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background-color: white;
          border-top: 1px solid #e0e0e0;
        }
        
        input {
          flex: 1;
          border: none;
          border-radius: 20px;
          padding: 10px 16px;
          background-color: #f0f2f5;
          font-size: 1rem;
          outline: none;
        }
        
        .mic-btn, .send-btn {
          border: none;
          background: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-left: 8px;
          transition: background-color 0.2s;
        }
        
        .mic-btn:hover, .send-btn:hover {
          background-color: #f0f2f5;
        }
        
        .mic-btn svg, .send-btn svg {
          width: 20px;
          height: 20px;
          color: #666;
        }
        
        .mic-btn.listening {
          background-color: #ff3b30;
          animation: pulse 1.5s infinite;
        }
        
        .mic-btn.listening svg {
          color: white;
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 0;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #999;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
          animation: bounce 1.5s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 59, 48, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); }
        }
      `}</style>
    </div>
  );
};

// Declarar tipos para reconocimiento de voz
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default AsistenteIA;
