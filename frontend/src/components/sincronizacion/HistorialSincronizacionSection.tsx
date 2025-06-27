import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { HistorialSincronizacion } from 'shared';

interface HistorialSincronizacionProps {
  historial: HistorialSincronizacion[];
}

const HistorialSincronizacionSection: React.FC<HistorialSincronizacionProps> = ({ historial }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registros</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fallidos</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {historial?.map((log) => (
          <tr key={log.fecha}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.fecha}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {log.status === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.registrosProcesados}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.registrosFallidos}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.duracion}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default HistorialSincronizacionSection;
