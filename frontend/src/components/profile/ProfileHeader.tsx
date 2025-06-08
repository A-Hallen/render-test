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
    <div className="mb-8">
      {/* Encabezado con diseño minimalista */}
      <div className="relative border-b border-gray-100 pb-8">
        {/* Botón de edición */}
        <div className="absolute top-0 right-0">
          <button 
            onClick={toggleEditMode}
            className={`
              flex items-center px-3 py-1.5 rounded-md
              transition-colors
              ${editMode 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
            `}
            title={editMode ? "Cancelar edición" : "Editar perfil"}
            aria-label={editMode ? "Cancelar edición" : "Editar perfil"}
          >
            {editMode ? (
              <>
                <X size={16} className="mr-1.5" />
                <span className="text-sm">Cancelar</span>
              </>
            ) : (
              <>
                <Edit size={16} className="mr-1.5" />
                <span className="text-sm">Editar</span>
              </>
            )}
          </button>
        </div>
        
        {/* Información del usuario con diseño elegante */}
        <div className="flex items-center">
          {/* Avatar del usuario */}
          <div className="relative group mr-6">
            <div className="h-24 w-24 rounded-full bg-white border border-gray-200 overflow-hidden">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt={user?.displayName || 'Vista previa'} 
                  className="h-full w-full object-cover" 
                />
              ) : photoURL ? (
                <img 
                  src={photoURL} 
                  alt={user?.displayName || 'Usuario'} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                  <UserCircle size={48} className="text-gray-400" />
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
                  bg-black bg-opacity-50
                  rounded-full h-full w-full 
                  flex items-center justify-center
                ">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
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
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">{user?.displayName || 'Usuario'}</h1>
            <p className="text-gray-500 mb-2">{user?.email}</p>
            <div className="flex items-center space-x-3">
              {user?.role && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {user.role}
                </span>
              )}
              {user?.createdAt && (
                <span className="text-xs text-gray-500">
                  Miembro desde {new Date(user.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
