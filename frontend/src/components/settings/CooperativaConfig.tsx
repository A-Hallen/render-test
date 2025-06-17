import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { CooperativaDTO, FormatoFecha, Idioma, ZonaHoraria } from 'shared/src/types/cooperativa.types';
import toast from 'react-hot-toast';
import { obtenerCooperativa, actualizarCooperativa, subirLogoCooperativa } from '../../services/cooperativa.service';

export const CooperativaConfig: React.FC = () => {
  const { actualizarDatosCooperativa, cargarDatosCooperativa, canEditCooperativa } = useData();
  const [formData, setFormData] = useState<Partial<CooperativaDTO> | null>(null);
  const [originalData, setOriginalData] = useState<CooperativaDTO | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para manejar la subida del logo
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Usar el permiso de edición del contexto
  const canEdit = canEditCooperativa;

  // Cargar datos directamente del backend al montar el componente
  useEffect(() => {
    const fetchCooperativa = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Llamada directa al backend
        const cooperativaData = await obtenerCooperativa();
        
        if (cooperativaData) {
          setFormData({
            nombre: cooperativaData.nombre || '',
            ruc: cooperativaData.ruc || '',
            direccion: cooperativaData.direccion || '',
            telefono: cooperativaData.telefono || '',
            email: cooperativaData.email || '',
            zonaHoraria: cooperativaData.zonaHoraria || '',
            formatoFecha: cooperativaData.formatoFecha || '',
            idioma: cooperativaData.idioma || '',
            logo: cooperativaData.logo || '',
          });
          
          // Si hay un logo, mostrar la vista previa
          if (cooperativaData.logo) {
            setImagePreview(cooperativaData.logo);
          }
          
          // Asegurarse de que originalData es un objeto completo de tipo CooperativaDTO
          // Verificamos que tenga todas las propiedades requeridas
          if (cooperativaData.id) {
            setOriginalData({
              id: cooperativaData.id,
              nombre: cooperativaData.nombre || '',
              ruc: cooperativaData.ruc || '',
              direccion: cooperativaData.direccion || '',
              telefono: cooperativaData.telefono || '',
              email: cooperativaData.email || '',
              zonaHoraria: cooperativaData.zonaHoraria || '',
              formatoFecha: cooperativaData.formatoFecha || '',
              idioma: cooperativaData.idioma || '',
              createdAt: cooperativaData.createdAt || Date.now(),
              updatedAt: cooperativaData.updatedAt || Date.now(),
              logo: cooperativaData.logo
            });
          }
        }
        
        // Actualizar también el contexto global
        await cargarDatosCooperativa();
      } catch (err: any) {
        console.error('Error al cargar datos de la cooperativa:', err);
        setError(err.message || 'Error al cargar datos de la cooperativa');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCooperativa();
  }, [cargarDatosCooperativa]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  // Manejar la selección de archivos para el logo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo seleccionado no es una imagen');
      return;
    }
    
    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 2MB');
      return;
    }
    
    // Crear URL para vista previa
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };
  
  // Función para eliminar la imagen seleccionada
  const handleClearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Función para subir el logo
  const handleImageUpload = async () => {
    if (!canEdit) return;
    
    const fileInput = fileInputRef.current;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast.error('No se ha seleccionado ninguna imagen');
      return;
    }
    
    setUploadingImage(true);
    const toastId = toast.loading('Subiendo logo...');
    
    try {
      // Subir imagen al backend
      const result = await subirLogoCooperativa(file);
      
      // Actualizar URL en el formulario y en los datos originales
      if (result.imageUrl) {
        setFormData(prev => prev ? { ...prev, logo: result.imageUrl } : null);
        
        if (originalData) {
          setOriginalData({
            ...originalData,
            logo: result.imageUrl
          });
        }
        
        // Actualizar también el contexto global
        await cargarDatosCooperativa();
      }
      
      toast.success('Logo actualizado correctamente', { id: toastId });
      
      // Mantener la vista previa con la URL real
      setImagePreview(result.imageUrl);
    } catch (err: any) {
      console.error('Error al subir el logo:', err);
      toast.error(err.message || 'Error al subir el logo', { id: toastId });
    } finally {
      setUploadingImage(false);
      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
        
        // Asegurarse de que tenemos el ID para la actualización
        if (!originalData?.id) {
          throw new Error('No se puede actualizar la cooperativa sin un ID');
        }
        
        // Llamada directa al backend
        const datosActualizados = {
          ...formData,
          id: originalData.id
        };
        
        await actualizarCooperativa(datosActualizados);
        
        // Actualizar también el contexto global para que se refleje en toda la aplicación
        await actualizarDatosCooperativa(datosActualizados);
        
        // Actualizar los datos originales después de guardar exitosamente
        if (originalData) {
          setOriginalData({
            ...originalData,
            ...formData
          });
        }
        
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
        {/* Sección para el logo */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Logo de la Cooperativa</h3>
          
          <div className="mb-4">
            {imagePreview ? (
              <div>
                {/* Vista previa de la imagen */}
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 mb-3">
                  <img 
                    src={imagePreview} 
                    alt="Logo de la cooperativa" 
                    className="w-full h-full object-contain" 
                  />
                  
                  {/* Botón para eliminar la imagen seleccionada */}
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Eliminar selección"
                    aria-label="Eliminar selección de imagen"
                    disabled={!canEdit}
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {/* Botón para subir la imagen */}
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploadingImage || !canEdit}
                  className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-700 border-t-transparent mr-1.5"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload size={14} className="mr-1.5" />
                      Subir logo
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div 
                className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer h-48 flex flex-col items-center justify-center" 
                onClick={() => canEdit && fileInputRef.current?.click()}
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium mb-1">
                  {canEdit ? 'Seleccionar logo' : 'No hay logo configurado'}
                </p>
                {canEdit && (
                  <p className="text-xs text-gray-400">
                    PNG, JPG (máx. 2MB)
                  </p>
                )}
              </div>
            )}
            
            {/* Input oculto para seleccionar archivo */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
              disabled={!canEdit}
            />
          </div>
        </div>
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
