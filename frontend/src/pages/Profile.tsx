import React, { useState, useEffect } from 'react';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileView } from '../components/profile/ProfileView';
import { useProfileState } from '../hooks/useProfileState';
import { ProfileEdit } from '../components/profile/ProfileEdit';

/**
 * Componente de perfil de usuario
 * 
 * Este componente muestra y permite editar la información del perfil del usuario.
 * Sigue el principio de responsabilidad única dividiendo la funcionalidad en:
 * - useProfileState: maneja toda la lógica de estado y operaciones
 * - ProfileHeader: muestra el encabezado con la foto de perfil
 * - ProfileView: muestra la información del perfil en modo visualización
 * - ProfileEdit: muestra el formulario para editar el perfil
 */
const Profile: React.FC = () => {
  // Usar el hook personalizado para manejar todo el estado y la lógica
  const {
    user,
    editMode,
    imagePreview,
    fileInputRef,
    formData,
    loading,
    uploadingImage,
    handleChange,
    handleFileChange,
    handleImageUpload,
    handleClearImage,
    handleSubmit,
    toggleEditMode,
    formatDate,
    getRoleName
  } = useProfileState();
  
  // Estado para controlar las animaciones
  const [isVisible, setIsVisible] = useState(true);
  const [currentView, setCurrentView] = useState<'edit' | 'view'>(editMode ? 'edit' : 'view');
  
  // Efecto para manejar las transiciones cuando cambia el modo de edición
  useEffect(() => {
    if (editMode !== (currentView === 'edit')) {
      // Primero ocultamos la vista actual
      setIsVisible(false);
      
      // Después de un breve retraso, cambiamos la vista y la mostramos
      const timer = setTimeout(() => {
        setCurrentView(editMode ? 'edit' : 'view');
        setIsVisible(true);
      }, 300); // 300ms para la transición de salida
      
      return () => clearTimeout(timer);
    }
  }, [editMode, currentView]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Encabezado con foto de perfil */}
      <ProfileHeader
        user={user}
        photoURL={formData.photoURL}
        editMode={editMode}
        toggleEditMode={toggleEditMode}
        fileInputRef={fileInputRef}
        imagePreview={imagePreview}
      />
      
      {/* Contenido del perfil con animación */}
      <div className="relative min-h-[400px]">
        {/* Vista de edición */}
        <div 
          className={`absolute w-full transition-all duration-300 ease-in-out ${currentView === 'edit' ? '' : 'hidden'} 
                     ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}
        >
          {currentView === 'edit' && (
            <ProfileEdit
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              toggleEditMode={toggleEditMode}
              loading={loading}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              imagePreview={imagePreview}
              handleClearImage={handleClearImage}
              handleImageUpload={handleImageUpload}
              uploadingImage={uploadingImage}
            />
          )}
        </div>
        
        {/* Vista de visualización */}
        <div 
          className={`absolute w-full transition-all duration-300 ease-in-out ${currentView === 'view' ? '' : 'hidden'}
                     ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}
        >
          {currentView === 'view' && (
            <ProfileView
              user={user}
              formatDate={formatDate}
              getRoleName={getRoleName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
