import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface N8nChatConfigProps {
  onSave?: (config: N8nChatSettings) => void;
}

export interface N8nChatSettings {
  webhookUrl: string;
  mode: 'window' | 'fullscreen';
  showWelcomeScreen: boolean;
  initialMessages: string[];
}

export const N8nChatConfig: React.FC<N8nChatConfigProps> = ({ onSave }) => {
  const [settings, setSettings] = useState<N8nChatSettings>({
    webhookUrl: '',
    mode: 'window',
    showWelcomeScreen: true,
    initialMessages: ['¡Hola! ¿En qué puedo ayudarte hoy?'],
  });

  const [initialMessage, setInitialMessage] = useState(settings.initialMessages[0] || '');

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('n8nChatSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setInitialMessage(parsedSettings.initialMessages[0] || '');
      } catch (error) {
        console.error('Error parsing saved n8n chat settings:', error);
      }
    }
  }, []);

  const handleSave = () => {
    // Update initial messages with the current input value
    const updatedSettings = {
      ...settings,
      initialMessages: [initialMessage]
    };
    
    // Save to localStorage
    localStorage.setItem('n8nChatSettings', JSON.stringify(updatedSettings));
    
    // Call onSave callback if provided
    if (onSave) {
      onSave(updatedSettings);
    }
    
    toast.success('Configuración de chat guardada correctamente');
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de Chat Asistente</h2>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-sm text-blue-800">
            Configure el chat asistente impulsado por n8n para proporcionar ayuda a los usuarios en toda la aplicación.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL del Webhook n8n
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://yourname.app.n8n.cloud/webhook/your-webhook-id"
            value={settings.webhookUrl}
            onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">
            URL del webhook de n8n que procesará las solicitudes del chat. Debe ser la URL completa incluyendo el ID del webhook.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modo de Visualización
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.mode}
            onChange={(e) => setSettings({ ...settings, mode: e.target.value as 'window' | 'fullscreen' })}
          >
            <option value="window">Ventana Flotante</option>
            <option value="fullscreen">Pantalla Completa</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Ventana Flotante muestra un botón que abre el chat. Pantalla Completa integra el chat en el contenedor especificado.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje Inicial
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="¡Hola! ¿En qué puedo ayudarte hoy?"
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Mensaje que se mostrará automáticamente cuando el usuario abra el chat.
          </p>
        </div>

        <div className="mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={settings.showWelcomeScreen}
              onChange={(e) => setSettings({ ...settings, showWelcomeScreen: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-700">
              Mostrar pantalla de bienvenida
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
            onClick={() => {
              if (settings.webhookUrl) {
                window.open(settings.webhookUrl, '_blank');
              } else {
                toast.error('Por favor, ingrese una URL de webhook válida');
              }
            }}
          >
            Probar webhook
          </button>

          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition"
            onClick={handleSave}
          >
            <Save className="mr-2" size={18} />
            <span>Guardar configuración</span>
          </button>
        </div>
      </div>
    </div>
  );
};
