import React, { useState } from 'react';
import { Clock, CalendarDays, BellRing, Settings, Save } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Interface for the component props, updated to handle periodicity unit
interface ConfiguracionSincronizacionProps {
  periodicidad: { value: number; unit: 'horas' | 'dias' };
  setPeriodicidad: (value: { value: number; unit: 'horas' | 'dias' }) => void;
  horaProgramada: string;
  setHoraProgramada: (value: string) => void;
  activarSincAuto: boolean;
  setActivarSincAuto: (value: boolean) => void;
  handleSaveConfig: () => void;
}

export const ConfiguracionSincronizacion: React.FC<ConfiguracionSincronizacionProps> = ({
  periodicidad,
  setPeriodicidad,
  horaProgramada,
  setHoraProgramada,
  activarSincAuto,
  setActivarSincAuto,
  handleSaveConfig,
}) => {
  // State to manage which periodicity unit is currently selected (hours or days)
  const [periodicidadUnit, setPeriodicidadUnit] = useState<'horas' | 'dias'>(periodicidad.unit);

  // Options for periodicity in hours
  const horasOptions = [
    { value: 1, label: '1 hora' },
    { value: 2, label: '2 horas' },
    { value: 4, label: '4 horas' },
    { value: 8, label: '8 horas' },
    { value: 12, label: '12 horas' },
    { value: 24, label: '24 horas' },
  ];

  // Options for periodicity in days
  const diasOptions = [
    { value: 1, label: 'Cada día' },
    { value: 2, label: 'Cada 2 días' },
    { value: 3, label: 'Cada 3 días' },
    { value: 7, label: 'Cada semana' },
    { value: 14, label: 'Cada 2 semanas' },
    { value: 30, label: 'Cada mes' },
  ];

  // Handler for changing the periodicity value based on the selected unit
  const handlePeriodicidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriodicidad({ value: Number(e.target.value), unit: periodicidadUnit });
  };

  // Handler for changing the periodicity unit (hours/days)
  const handleUnitChange = (unit: 'horas' | 'dias') => {
    setPeriodicidadUnit(unit);
    // When changing unit, reset the value to a default for the new unit type
    if (unit === 'horas') {
      setPeriodicidad({ value: 1, unit: 'horas' });
    } else {
      setPeriodicidad({ value: 1, unit: 'dias' });
    }
  };

  // Variants for framer-motion animations
  // Changed ease from string to cubic bezier array for type compatibility
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    // Removed min-h-screen and flex-col for better embedding
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Reduced padding, removed max-w-xl mx-auto for smaller context */}
      <div className="space-y-6"> {/* Reduced border radius and padding */}
        {/* Automatic Synchronization Toggle */}
        <motion.div className="flex items-center justify-between" variants={itemVariants}>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200"> {/* Smaller font size */}
              Sincronización automática
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"> {/* Smaller font size */}
              Activar para programar sincronizaciones recurrentes.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={activarSincAuto}
              onChange={(e) => setActivarSincAuto(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 peer-checked:bg-indigo-600"></div> {/* Smaller toggle size */}
          </label>
        </motion.div>

        {/* Conditional synchronization settings based on toggle */}
        <AnimatePresence>
          {activarSincAuto && (
            <motion.div
              className="space-y-4" // Reduced space-y
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
            >
              {/* Periodicity Unit Selector */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> {/* Reduced mb */}
                  Seleccionar periodicidad por:
                </label>
                <div className="grid grid-cols-2 gap-2 p-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner"> {/* Reduced gap and padding */}
                  <motion.button
                    type="button"
                    onClick={() => handleUnitChange('horas')}
                    className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 ease-in-out text-sm ${ // Smaller padding and font size
                      periodicidadUnit === 'horas'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-transparent text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Clock className="h-4 w-4 mr-1" /> Horas
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => handleUnitChange('dias')}
                    className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 ease-in-out text-sm ${ // Smaller padding and font size
                      periodicidadUnit === 'dias'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-transparent text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CalendarDays className="h-4 w-4 mr-1" /> Días
                  </motion.button>
                </div>
              </motion.div>

              {/* Periodicity and Scheduled Time Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Reduced gap */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> {/* Reduced mb */}
                    Periodicidad ({periodicidadUnit === 'horas' ? 'horas' : 'días'})
                  </label>
                  <div className="relative">
                    <select
                      value={periodicidad.value}
                      onChange={handlePeriodicidadChange}
                      className="block w-full pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:text-gray-100 transition-all duration-200" // Smaller padding and font size
                    >
                      {periodicidadUnit === 'horas'
                        ? horasOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))
                        : diasOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                    </select>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> {/* Reduced mb */}
                    Hora Programada
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={horaProgramada}
                      onChange={(e) => setHoraProgramada(e.target.value)}
                      className="block w-full pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:text-gray-100 transition-all duration-200 appearance-none" // Smaller padding and font size
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications Toggle (retains original functionality) */}
        <motion.div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700" variants={itemVariants}> {/* Reduced pt */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notificaciones</h3> {/* Smaller font size */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"> {/* Smaller font size */}
              Recibir alertas sobre el estado de la sincronización.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              defaultChecked // Assuming this is a static setting for now as per original code
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 peer-checked:bg-indigo-600"></div> {/* Smaller toggle size */}
          </label>
        </motion.div>

        {/* Save Button */}
        <button
          onClick={handleSaveConfig}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-300 ease-in-out hover:scale-[1.01] active:scale-95" // Smaller padding, font size, shadow, and rounded corners
        >
          <Save className="h-5 w-5 mr-2" />
          Guardar Configuración
        </button>
      </div>
    </motion.div>
  );
};
