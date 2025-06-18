import React from 'react';
import { CooperativaFormProps } from './types';
import { FormatoFecha, Idioma, ZonaHoraria } from 'shared/src/types/cooperativa.types';

export const CooperativaForm: React.FC<CooperativaFormProps> = ({
  formData,
  onChange,
  canEdit
}) => {
  if (!formData) return null;

  return (
    <div className="space-y-6 flex flex-wrap gap-4">
      <div className="bg-white min-w-[400px] rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Información Principal</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Cooperativa
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre || ''}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              disabled={!canEdit}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RUC
            </label>
            <input
              type="text"
              name="ruc"
              value={formData.ruc || ''}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              disabled={!canEdit}
              placeholder="Ingrese el RUC de la cooperativa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion || ''}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Información de Contacto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              disabled={!canEdit}
              placeholder="Ej: +593 99 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Configuración Regional</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona Horaria
            </label>
            <select
              name="zonaHoraria"
              value={formData.zonaHoraria || ZonaHoraria.GUAYAQUIL}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              disabled={!canEdit}
            >
              <option value={ZonaHoraria.GUAYAQUIL}>America/Guayaquil (GMT-5)</option>
              <option value={ZonaHoraria.QUITO}>America/Quito (GMT-5)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formato de Fecha
            </label>
            <select
              name="formatoFecha"
              value={formData.formatoFecha || FormatoFecha.DDMMYYYY}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              disabled={!canEdit}
            >
              <option value={FormatoFecha.DDMMYYYY}>DD/MM/YYYY</option>
              <option value={FormatoFecha.MMDDYYYY}>MM/DD/YYYY</option>
              <option value={FormatoFecha.YYYYMMDD}>YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Idioma
            </label>
            <select
              name="idioma"
              value={formData.idioma || Idioma.ESPANOL}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              disabled={!canEdit}
            >
              <option value={Idioma.ESPANOL}>Español (Ecuador)</option>
              <option value={Idioma.INGLES}>English (United States)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
