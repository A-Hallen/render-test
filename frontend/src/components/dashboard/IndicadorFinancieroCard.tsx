import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { KpiCard } from './KpiCard';
import clsx from 'clsx';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';

export interface IndicadorFinancieroData {
  fecha: string;
  monto: number;
  // Comparación con mes anterior
  fechaAnterior?: string;
  montoAnterior?: number;
  variacion?: number;
  variacionPorcentaje?: number;
  descripcionComparacion?: string;
  // Comparación con día anterior
  fechaDiaAnterior?: string;
  montoDiaAnterior?: number;
  variacionDiaria?: number;
  variacionPorcentajeDiaria?: number;
}

export interface IndicadorFinancieroCardProps {
  title: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  indicatorColor?: string; // Color personalizado para la barra indicadora superior
  codigoOficina?: string;
  fetchData: (codigoOficina?: string) => Promise<IndicadorFinancieroData | null>;
  formatCurrency?: (value: number) => string;
}

export const IndicadorFinancieroCard: React.FC<IndicadorFinancieroCardProps> = ({
  title,
  icon,
  color,
  indicatorColor,
  codigoOficina,
  fetchData,
  formatCurrency = (value) => {
    // Usar espacio como separador de miles y coma como separador decimal
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      useGrouping: true,
      currencyDisplay: 'symbol',
    }).format(value).replace(/\./g, ' ');
  }
}) => {
  const [data, setData] = useState<IndicadorFinancieroData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<boolean>(false); // false = comparación mensual, true = comparación diaria
  // Usamos useRef en lugar de useState para evitar renderizaciones adicionales
  const requestIdRef = React.useRef<number>(0);

  useEffect(() => {
    // Establecer loading a true inmediatamente cuando cambian las dependencias
    setLoading(true);
    
    // Incrementar el ID de la solicitud actual para poder rastrearla
    // Usamos useRef para no causar un re-renderizado
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    
    const cargarDatos = async () => {
      try {
        setError(null);
        // Importante: No actualizar el estado data hasta que tengamos los nuevos datos
        const resultado = await fetchData(codigoOficina);
        
        // Verificar si esta es la solicitud más reciente antes de actualizar los datos
        // Esto evita que solicitudes más antiguas sobrescriban datos más recientes
        if (requestId === requestIdRef.current) {
          setData(resultado);
          setLoading(false);
        }
      } catch (err) {
        // Solo mostrar el error si es la solicitud más reciente
        if (requestId === requestIdRef.current) {
          console.error(`Error al cargar datos de ${title}:`, err);
          setError(`No se pudieron cargar los datos de ${title.toLowerCase()}`);
          setLoading(false);
        }
      }
    };

    cargarDatos();
    
    // Función de limpieza para cancelar solicitudes pendientes cuando el componente se desmonta
    return () => {
      // Si hay una solicitud en curso cuando el componente se desmonta o las props cambian,
      // esta línea asegura que no se actualice el estado con datos obsoletos
      requestIdRef.current += 1;
    };
  }, [codigoOficina, fetchData, title]);

  const SkeletonLoader = () => {
    return (
      <motion.div 
        className="bg-white flex-1 min-w-fit max-w-[600px] rounded-lg shadow-sm border border-gray-200 overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
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
      </motion.div>
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
    <MotionConfig reducedMotion="user">
      <motion.div 
        className="bg-white flex-1 min-w-fit max-w-[600px] rounded-lg shadow-sm border border-gray-200 overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        layout>
      {/* Indicador de estado (barra de color en la parte superior) */}
      <motion.div 
        className={clsx(
          'h-1.5 w-full',
          indicatorColor 
            ? indicatorColor
            : (esVariacionPositiva 
                ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500'
                : 'bg-gradient-to-r from-rose-400 via-red-400 to-rose-500')
        )}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      ></motion.div>
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
            <motion.p 
              className="mt-2 text-2xl font-bold tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {formatCurrency(data.monto)}
            </motion.p>
          </div>
          <motion.div 
            className={clsx(
              'p-2.5 rounded-full shadow-sm',
              `bg-${color}-50 text-${color}-500 border border-${color}-100`
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            whileHover={{ rotate: 10, scale: 1.05 }}
          >
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
          </motion.div>
        </div>
        
        {/* Indicador de variación */}
        <motion.div 
          className="mt-2 flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <motion.div 
            className={clsx(
              'flex items-center justify-center rounded-md px-2 py-1',
              esVariacionPositiva 
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 border border-emerald-100' 
                : 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 border border-rose-100'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ y: esVariacionPositiva ? [-1, 1, -1] : [1, -1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              {esVariacionPositiva ? (
                <ArrowUpRight size={14} className="mr-1" />
              ) : (
                <ArrowDownRight size={14} className="mr-1" />
              )}
            </motion.div>
            <span className="text-xs font-medium">{porcentajeFormateado}%</span>
          </motion.div>
          <span className="text-xs text-gray-500 ml-2">vs período anterior</span>
        </motion.div>
      </div>
      
      {/* Detalles de la comparación en un formato más elegante */}
      {data.montoAnterior && (
        <div className="border-t border-gray-100 bg-gray-50 bg-opacity-50">
          {/* Pestañas para seleccionar tipo de comparación */}
          <div className="flex border-b border-gray-100 relative">
            <motion.button 
              className={`flex-1 py-2 px-3 text-xs font-medium ${!activeTab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab(false)}
              whileHover={!activeTab ? {} : { backgroundColor: "rgba(243, 244, 246, 0.8)" }}
              whileTap={{ scale: 0.98 }}
            >
              Comparación Mensual
            </motion.button>
            <motion.button 
              className={`flex-1 py-2 px-3 text-xs font-medium ${activeTab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab(true)}
              whileHover={activeTab ? {} : { backgroundColor: "rgba(243, 244, 246, 0.8)" }}
              whileTap={{ scale: 0.98 }}
            >
              Comparación Diaria
            </motion.button>
            <motion.div 
              className="absolute bottom-0 h-0.5 bg-blue-500"
              initial={false}
              animate={{
                left: activeTab ? "50%" : "0%",
                right: activeTab ? "0%" : "50%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
          
          {/* Contenido de la pestaña activa */}
          <AnimatePresence mode="wait">
            {!activeTab ? (
            // Comparación mensual (original)
            <motion.div
              key="monthly"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
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
                    <span className="text-xs text-gray-500">Variación mensual</span>
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
            </motion.div>
          ) : (
            // Comparación diaria (nueva)
            <motion.div
              key="daily"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="p-3">
                  <div className="text-xs text-gray-500 mb-1">Día más reciente</div>
                  <div className="font-medium text-blue-600">{data.fecha ? data.fecha : 'N/A'}</div>
                  <div className="text-sm font-semibold mt-1">{formatCurrency(data.monto)}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-gray-500 mb-1">Día anterior</div>
                  <div className="font-medium text-gray-600">{data.fechaDiaAnterior ? data.fechaDiaAnterior : 'N/A'}</div>
                  <div className="text-sm font-semibold mt-1">{data.montoDiaAnterior ? formatCurrency(data.montoDiaAnterior) : 'No disponible'}</div>
                </div>
              </div>
              <div className="border-t border-gray-100 p-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500">Variación diaria</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold mr-2">
                      {data.variacionDiaria !== undefined ? formatCurrency(data.variacionDiaria) : 'N/A'}
                    </span>
                    {data.variacionPorcentajeDiaria !== undefined && (
                      <div className={`flex items-center justify-center rounded-md px-2 py-0.5 ${(data.variacionDiaria || 0) >= 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {(data.variacionDiaria || 0) >= 0 ? (
                          <ArrowUpRight size={12} className="mr-1" />
                        ) : (
                          <ArrowDownRight size={12} className="mr-1" />
                        )}
                        <span className="text-xs font-medium">
                          {data.variacionPorcentajeDiaria !== undefined ? Math.abs(parseFloat(data.variacionPorcentajeDiaria.toFixed(2))).toFixed(2) : '0.00'}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
    </MotionConfig>
  );
};
