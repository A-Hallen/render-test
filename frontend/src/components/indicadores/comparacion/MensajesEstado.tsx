import React from 'react';
import { Card, Spinner } from '../../../components/ui';
import { AlertCircle, Info } from 'lucide-react';

interface MensajesEstadoProps {
  cargando: boolean;
  error: string | null;
  sinDatos: boolean;
}

/**
 * Componente para mostrar mensajes de estado (carga, error, sin datos)
 * en la comparación de indicadores financieros
 */
export const MensajesEstado: React.FC<MensajesEstadoProps> = ({
  cargando,
  error,
  sinDatos
}) => {
  if (cargando) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center space-y-4">
        <Spinner size="lg" />
        <p className="text-gray-600">Cargando datos de indicadores...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border border-red-200">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (sinDatos) {
    return (
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <div className="flex items-center space-x-3">
          <Info className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-medium text-blue-800">Sin datos</h3>
            <p className="text-blue-700">
              Seleccione dos oficinas diferentes y una fecha para comparar los indicadores financieros.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default MensajesEstado;
