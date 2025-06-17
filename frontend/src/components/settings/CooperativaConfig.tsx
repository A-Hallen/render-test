import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { CooperativaDTO, FormatoFecha, Idioma, ZonaHoraria } from 'shared/src/types/cooperativa.types';
import toast from 'react-hot-toast';

export const CooperativaConfig: React.FC = () => {
  const { cooperativa, actualizarDatosCooperativa, cooperativaLoading: loading, cooperativaError: error, canEditCooperativa } = useData();
  const [formData, setFormData] = useState<Partial<CooperativaDTO> | null>(null);
  const [originalData, setOriginalData] = useState<CooperativaDTO | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Usar el permiso de edición del contexto
  const canEdit = canEditCooperativa;

  // Inicializar el formulario con los datos de la cooperativa cuando estén disponibles
  useEffect(() => {
    if (cooperativa) {
      setFormData({
        nombre: cooperativa.nombre,
        ruc: cooperativa.ruc,
        direccion: cooperativa.direccion,
        telefono: cooperativa.telefono,
        email: cooperativa.email,
        zonaHoraria: cooperativa.zonaHoraria,
        formatoFecha: cooperativa.formatoFecha,
        idioma: cooperativa.idioma,
      })
      setOriginalData({ ...cooperativa });
    }
  }, [cooperativa]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Guardar los cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !canEdit) return;
    
    // Función para comparar objetos y verificar si hay cambios
    const hasChanges = () => {
      if (!originalData || !formData) return false;
      
      // Comparar cada propiedad relevante
      return (
        originalData.nombre !== formData.nombre ||
        originalData.ruc !== formData.ruc ||
        originalData.direccion !== formData.direccion ||
        originalData.telefono !== formData.telefono ||
        originalData.email !== formData.email ||
        originalData.zonaHoraria !== formData.zonaHoraria ||
        originalData.formatoFecha !== formData.formatoFecha ||
        originalData.idioma !== formData.idioma
      );
    };
    
    // Verificar si realmente hay cambios para evitar llamadas innecesarias
    if (!hasChanges()) {
      toast.success('No hay cambios que guardar');
      return;
    }
    
    const promise = async () => {
      try {
        setIsSaving(true);
        await actualizarDatosCooperativa(formData);
        // Actualizar los datos originales después de guardar exitosamente
        setOriginalData({ ...formData });
        return 'Información actualizada correctamente';
      } catch (err: any) {
        console.error('Error al actualizar la cooperativa:', err);
        throw new Error(err.message || 'Error al actualizar la información de la cooperativa');
      } finally {
        setIsSaving(false);
      }
    };
    
    await toast.promise(promise(), {
      loading: 'Guardando cambios...',
      success: 'Información de la cooperativa actualizada correctamente',
      error: (err) => `${err instanceof Error ? err.message : 'Error al actualizar la información de la cooperativa'}`
    });
  };

  if (loading || !formData) {
    return <div className="p-4">Cargando información de la cooperativa...</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de la Cooperativa</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Cooperativa
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!canEdit}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona Horaria
            </label>
            <select
              name="zonaHoraria"
              value={formData.zonaHoraria || ZonaHoraria.GUAYAQUIL}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            >
              <option value={Idioma.ESPANOL}>Español (Ecuador)</option>
              <option value={Idioma.INGLES}>English (United States)</option>
            </select>
          </div>
        </div>

        {canEdit && (
          <div className="mt-8">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition disabled:bg-blue-300"
              disabled={isSaving}
            >
              <Save className="mr-2" size={18} />
              <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        )}
        
        {!canEdit && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
            Solo los administradores pueden modificar la información de la cooperativa.
          </div>
        )}
      </form>
    </div>
  );
};
