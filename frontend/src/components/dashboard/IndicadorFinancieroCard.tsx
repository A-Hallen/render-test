import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { KpiCard } from './KpiCard';
import clsx from 'clsx';

export interface IndicadorFinancieroData {
  fecha: string;
  monto: number;
  fechaAnterior?: string;
  montoAnterior?: number;
  variacion?: number;
  variacionPorcentaje?: number;
  descripcionComparacion?: string;
}

export interface IndicadorFinancieroCardProps {
  title: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  codigoOficina?: string;
  fetchData: (codigoOficina?: string) => Promise<IndicadorFinancieroData | null>;
  formatCurrency?: (value: number) => string;
}

export const IndicadorFinancieroCard: React.FC<IndicadorFinancieroCardProps> = ({
  title,
  icon,
  color,
  codigoOficina,
  fetchData,
  formatCurrency = (value) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(value)
}) => {
  const [data, setData] = useState<IndicadorFinancieroData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        const resultado = await fetchData(codigoOficina);
        setData(resultado);
      } catch (err) {
        console.error(`Error al cargar datos de ${title}:`, err);
        setError(`No se pudieron cargar los datos de ${title.toLowerCase()}`);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [codigoOficina, fetchData, title]);

  // Función para generar el skeleton loader con la misma estructura y dimensiones que el componente cargado
  const SkeletonLoader = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 relative">
        {/* Barra superior con animación de pulso */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
        
        {/* Encabezado del card */}
        <div className="p-5 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              {/* Título y icono */}
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
              </div>
              {/* Monto principal */}
              <div className="mt-2 h-8 w-40 bg-gray-300 rounded animate-pulse"></div>
              {/* Indicador de variación */}
              <div className="mt-2 flex items-center">
                <div className="h-7 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="ml-2 h-4 w-28 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
            {/* Icono circular */}
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
        
        {/* Sección inferior con detalles de comparación */}
        <div className="border-t border-gray-100 bg-gray-50 bg-opacity-50">
          {/* Grid de periodos */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-3">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-5 w-16 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-5 w-28 bg-gray-300 rounded animate-pulse mt-1"></div>
            </div>
            <div className="p-3">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-5 w-16 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-5 w-28 bg-gray-300 rounded animate-pulse mt-1"></div>
            </div>
          </div>
          {/* Sección de variación */}
          <div className="border-t border-gray-100 p-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <div className="h-5 w-20 bg-gray-300 rounded animate-pulse mr-2"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error || !data) {
    return (
      <KpiCard
        title={title}
        value="No disponible"
        change={0}
        icon={icon}
        color={color}
        description={error || `No se pudieron cargar los datos de ${title.toLowerCase()}`}
      />
    );
  }

  // Formatear el porcentaje con solo 2 decimales para mejor legibilidad
  const porcentajeFormateado = data.variacionPorcentaje !== undefined
    ? Math.abs(parseFloat(data.variacionPorcentaje.toFixed(2)))
    : 0;

  // Extraer los nombres de los meses para mostrarlos
  const mesActual = data.descripcionComparacion?.split(' vs ')[0] || '';
  const mesAnterior = data.descripcionComparacion?.split(' vs ')[1] || '';
  
  // Determinar si la variación es positiva o negativa
  const esVariacionPositiva = (data.variacion || 0) >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md relative">
      {/* Indicador de estado (barra de color en la parte superior) */}
      <div className={clsx(
        'h-1.5 w-full',
        esVariacionPositiva 
          ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500'
          : 'bg-gradient-to-r from-rose-400 via-red-400 to-rose-500'
      )}></div>
      
      {/* Encabezado del card */}
      <div className="p-5 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <span className="inline-flex items-center align-middle">
                {React.cloneElement(icon as React.ReactElement, { size: 14, className: "text-gray-400" })}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{formatCurrency(data.monto)}</p>
          </div>
          <div className={clsx(
            'p-2.5 rounded-full shadow-sm',
            `bg-${color}-50 text-${color}-500 border border-${color}-100`
          )}>
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
          </div>
        </div>
        
        {/* Indicador de variación */}
        <div className="mt-2 flex items-center">
          <div className={clsx(
            'flex items-center justify-center rounded-md px-2 py-1',
            esVariacionPositiva 
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 border border-emerald-100' 
              : 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 border border-rose-100'
          )}>
            {esVariacionPositiva ? (
              <ArrowUpRight size={14} className="mr-1" />
            ) : (
              <ArrowDownRight size={14} className="mr-1" />
            )}
            <span className="text-xs font-medium">{porcentajeFormateado}%</span>
          </div>
          <span className="text-xs text-gray-500 ml-2">vs período anterior</span>
        </div>
      </div>
      
      {/* Detalles de la comparación en un formato más elegante */}
      {data.montoAnterior && (
        <div className="border-t border-gray-100 bg-gray-50 bg-opacity-50">
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1">Periodo más reciente</div>
              <div className="font-medium text-blue-600">{mesActual}</div>
              <div className="text-sm font-semibold mt-1">{formatCurrency(data.monto)}</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1">Periodo anterior</div>
              <div className="font-medium text-gray-600">{mesAnterior}</div>
              <div className="text-sm font-semibold mt-1">{formatCurrency(data.montoAnterior)}</div>
            </div>
          </div>
          <div className="border-t border-gray-100 p-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-500">Variación</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-semibold mr-2">
                  {formatCurrency(data.variacion || 0)}
                </span>
                <div className={`flex items-center justify-center rounded-md px-2 py-0.5 ${esVariacionPositiva ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {esVariacionPositiva ? (
                    <ArrowUpRight size={12} className="mr-1" />
                  ) : (
                    <ArrowDownRight size={12} className="mr-1" />
                  )}
                  <span className="text-xs font-medium">
                    {Math.abs(porcentajeFormateado).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
