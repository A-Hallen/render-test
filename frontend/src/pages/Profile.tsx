import React from 'react';
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

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="bg-white overflow-hidden rounded-lg shadow-md">
        {/* Encabezado con banner y foto de perfil */}
        <ProfileHeader
          user={user}
          photoURL={formData.photoURL}
          editMode={editMode}
          toggleEditMode={toggleEditMode}
          fileInputRef={fileInputRef}
          imagePreview={imagePreview}
        />
        
        {/* Contenido del perfil (vista o edición) */}
        {editMode ? (
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
        ) : (
          <ProfileView
            user={user}
            formatDate={formatDate}
            getRoleName={getRoleName}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
