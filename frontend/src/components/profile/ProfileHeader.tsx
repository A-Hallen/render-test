import React from 'react';
import { UserCircle, Camera, X, Edit } from 'lucide-react';
import { User } from '../../types/auth';

interface ProfileHeaderProps {
  user: User | null;
  photoURL: string | undefined;
  editMode: boolean;
  toggleEditMode: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  imagePreview: string | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  photoURL,
  editMode,
  toggleEditMode,
  fileInputRef,
  imagePreview
}) => {
  return (
    <div className="relative">
      {/* Banner de fondo con gradiente más compacto */}
      <div className="relative h-32 md:h-40 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
        {/* Patrón decorativo sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white opacity-20"></div>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white opacity-15"></div>
        </div>
        
        {/* Botón de edición */}
        <div className="absolute top-3 right-3 z-10">
          <button 
            onClick={toggleEditMode}
            className={`
              flex items-center justify-center
              w-9 h-9 rounded-full shadow-md
              transition-all duration-200
              ${editMode 
                ? 'bg-white text-red-500 hover:bg-red-50' 
                : 'bg-white text-blue-600 hover:bg-blue-50'}
            `}
            title={editMode ? "Cancelar edición" : "Editar perfil"}
            aria-label={editMode ? "Cancelar edición" : "Editar perfil"}
          >
            {editMode ? <X size={16} /> : <Edit size={16} />}
          </button>
        </div>
      </div>
      
      {/* Avatar del usuario con diseño más compacto */}
      <div className="flex items-center px-6 py-3">
        <div className="relative group mr-4">
          <div className="
            h-20 w-20 
            rounded-full bg-white 
            shadow-md ring-2 ring-white
            -mt-10
          ">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt={user?.displayName || 'Vista previa'} 
                className="h-full w-full rounded-full object-cover" 
              />
            ) : photoURL ? (
              <img 
                src={photoURL} 
                alt={user?.displayName || 'Usuario'} 
                className="h-full w-full rounded-full object-cover" 
              />
            ) : (
              <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <UserCircle size={50} className="text-blue-600" />
              </div>
            )}
          </div>
          
          {/* Botón de edición de imagen */}
          {editMode && (
            <div className="
              absolute inset-0 
              flex items-center justify-center 
              opacity-0 group-hover:opacity-100 
              transition-all duration-200
            ">
              <div className="
                bg-black bg-opacity-60
                rounded-full h-full w-full 
                flex items-center justify-center
              ">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="
                    p-2 bg-blue-600 text-white 
                    rounded-full
                    hover:bg-blue-700
                    transition-colors
                  "
                  title="Cambiar imagen"
                  aria-label="Cambiar imagen de perfil"
                >
                  <Camera size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Información básica del usuario */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user?.displayName || 'Usuario'}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          {user?.role && (
            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user.role}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
