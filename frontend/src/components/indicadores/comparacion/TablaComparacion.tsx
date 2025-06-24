import React from 'react';
import { Card } from '../../../components/ui';
import { IndicadorFinanciero, ComparacionData } from './types';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';

interface TablaComparacionProps {
  indicadoresOficina1: IndicadorFinanciero[];
  indicadoresOficina2: IndicadorFinanciero[];
  comparacionData: ComparacionData | null;
}

/**
 * Componente para mostrar una tabla detallada de comparación de indicadores financieros
 * Incluye valores, diferencias y rendimiento para cada indicador
 */
export const TablaComparacion: React.FC<TablaComparacionProps> = ({
  indicadoresOficina1,
  indicadoresOficina2,
  comparacionData
}) => {
  // Función para determinar el ícono de diferencia
  const DiferenciaIcon = ({ diferencia }: { diferencia: number }) => {
    if (diferencia > 0) {
      return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    } else if (diferencia < 0) {
      return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    } else {
      return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Función para obtener el color de fondo según el rendimiento
  const getRendimientoColor = (rendimiento: string) => {
    switch (rendimiento) {
      case "BUENO":
        return "bg-green-100 text-green-800";
      case "ACEPTABLE":
        return "bg-yellow-100 text-yellow-800";
      case "DEFICIENTE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        Tabla Comparativa de Indicadores
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Indicador
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {comparacionData?.nombreOficina1 || "Oficina 1"}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {comparacionData?.nombreOficina2 || "Oficina 2"}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Diferencia
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rendimiento Oficina 1
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rendimiento Oficina 2
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {indicadoresOficina1.map((indicador, index) => {
              const indicadorOficina2 = indicadoresOficina2[index];
              const diferencia = indicador.valor - indicadorOficina2.valor;

              return (
                <tr key={indicador.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {indicador.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                    {indicador.valor.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                    {indicadorOficina2.valor.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <DiferenciaIcon diferencia={diferencia} />
                      <span
                        className={
                          diferencia > 0
                            ? "text-green-600"
                            : diferencia < 0
                            ? "text-red-600"
                            : "text-gray-500"
                        }
                      >
                        {Math.abs(diferencia).toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRendimientoColor(
                        indicador.rendimiento
                      )}`}
                    >
                      {indicador.rendimiento}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRendimientoColor(
                        indicadorOficina2.rendimiento
                      )}`}
                    >
                      {indicadorOficina2.rendimiento}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TablaComparacion;
