import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { IndicadorFinanciero } from './types';

interface DetalleIndicadorProps {
  indicadorOficina1: IndicadorFinanciero;
  indicadorOficina2: IndicadorFinanciero;
  nombreOficina1: string;
  nombreOficina2: string;
}

/**
 * Componente para mostrar el detalle de los componentes de un indicador financiero
 * Incluye información sobre numerador y denominador para ambas oficinas
 */
export const DetalleIndicador: React.FC<DetalleIndicadorProps> = ({
  indicadorOficina1,
  indicadorOficina2,
  nombreOficina1,
  nombreOficina2
}) => {
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // Calcular la altura del contenido cuando cambia mostrarDetalle
  useEffect(() => {
    if (mostrarDetalle && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    } else {
      setContentHeight(0);
    }
  }, [mostrarDetalle]);

  // Verificar si hay componentes disponibles para mostrar
  const tieneComponentes = 
    indicadorOficina1.componentes && 
    indicadorOficina2.componentes &&
    (Object.keys(indicadorOficina1.componentes.detalle.numerador).length > 0 ||
     Object.keys(indicadorOficina1.componentes.detalle.denominador).length > 0);

  if (!tieneComponentes) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 mb-4 hover:shadow-sm">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer bg-white transition-colors hover:bg-gray-50"
        onClick={() => setMostrarDetalle(!mostrarDetalle)}
      >
        <h4 className="text-md font-medium text-indigo-700">
          {indicadorOficina1.nombre}
        </h4>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {mostrarDetalle ? 'Ocultar detalles' : 'Ver detalles'}
          </span>
          <div className={`transform transition-transform duration-300 ${mostrarDetalle ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-5 w-5 text-indigo-500" />
          </div>
        </div>
      </div>

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${mostrarDetalle ? 'border-t border-gray-200' : ''}`}
        style={{ maxHeight: contentHeight }}
      >
        <div ref={contentRef} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Oficina 1 */}
            <div className="bg-gray-50 rounded-md p-4 border border-gray-100 shadow-sm">
              <h5 className="font-medium text-indigo-700 mb-2">{nombreOficina1}</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Numerador:</p>
                  <p className="text-md font-medium">
                    {indicadorOficina1.componentes?.numerador.toFixed(2)}
                  </p>
                  {Object.keys(indicadorOficina1.componentes?.detalle.numerador || {}).length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Componentes:</p>
                      {Object.entries(indicadorOficina1.componentes?.detalle.numerador || {}).map(([key, value]) => (
                        <div key={key} className="text-xs flex justify-between">
                          <span>{key}:</span>
                          <span className="font-medium">{value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Denominador:</p>
                  <p className="text-md font-medium">
                    {indicadorOficina1.componentes?.denominador.toFixed(2)}
                  </p>
                  {Object.keys(indicadorOficina1.componentes?.detalle.denominador || {}).length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Componentes:</p>
                      {Object.entries(indicadorOficina1.componentes?.detalle.denominador || {}).map(([key, value]) => (
                        <div key={key} className="text-xs flex justify-between">
                          <span>{key}:</span>
                          <span className="font-medium">{value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Oficina 2 */}
            <div className="bg-gray-50 rounded-md p-4 border border-gray-100 shadow-sm">
              <h5 className="font-medium text-indigo-700 mb-2">{nombreOficina2}</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Numerador:</p>
                  <p className="text-md font-medium">
                    {indicadorOficina2.componentes?.numerador.toFixed(2)}
                  </p>
                  {Object.keys(indicadorOficina2.componentes?.detalle.numerador || {}).length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Componentes:</p>
                      {Object.entries(indicadorOficina2.componentes?.detalle.numerador || {}).map(([key, value]) => (
                        <div key={key} className="text-xs flex justify-between">
                          <span>{key}:</span>
                          <span className="font-medium">{value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Denominador:</p>
                  <p className="text-md font-medium">
                    {indicadorOficina2.componentes?.denominador.toFixed(2)}
                  </p>
                  {Object.keys(indicadorOficina2.componentes?.detalle.denominador || {}).length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Componentes:</p>
                      {Object.entries(indicadorOficina2.componentes?.detalle.denominador || {}).map(([key, value]) => (
                        <div key={key} className="text-xs flex justify-between">
                          <span>{key}:</span>
                          <span className="font-medium">{value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 italic mt-2">
            Valor del indicador = (Numerador / Denominador) * 100%
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleIndicador;
