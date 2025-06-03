import React from 'react';
import { Modal } from '../ui/Modal';

interface DetalleComponente {
  numerador: number;
  denominador: number;
  detalle: {
    numerador: Record<string, number>;
    denominador: Record<string, number>;
  };
}

interface DetalleIndicadorProps {
  isOpen: boolean;
  onClose: () => void;
  indicador: {
    id: string;
    nombre: string;
    valor: number;
    rendimiento: string;
    color: string;
    componentes?: DetalleComponente;
  } | null;
}

export const DetalleIndicador: React.FC<DetalleIndicadorProps> = ({
  isOpen,
  onClose,
  indicador
}) => {
  if (!indicador) return null;

  const formatearNumero = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Cálculo: ${indicador.nombre}`}
      size="lg"
    >
      <div className="space-y-6 overflow-y-auto">
        {/* Resumen del indicador */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-800">{indicador.nombre}</h4>
              <p className="text-sm text-gray-500 mt-1">
                Valor calculado para el período seleccionado
              </p>
            </div>
            <div className="flex items-center">
              <div 
                className="text-2xl font-bold px-4 py-2 rounded-full" 
                style={{ backgroundColor: `${indicador.color}20`, color: indicador.color }}
              >
                {indicador.valor.toFixed(2)}%
              </div>
              <div className="ml-3 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                <span className="text-xs font-medium text-gray-700">{indicador.rendimiento}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles del cálculo */}
        {indicador.componentes ? (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detalle del numerador */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="font-medium text-blue-800">Detalle del Numerador</h5>
                </div>
                <div className="p-4">
                  {indicador.componentes.detalle.numerador && 
                   Object.keys(indicador.componentes.detalle.numerador).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(indicador.componentes.detalle.numerador).map(([cuenta, valor], idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{cuenta}</span>
                          <span className="text-sm">{formatearNumero(valor)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay detalles disponibles</p>
                  )}
                </div>
              </div>
              
              {/* Detalle del denominador */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="font-medium text-blue-800">Detalle del Denominador</h5>
                </div>
                <div className="p-4">
                  {indicador.componentes.detalle.denominador && 
                   Object.keys(indicador.componentes.detalle.denominador).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(indicador.componentes.detalle.denominador).map(([cuenta, valor], idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{cuenta}</span>
                          <span className="text-sm">{formatearNumero(valor)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay detalles disponibles</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 mt-4">
            <p className="text-gray-500">No hay detalles de cálculo disponibles para este indicador.</p>
          </div>
        )}
        
        {/* Interpretación */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Interpretación</h4>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              {indicador.rendimiento === 'BUENO' && 
                'Este indicador muestra un rendimiento óptimo, lo que refleja una situación financiera favorable en este aspecto.'}
              {indicador.rendimiento === 'ACEPTABLE' && 
                'Este indicador muestra un rendimiento aceptable, pero hay oportunidades de mejora en este aspecto financiero.'}
              {indicador.rendimiento === 'DEFICIENTE' && 
                'Este indicador muestra un rendimiento por debajo de lo esperado, lo que sugiere la necesidad de atención en este aspecto financiero.'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
