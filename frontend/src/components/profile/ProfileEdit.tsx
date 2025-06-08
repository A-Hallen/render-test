import React from 'react';
import { Upload, X, Save, User } from 'lucide-react';
import { UserUpdateData } from '../../types/auth';

interface ProfileEditProps {
  formData: UserUpdateData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  toggleEditMode: () => void;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
  handleClearImage: () => void;
  handleImageUpload: () => Promise<void>;
  uploadingImage: boolean;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({
  formData,
  handleChange,
  handleSubmit,
  toggleEditMode,
  loading,
  fileInputRef,
  handleFileChange,
  imagePreview,
  handleClearImage,
  handleImageUpload,
  uploadingImage
}) => {
  return (
    <div className="mt-2">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna izquierda: Imagen de perfil */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-800">Imagen de perfil</h2>
            </div>
            <div className="p-6">
              {imagePreview ? (
                <div>
                  {/* Vista previa de la imagen */}
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 mb-3">
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* Botón para eliminar la imagen seleccionada */}
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Cancelar selección"
                      aria-label="Cancelar selección de imagen"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Botón para subir la imagen */}
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
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
                        Subir imagen
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div 
                  className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer h-48 flex flex-col items-center justify-center" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    Seleccionar imagen
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG (máx. 2MB)
                  </p>
                </div>
              )}
              
              {/* Input oculto para seleccionar archivo */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Columna derecha: Campos de formulario */}
          <div className="md:col-span-2 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-800">Información personal</h2>
            </div>
            <div className="p-6">
            
            {/* Campo de nombre */}
            <div className="mb-6">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName || ''}
                  onChange={handleChange}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="Ingresa tu nombre completo"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Este nombre será visible para todos los usuarios
              </p>
            </div>

            </div>
            
            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={toggleEditMode}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100 transition-all duration-200"
              >
                <X size={16} className="mr-2" />
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-md hover:from-blue-700 hover:to-indigo-700 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
