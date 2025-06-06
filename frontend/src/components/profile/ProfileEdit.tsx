import React from 'react';
import { Upload, X, Save, User, Image } from 'lucide-react';
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
    <div className="px-6 py-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna izquierda: Imagen de perfil */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Image size={16} className="mr-2 text-blue-600" />
              Imagen de perfil
            </label>

            {imagePreview ? (
              <div>
                {/* Vista previa de la imagen */}
                <div className="relative w-full h-40 rounded overflow-hidden border border-gray-200 mb-2">
                  <img 
                    src={imagePreview} 
                    alt="Vista previa" 
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Botón para eliminar la imagen seleccionada */}
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Cancelar selección"
                    aria-label="Cancelar selección de imagen"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                {/* Botón para subir la imagen */}
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1.5"></div>
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
                className="border border-dashed border-gray-300 rounded p-3 bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer h-40 flex flex-col items-center justify-center" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} className="text-gray-400 mb-1" />
                <p className="text-xs text-gray-600 font-medium mb-1">
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

          {/* Columna derecha: Campos de formulario */}
          <div className="md:col-span-2">
            {/* Campo de nombre */}
            <div className="mb-4">
              <label htmlFor="displayName" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <User size={16} className="mr-2 text-blue-600" />
                Nombre completo
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa tu nombre completo"
              />
              <p className="mt-1 text-xs text-gray-500">
                Este nombre será visible para todos los usuarios
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={toggleEditMode}
                className="flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
              >
                <X size={14} className="mr-1.5" />
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1.5"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={14} className="mr-1.5" />
                    Guardar
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
