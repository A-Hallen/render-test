import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { UserUpdateData } from '../types/auth';
import toast from 'react-hot-toast';

export const useProfileState = () => {
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
      const result = await authService.uploadProfileImage(file);
      
      // Actualizar URL en el formulario
      if (result.imageUrl) {
        setFormData((prev) => ({
          ...prev,
          photoURL: result.imageUrl,
        }));
        
        // Actualizar el usuario en el contexto de autenticación
        if (result.user) {
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
      const updatedUser = await authService.updateProfile({
        displayName: formData.displayName,
        photoURL: formData.photoURL,
      });
      
      // Actualizar el usuario en el contexto de autenticación
      if (updatedUser) {
        // La respuesta del backend es directamente el objeto de usuario actualizado
        console.log('Usuario actualizado recibido:', updatedUser);
        
        // Usar la nueva función updateUserState para actualizar el usuario
        // y forzar la actualización de todos los componentes que lo usan
        auth.updateUserState(updatedUser);
        
        // También actualizar el estado local del formulario
        setFormData({
          displayName: updatedUser.displayName || '',
          photoURL: updatedUser.photoURL || '',
        });
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

  return {
    user,
    token,
    loading,
    uploadingImage,
    imagePreview,
    editMode,
    fileInputRef,
    formData,
    handleChange,
    handleFileChange,
    handleImageUpload,
    handleClearImage,
    handleSubmit,
    toggleEditMode,
    formatDate,
    getRoleName
  };
};
