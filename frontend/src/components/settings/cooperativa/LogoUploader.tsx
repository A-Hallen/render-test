import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

// Definición de la interfaz de props para que el componente sea autocontenido
// En un proyecto real, esto estaría en un archivo 'types.ts' o similar.
interface LogoUploaderProps {
  imagePreview: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onImageUpload: () => void;
  uploadingImage: boolean;
  canEdit: boolean;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  imagePreview,
  onFileChange,
  onClearImage,
  onImageUpload,
  uploadingImage,
  canEdit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-4">
      {imagePreview ? (
        <div>
          {/* Vista previa de la imagen */}
          {/* Reducido de h-56 a h-40 para un tamaño más compacto de logo */}
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 mb-4 shadow transition-all duration-300 ease-in-out group">
            <img 
              src={imagePreview} 
              alt="Logo de la cooperativa" 
              className="w-full h-full object-contain p-2" // Añadido padding para que el logo no toque los bordes
            />
            
            {/* Overlay y Botón para eliminar la imagen seleccionada */}
            {canEdit && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  type="button"
                  onClick={onClearImage}
                  className="bg-white/90 text-red-600 rounded-full p-3 shadow hover:bg-red-100 hover:text-red-700 transition-all duration-300 ease-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                  title="Eliminar selección"
                  aria-label="Eliminar selección de imagen"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
          
          {/* Botón para subir la imagen */}
          {canEdit && (
            <button
              type="button"
              onClick={onImageUpload}
              disabled={uploadingImage}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-base font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
            >
              {uploadingImage ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Subir logo
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed border-indigo-300 rounded-xl p-6 bg-indigo-50 text-center transition-all duration-300 ease-in-out h-40 flex flex-col items-center justify-center 
            ${canEdit ? 'hover:bg-indigo-100 hover:border-indigo-400 cursor-pointer active:scale-98 transform' : ''}`}
          onClick={() => canEdit && fileInputRef.current?.click()}
          role={canEdit ? "button" : "status"} // Accesibilidad: rol de botón si es editable
          tabIndex={canEdit ? 0 : -1} // Accesibilidad: hacer focusable si es editable
          onKeyDown={(e) => { // Accesibilidad: permitir activación con teclado
            if (canEdit && (e.key === 'Enter' || e.key === ' ')) {
              fileInputRef.current?.click();
            }
          }}
        >
          <Upload size={32} className="text-indigo-500 mb-3" />
          <p className="text-base text-indigo-700 font-semibold mb-1">
            {canEdit ? 'Seleccionar logo' : 'No hay logo configurado'}
          </p>
          {canEdit && (
            <p className="text-sm text-indigo-400">
              PNG, JPG (máx. 2MB)
            </p>
          )}
        </div>
      )}
      
      {/* Input oculto para seleccionar archivo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
        disabled={!canEdit}
      />
    </div>
  );
};

// --- Ejemplo de uso del componente ---
// Normalmente, este código estaría en un archivo diferente (e.g., App.js o una página).
// Lo incluimos aquí para que el ejemplo sea autocontenido y ejecutable.

const App: React.FC = () => {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [canEdit] = React.useState(true); // Puedes cambiar esto para probar el modo de solo lectura

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    // Lógica para limpiar el input de tipo archivo si es necesario
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async () => {
    setUploadingImage(true);
    // Simula una subida de imagen
    await new Promise(resolve => setTimeout(resolve, 2000));
    setUploadingImage(false);
    alert("Logo subido con éxito (simulado)!"); // Usar un modal en lugar de alert en producción
  };

  const fileInputRef = useRef<HTMLInputElement>(null); // Definir fileInputRef aquí para el ejemplo

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      {/* Sección para el logo - Contenedor principal */}
      <div className="w-full max-w-md bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow p-6 sm:p-8 border border-gray-200 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
        <h3 className="text-2xl font-extrabold text-gray-800 mb-6 pb-4 border-b-2 border-indigo-300 text-center">
          <span className="text-indigo-600">Logo</span> de la Cooperativa
        </h3>
        
        <LogoUploader
          imagePreview={imagePreview}
          onFileChange={handleFileChange}
          onClearImage={handleClearImage}
          onImageUpload={handleImageUpload}
          uploadingImage={uploadingImage}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
};

export default App;
