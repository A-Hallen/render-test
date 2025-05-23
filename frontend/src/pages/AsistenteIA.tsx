/**
 * Pu00e1gina del Asistente de IA
 * Muestra la interfaz del asistente de IA para consultas en lenguaje natural
 */

import React from 'react';
import AsistenteIA from '../components/asistente/AsistenteIA';

export const AsistenteIAPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 h-full">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Asistente Financiero IA</h1>
      <div className="bg-white rounded-lg shadow-md p-6 h-[calc(100vh-200px)]">
        <AsistenteIA className="h-full" />
      </div>
    </div>
  );
};

export default AsistenteIAPage;
