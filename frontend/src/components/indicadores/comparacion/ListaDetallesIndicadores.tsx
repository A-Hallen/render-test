import React from 'react';
import { IndicadorFinanciero, ComparacionData } from './types';
import DetalleIndicador from './DetalleIndicador';

interface ListaDetallesIndicadoresProps {
  indicadoresOficina1: IndicadorFinanciero[];
  indicadoresOficina2: IndicadorFinanciero[];
  comparacionData: ComparacionData | null;
}

/**
 * Componente para mostrar la lista de detalles de todos los indicadores financieros
 */
export const ListaDetallesIndicadores: React.FC<ListaDetallesIndicadoresProps> = ({
  indicadoresOficina1,
  indicadoresOficina2,
  comparacionData
}) => {
  // Verificar si hay datos para mostrar
  if (!comparacionData || indicadoresOficina1.length === 0 || indicadoresOficina2.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h3 className="text-lg font-medium text-indigo-700 mb-6 border-b border-gray-100 pb-3">
        Detalles de los Indicadores
      </h3>
      
      <div>
        {indicadoresOficina1.map((indicador, index) => (
          <DetalleIndicador
            key={indicador.id}
            indicadorOficina1={indicador}
            indicadorOficina2={indicadoresOficina2[index]}
            nombreOficina1={comparacionData.nombreOficina1}
            nombreOficina2={comparacionData.nombreOficina2}
          />
        ))}
      </div>
      
      {indicadoresOficina1.length === 0 && (
        <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-md">
          No hay detalles disponibles para los indicadores.
        </p>
      )}
    </div>
  );
};

export default ListaDetallesIndicadores;
