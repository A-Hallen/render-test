import React, { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';
import { motion, MotionConfig } from 'framer-motion';
import { DashboardData } from 'shared';
import { formatDateToShortMonth } from '../../../utils/dateFormatter';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface IndicadorFinancieroCardProps {
  title: string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  indicatorColor?: string; // Color personalizado para la barra indicadora superior
  data: DashboardData;
  formatCurrency?: (value: number) => string;
}

export const IndicadorFinancieroCard: React.FC<IndicadorFinancieroCardProps> = ({
  title,
  icon,
  color,
  indicatorColor,
  data,
  formatCurrency: customFormatCurrency
}) => {
  const currencyFormatter = customFormatCurrency || formatCurrency;

  const esVariacionMensualPositiva = (data.variacion || 0) >= 0;
  const esVariacionDiariaPositiva = (data.variacionDiaria || 0) >= 0;
  
  const porcentajeMensualFormateado = formatPercentage(data.variacionPorcentaje);
  const porcentajeDiarioFormateado = formatPercentage(data.variacionPorcentajeDiaria);

  const currentFormattedDate = formatDateToShortMonth(data.fecha);
  const previousMonthFormattedDate = formatDateToShortMonth(data.fechaAnterior);
  const previousDayFormattedDate = formatDateToShortMonth(data.fechaDiaAnterior);

  return (
    <MotionConfig reducedMotion="user">
          <motion.div 
            className="bg-white flex-1 min-w-[295px] max-w-[295px] rounded-lg shadow-sm border border-gray-200 overflow-hidden relative flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            layout
          >
            {/* Indicador de estado (barra de color en la parte superior) */}
            <motion.div 
              className={clsx(
                'h-1.5 w-full',
                indicatorColor 
                  ? indicatorColor
                  : (esVariacionMensualPositiva 
                      ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500'
                      : 'bg-gradient-to-r from-rose-400 via-red-400 to-rose-500')
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            ></motion.div>
            
            {/* Encabezado del card */}
            <div className="p-4 flex-grow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-grow">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                    <span className="inline-flex items-center align-middle">
                      {React.cloneElement(icon as React.ReactElement, { size: 14, className: "text-gray-400" })}
                    </span>
                  </div>
                  <motion.p 
                    className="mt-1 text-2xl font-bold tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    {currencyFormatter(data.monto)}
                  </motion.p>
                  {/* Increased font size for the current date */}
                  <span className="text-sm font-medium text-gray-600">{currentFormattedDate}</span>
                </div>
                <motion.div 
                  className={clsx(
                    'p-2 rounded-full shadow-sm',
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
              
              {/* Variaciones en un layout más compacto */}
              <div className="space-y-3">
                {data.montoAnterior !== undefined && (
                  <motion.div 
                    className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <span className="text-xs text-gray-600 font-semibold mb-1">
                      Comparación mensual:
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-800">
                        {currencyFormatter(data.montoAnterior)}
                      </span>
                      <div className={clsx(
                          'flex items-center justify-center rounded-md px-2 py-0.5',
                          esVariacionMensualPositiva 
                            ? 'bg-green-50 text-green-600 border border-green-100' 
                            : 'bg-red-50 text-red-600 border border-red-100'
                        )}>
                        <motion.div
                          animate={{ y: esVariacionMensualPositiva ? [-1, 1, -1] : [1, -1, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                          {esVariacionMensualPositiva ? (
                            <ArrowUpRight size={12} className="mr-1" />
                          ) : (
                            <ArrowDownRight size={12} className="mr-1" />
                          )}
                        </motion.div>
                        <span className="text-xs font-medium">{porcentajeMensualFormateado}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                        ({currentFormattedDate} vs. {previousMonthFormattedDate})
                    </span>
                  </motion.div>
                )}
    
                {data.montoDiaAnterior !== undefined && (
                  <motion.div 
                    className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <span className="text-xs text-gray-600 font-semibold mb-1">
                      Comparación diaria:
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-800">
                        {currencyFormatter(data.montoDiaAnterior)}
                      </span>
                      <div className={clsx(
                          'flex items-center justify-center rounded-md px-2 py-0.5',
                          esVariacionDiariaPositiva 
                            ? 'bg-green-50 text-green-600 border border-green-100' 
                            : 'bg-red-50 text-red-600 border border-red-100'
                        )}>
                        <motion.div
                          animate={{ y: esVariacionDiariaPositiva ? [-1, 1, -1] : [1, -1, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                          {esVariacionDiariaPositiva ? (
                            <ArrowUpRight size={12} className="mr-1" />
                          ) : (
                            <ArrowDownRight size={12} className="mr-1" />
                          )}
                        </motion.div>
                        <span className="text-xs font-medium">{porcentajeDiarioFormateado}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                        ({currentFormattedDate} vs. {previousDayFormattedDate})
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </MotionConfig>
  );
};
