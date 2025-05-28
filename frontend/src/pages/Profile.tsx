import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, UserUpdateData } from '../types/auth';
import toast from 'react-hot-toast';
import { 
  UserCircle, 
  Mail, 
  Building, 
  Calendar, 
  Shield, 
  Upload, 
  X, 
  RefreshCw, 
  Edit, 
  Save, 
  Camera
} from 'lucide-react';

const Profile: React.FC = () => {
  // Usar el contexto de autenticación completo para poder actualizarlo
  const auth = useAuth();
  const { user, token } = auth;
  
  // Estados para manejar la UI y los datos
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState<UserUpdateData>({
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || '',
  });

  // Función para manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Función para manejar la selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo seleccionado no es una imagen');
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }
    
    // Crear URL para vista previa
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };
  
  // Función para subir la imagen
  const handleImageUpload = async () => {
    if (!user || !token) return;
    
    const fileInput = fileInputRef.current;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast.error('No se ha seleccionado ninguna imagen');
      return;
    }
    
    setUploadingImage(true);
    const toastId = toast.loading('Subiendo imagen...');
    
    try {
      // Subir imagen al backend, que se encargará de subirla a Firebase Storage
      const result = await authService.uploadProfileImage(token, file);
      
      // Actualizar URL en el formulario
      if (result.imageUrl) {
        setFormData((prev) => ({
          ...prev,
          photoURL: result.imageUrl,
        }));
        
        // Actualizar el usuario en el contexto de autenticación
        if (result.user) {
          // Usar la nueva función updateUserState para actualizar el usuario
          // y forzar la actualización de todos los componentes que lo usan
          auth.updateUserState(result.user);
        }
      }
      
      toast.success('Imagen de perfil actualizada correctamente', { id: toastId });
      // Limpiar la vista previa
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al subir la imagen', { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Nota: Se ha eliminado la función handleDeleteProfileImage
  
  // Función para eliminar la imagen seleccionada
  const handleClearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    const toastId = toast.loading('Actualizando perfil...');

    try {
      // Validar datos
      if (!formData.displayName?.trim()) {
        toast.error('El nombre es obligatorio', { id: toastId });
        setLoading(false);
        return;
      }

      // Enviar solicitud de actualización
      const updatedUser = await authService.updateProfile(token, {
        displayName: formData.displayName,
        photoURL: formData.photoURL,
      });
      
      // Actualizar el usuario en el contexto de autenticación
      if (updatedUser && updatedUser.user) {
        // Usar la nueva función updateUserState para actualizar el usuario
        // y forzar la actualización de todos los componentes que lo usan
        auth.updateUserState(updatedUser.user);
      }
      
      toast.success('Perfil actualizado correctamente', { id: toastId });
      // Desactivar el modo de edición
      setEditMode(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el perfil', { id: toastId });
    } finally {
      setLoading(false);
    }
  };
  
  // Función para activar el modo de edición
  const toggleEditMode = () => {
    // Si estamos saliendo del modo de edición, restauramos los datos originales
    if (editMode) {
      setFormData({
        displayName: user?.displayName || '',
        photoURL: user?.photoURL || '',
      });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    
    setEditMode(!editMode);
  };

  // Formatear fecha de creación
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'No disponible';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Obtener nombre del rol
  const getRoleName = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      case 'user':
        return 'Usuario';
      default:
        return 'Usuario';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Los mensajes de notificación ahora se muestran con toast */}
        
        {/* Tarjeta de perfil */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Encabezado con imagen de perfil */}
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-40 md:h-48">
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={toggleEditMode}
                  className="bg-white text-blue-600 p-2 rounded-full shadow-md hover:bg-blue-50 transition-all"
                  title={editMode ? "Cancelar edición" : "Editar perfil"}
                >
                  {editMode ? <X size={20} /> : <Edit size={20} />}
                </button>
              </div>
            </div>
            
            <div className="absolute left-8 md:left-10 transform -translate-y-1/2" style={{ top: '8rem' }}>
              <div className="relative group">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-white p-1 shadow-lg">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'Usuario'} 
                      className="h-full w-full rounded-full border-2 border-white shadow-md object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center">
                      <UserCircle size={80} className="text-blue-600" />
                    </div>
                  )}
                </div>
                
                {/* Botón de edición de imagen que aparece en modo edición */}
                {editMode && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-50 rounded-full h-full w-full flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Cambiar imagen"
                      >
                        <Camera size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Información del perfil */}
          <div className="pt-16 md:pt-20 pb-6 px-6 md:px-10">
            {/* Modo visualización */}
            {!editMode ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{user?.displayName || 'Usuario'}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  {user?.role && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleName(user.role)}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Mail size={20} className="text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Correo electrónico</p>
                      <p className="text-gray-800">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Shield size={20} className="text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Rol</p>
                      <p className="text-gray-800">{getRoleName(user?.role)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Calendar size={20} className="text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Fecha de registro</p>
                      <p className="text-gray-800">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Building size={20} className="text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Organización</p>
                      <p className="text-gray-800">{user?.organization || 'No especificada'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Recargar datos
                  </button>
                </div>
              </>
            ) : (
              /* Modo edición */
              <form onSubmit={handleSubmit} className="pt-4">
                <div className="mb-6">
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
                
                {/* Campo oculto para la carga de archivos */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {/* Vista previa de imagen */}
                {imagePreview && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vista previa
                    </label>
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Vista previa" 
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      disabled={uploadingImage}
                    >
                      <Upload size={16} className="mr-2" />
                      {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                    </button>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={toggleEditMode}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save size={16} className="mr-2" />
                        Guardar cambios
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
