import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ReporteTendenciaResponse } from "shared/src/types/reportes.types";
import { ExportToExcelButton } from "./components/ExportToExcelButton";

interface ReporteContabilidadProps {
  reporteData: ReporteTendenciaResponse['data'];
  onClose: () => void;
}

export const ReporteContabilidad: React.FC<ReporteContabilidadProps> = ({ reporteData, onClose }) => {
  // Función auxiliar para normalizar un valor numérico
  const normalizeNumericValue = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    
    if (typeof value === 'string') {
      // Limpiar la cadena para dejar solo el primer número válido
      // Esto maneja casos como "06712973.950.009621571.4013465504.89"
      const cleanedStr = value.replace(/[^\d.-]/g, '');
      const firstNumber = cleanedStr.match(/^-?\d+(\.\d+)?/);
      if (firstNumber) {
        const parsed = parseFloat(firstNumber[0]);
        return isNaN(parsed) ? 0 : parsed;
      }
    }
    
    return 0; // Valor predeterminado si no se puede convertir
  };
  
  // Normalizar los datos del reporte
  const normalizedReporteData = reporteData ? {
    ...reporteData,
    categorias: reporteData.categorias.map(categoria => ({
      ...categoria,
      valores: Object.entries(categoria.valores).reduce<Record<string, number>>((acc, [fecha, valor]) => {
        acc[fecha] = normalizeNumericValue(valor);
        return acc;
      }, {}),
      cuentas: categoria.cuentas.map(cuenta => ({
        ...cuenta,
        valores: Object.entries(cuenta.valores).reduce<Record<string, number>>((acc, [fecha, valor]) => {
          acc[fecha] = normalizeNumericValue(valor);
          return acc;
        }, {})
      }))
    }))
  } : null;
  
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});

  if (!normalizedReporteData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reporte de Contabilidad</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No hay datos disponibles para mostrar</p>
        </div>
      </div>
    );
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const formatCurrency = (value: number | null | undefined) => {
    // Manejar valores nulos, indefinidos o NaN
    if (value === null || value === undefined || isNaN(value)) {
      return '$0.00';
    }
    
    // Formatear el número con punto decimal y luego reemplazar las comas por espacios
    const formattedNumber = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    
    // Reemplazar las comas por espacios para mejorar la legibilidad
    return formattedNumber.replace(/,/g, ' ');
  };

  const formatPercentage = (value: number | null | undefined) => {
    // Manejar valores nulos, indefinidos o NaN
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00%';
    }
    return `${value > 0 ? '▲' : value < 0 ? '▼' : ''}${Math.abs(value).toFixed(2)}%`;
  };

  const getPercentageColor = (value: number | null | undefined) => {
    // Manejar valores nulos, indefinidos o NaN
    if (value === null || value === undefined || isNaN(value)) {
      return 'text-gray-600';
    }
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // La funcionalidad de exportación a Excel ha sido movida al componente ExportToExcelButton

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Reporte de Contabilidad - {normalizedReporteData.oficina}</h2>
        <div className="flex space-x-2">
          <ExportToExcelButton reporteData={normalizedReporteData} />
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cuenta / Categoría
              </th>
              {normalizedReporteData.fechas?.map((fecha) => {
                // Create date with timezone handling to prevent off-by-one errors
                const dateObj = new Date(fecha);
                // Add timezone offset to ensure correct date display
                const adjustedDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
                return (
                  <th key={fecha} scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </th>
                );
              })}
              {normalizedReporteData.fechas?.length > 1 && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-200">
                  Var. Total
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {normalizedReporteData.categorias.map((categoria) => (
              <React.Fragment key={categoria.nombre}>
                <tr className="bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => toggleCategory(categoria.nombre)}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center">
                    {expandedCategories[categoria.nombre] ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
                    {categoria.nombre}
                  </td>
                  {normalizedReporteData.fechas.map((fecha, index) => {
                    const currentValue = categoria.valores[fecha] || 0;
                    const prevValue = index > 0 ? (categoria.valores[normalizedReporteData.fechas[index - 1]] || 0) : 0;
                    
                    // Evitar división por cero y valores NaN
                    const monthlyVariation = index > 0 && prevValue !== 0 ? ((currentValue - prevValue) / Math.abs(prevValue) * 100) : 0;
                    const difference = currentValue - prevValue;
                    
                    return (
                      <td key={fecha} className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                        {formatCurrency(currentValue)}
                        {index > 0 && (
                          <div className="mt-1">
                            <div className="text-xs text-gray-500">
                              {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                            </div>
                            <div className={`text-xs ${getPercentageColor(monthlyVariation)}`}>
                              {formatPercentage(monthlyVariation)}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {normalizedReporteData.fechas.length > 1 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right bg-gray-200">
                      <div>
                        {(() => {
                          const firstValue = categoria.valores[normalizedReporteData.fechas[0]] || 0;
                          const lastValue = categoria.valores[normalizedReporteData.fechas[normalizedReporteData.fechas.length - 1]] || 0;
                          
                          const totalDifference = lastValue - firstValue;
                          
                          // Evitar división por cero y valores NaN
                          const totalVariation = firstValue !== 0 ? (totalDifference / Math.abs(firstValue) * 100) : 0;
                          
                          return (
                            <>
                              <div className="text-xs text-gray-500">
                                {totalDifference > 0 ? '+' : ''}{formatCurrency(totalDifference)}
                              </div>
                              <div className={`text-xs ${getPercentageColor(totalVariation)}`}>
                                {formatPercentage(totalVariation)}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  )}
                </tr>
                {expandedCategories[categoria.nombre] && categoria.cuentas.map((cuenta) => (
                  <tr key={cuenta.codigo} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap pl-12 text-sm text-gray-700">
                      {cuenta.codigo} - {cuenta.nombre}
                    </td>
                    {normalizedReporteData.fechas.map((fecha, index) => {
                      const currentValue = cuenta.valores[fecha] || 0;
                      const prevValue = index > 0 ? (cuenta.valores[normalizedReporteData.fechas[index - 1]] || 0) : 0;
                      // Evitar división por cero y valores NaN
                      const monthlyVariation = index > 0 && prevValue !== 0 ? ((currentValue - prevValue) / Math.abs(prevValue) * 100) : 0;
                      const difference = currentValue - prevValue;
                      
                      // Usar el valor normalizado
                      
                      return (
                        <td key={fecha} className="px-6 py-3 whitespace-nowrap text-right text-sm text-gray-700">
                          {formatCurrency(currentValue)}
                          {index > 0 && (
                            <div className="mt-1">
                              <div className="text-xs text-gray-500">
                                {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                              </div>
                              <div className={`text-xs ${getPercentageColor(monthlyVariation)}`}>
                                {formatPercentage(monthlyVariation)}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    {normalizedReporteData.fechas.length > 1 && (
                      <td className="px-6 py-3 whitespace-nowrap text-right text-sm bg-gray-200">
                        <div>
                          {(() => {
                            const firstValue = cuenta.valores[normalizedReporteData.fechas[0]] || 0;
                            const lastValue = cuenta.valores[normalizedReporteData.fechas[normalizedReporteData.fechas.length - 1]] || 0;
                            const totalDifference = lastValue - firstValue;
                            // Evitar división por cero y valores NaN
                            const totalVariation = firstValue !== 0 ? (totalDifference / Math.abs(firstValue) * 100) : 0;
                            
                            return (
                              <>
                                <div className="text-xs text-gray-500">
                                  {totalDifference > 0 ? '+' : ''}{formatCurrency(totalDifference)}
                                </div>
                                <div className={`text-xs ${getPercentageColor(totalVariation)}`}>
                                  {formatPercentage(totalVariation)}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
