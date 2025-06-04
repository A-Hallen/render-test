import React, { useEffect, useState } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';
import './n8nChatStyles.css'; // Importamos nuestros estilos personalizados después de los estilos originales
import toast from 'react-hot-toast';

// Import the settings interface
import { N8nChatSettings } from '../settings/N8nChatConfig';

const N8nChatWidget: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only initialize once
    if (isInitialized) return;

    // Delay initialization to ensure DOM is fully loaded
    const initTimeout = setTimeout(() => {
      initializeChat();
    }, 1000);

    return () => clearTimeout(initTimeout);
  }, [isInitialized]);

  const initializeChat = () => {
    try {
      // For testing purposes, create a default configuration if none exists
      let savedSettings: N8nChatSettings;
      const savedSettingsStr = localStorage.getItem('n8nChatSettings');
      
      if (!savedSettingsStr) {
        savedSettings = {
          webhookUrl: 'https://example.com/webhook/test',  // This is a placeholder
          mode: 'window',
          showWelcomeScreen: true,
          initialMessages: ['¡Hola! ¿En qué puedo ayudarte hoy?']
        };
        // Save default settings to localStorage
        localStorage.setItem('n8nChatSettings', JSON.stringify(savedSettings));
        
        // Show a toast notification to inform the user
        toast.success('Chat configurado con valores por defecto. Por favor, configura la URL del webhook en Configuración > Integraciones.');
      } else {
        savedSettings = JSON.parse(savedSettingsStr);
      }
      
      // Personalizamos los textos en español para el chat
      const customText = {
        welcomeHeading: '¡Hola! 👋',
        welcomeSubheading: 'Inicia una conversación. Estamos aquí para ayudarte con tus consultas financieras.',
        welcomeButtonText: 'Iniciar chat',
        inputPlaceholder: 'Escribe tu mensaje...',
        sendButtonText: 'Enviar',
        headerTitle: 'Asistente FinCoop',
        headerSubtitle: 'Tu asesor financiero virtual',
      };

      // Modificamos el DOM después de crear el chat para cambiar los textos
      const updateChatTexts = () => {
        // Esperar a que los elementos del chat estén disponibles en el DOM
        setTimeout(() => {
          // Texto de bienvenida
          const welcomeHeading = document.querySelector('.n8n-chat-welcome-heading');
          const welcomeSubheading = document.querySelector('.n8n-chat-welcome-subheading');
          const welcomeButton = document.querySelector('.n8n-chat-welcome-button');
          
          // Texto del input y botón de envío
          const inputPlaceholder = document.querySelector('.n8n-chat-input');
          const sendButton = document.querySelector('.n8n-chat-send-button');
          
          // Texto del encabezado
          const headerTitle = document.querySelector('.n8n-chat-header-title');
          const headerSubtitle = document.querySelector('.n8n-chat-header-subtitle');
          
          // Aplicar los cambios si los elementos existen
          if (welcomeHeading) welcomeHeading.textContent = customText.welcomeHeading;
          if (welcomeSubheading) welcomeSubheading.textContent = customText.welcomeSubheading;
          if (welcomeButton) welcomeButton.textContent = customText.welcomeButtonText;
          if (inputPlaceholder) inputPlaceholder.setAttribute('placeholder', customText.inputPlaceholder);
          if (sendButton) sendButton.textContent = customText.sendButtonText;
          if (headerTitle) headerTitle.textContent = customText.headerTitle;
          if (headerSubtitle) headerSubtitle.textContent = customText.headerSubtitle;
        }, 500); // Esperar 500ms para asegurar que los elementos estén en el DOM
      };

      // Create chat with settings
      createChat({
        webhookUrl: savedSettings.webhookUrl,
        mode: savedSettings.mode || 'window',
        showWelcomeScreen: savedSettings.showWelcomeScreen,
        initialMessages: savedSettings.initialMessages,
        // Personalización adicional
        chatSessionKey: 'sessionId',
        chatInputKey: 'chatInput',
        defaultLanguage: 'en', // Solo se admite 'en' en la versión actual
        // We don't need to specify target for window mode
        // The chat will create its own container
        webhookConfig: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      });
      
      // Actualizar los textos después de crear el chat
      updateChatTexts();
      
      // También actualizar los textos cuando se abra el chat
      document.addEventListener('n8n-chat-opened', updateChatTexts);

      // Add custom event listener for empty responses
      const handleEmptyResponse = () => {
        toast.error('El servidor de chat devolvió una respuesta vacía. Verifica la configuración del webhook.');
      };
      
      window.addEventListener('n8n-chat-empty-response', handleEmptyResponse);
      
      setIsInitialized(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error initializing n8n chat:', error);
      toast.error('Error al inicializar el chat: ' + errorMessage);
    }
  };

  // Creamos un div para mostrar información de depuración si es necesario
  return (
    <>
      {/* El chat se renderizará automáticamente */}
      <div id="n8n-chat-debug" style={{ display: 'none' }}></div>
    </>
  );
};

export default N8nChatWidget;
