import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types/auth';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit, Plus, X, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { OficinasService, Oficina } from '../../services/OficinasService';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  
  // Nuevo usuario
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: UserRole.USER,
    officeId: ''
  });
  
  const { token, user: currentUser } = useAuth();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        if (!token) {
          throw new Error('No hay token de autenticación');
        }
        console.log("token", token);
        const data = await authService.getAllUsers(token);
        console.log("data", data)
        setUsers(data);
      } catch (error: any) {
        console.error('Error al cargar usuarios:', error);
        if (error.status === 403) {
          setUnauthorized(true);
          setError('No tiene permisos para gestionar usuarios');
        } else {
          setError(error.message || 'No se pudieron cargar los usuarios');
        }
      } finally {
        setLoading(false);
      }
    };
    
    const fetchOficinas = async () => {
      try {
        const oficinas = await OficinasService.obtenerOficinas();
        setOficinas(oficinas);
      } catch (error) {
        console.error('Error al cargar oficinas:', error);
      }
    };
    
    // Verificar si el usuario actual tiene permisos de administrador
    if (!token || currentUser?.role !== UserRole.ADMIN) {
      setUnauthorized(true);
      setError('No tiene permisos para gestionar usuarios');
      setLoading(false);
    } else {
      fetchUsers();
      fetchOficinas();
    }
  }, [token, currentUser]);
  
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validar que se proporcione officeId cuando el rol es GERENTE_OFICINA o ANALISTA
      if ((newUser.role === UserRole.GERENTE_OFICINA || newUser.role === UserRole.ANALISTA) && !newUser.officeId) {
        setError('Se requiere ID de oficina para usuarios con rol de gerente o analista');
        return;
      }
      
      await authService.register(newUser);
      
      // Recargar usuarios
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      const data = await authService.getAllUsers(token);
      setUsers(data);
      
      // Limpiar formulario
      setNewUser({
        email: '',
        password: '',
        displayName: '',
        role: UserRole.USER,
        officeId: ''
      });
      
      setShowAddUser(false);
    } catch (error: any) {
      console.error('Error al añadir usuario:', error);
      setError(error.message || 'Error al añadir usuario');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateUser = async (userId: string, role: UserRole, officeId?: string) => {
    try {
      setLoading(true);
      
      // Validar que se proporcione officeId cuando el rol es GERENTE_OFICINA o ANALISTA
      if ((role === UserRole.GERENTE_OFICINA || role === UserRole.ANALISTA) && !officeId) {
        setError('Se requiere ID de oficina para usuarios con rol de gerente o analista');
        return;
      }
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      const updatedUser = await authService.updateUserRole(token, userId, role, officeId);
      
      // Actualizar usuario en la lista
      setUsers(users.map(user => user.uid === userId ? updatedUser : user));
      
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      setError(error.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      await authService.deleteUser(token, userId);
      
      // Eliminar usuario de la lista
      setUsers(users.filter(user => user.uid !== userId));
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      setError(error.message || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };
  
  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.EDITOR:
        return 'Editor';
      case UserRole.GERENTE_OFICINA:
        return 'Gerente de Oficina';
      case UserRole.GERENTE_GENERAL:
        return 'Gerente General';
      case UserRole.ANALISTA:
        return 'Analista';
      case UserRole.USER:
      default:
        return 'Usuario';
    }
  };
  
  const getOfficeName = (officeId: string) => {
    const oficina = oficinas.find(o => o.codigo === officeId);
    return oficina ? oficina.nombre : 'No asignada';
  };
  
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Gestión de Usuarios</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center gap-2 mb-4">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-auto text-red-700 hover:text-red-900"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {unauthorized ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-6 rounded-md flex flex-col items-center gap-3 mb-4">
          <ShieldAlert className="h-12 w-12 text-yellow-600" />
          <h3 className="text-lg font-medium">Acceso Restringido</h3>
          <p className="text-center">
            La gestión de usuarios está limitada a administradores del sistema. <br />
            Contacte con un administrador si necesita crear o modificar usuarios.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Administre los usuarios del sistema y sus roles
            </p>
            
            <button
              onClick={() => setShowAddUser(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition text-sm"
              disabled={loading}
            >
              <Plus className="mr-1" size={16} />
              <span>Añadir Usuario</span>
            </button>
          </div>
      
      {showAddUser && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3">Nuevo Usuario</h3>
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value={UserRole.USER}>Usuario</option>
                  <option value={UserRole.EDITOR}>Editor</option>
                  <option value={UserRole.ANALISTA}>Analista</option>
                  <option value={UserRole.GERENTE_OFICINA}>Gerente de Oficina</option>
                  <option value={UserRole.GERENTE_GENERAL}>Gerente General</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                </select>
              </div>
            </div>
            
            {(newUser.role === UserRole.GERENTE_OFICINA || newUser.role === UserRole.ANALISTA) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oficina
                </label>
                <select
                  value={newUser.officeId}
                  onChange={(e) => setNewUser({...newUser, officeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar oficina</option>
                  {oficinas.map((oficina) => (
                    <option key={oficina.codigo} value={oficina.codigo}>
                      {oficina.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oficina
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Cargando usuarios...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.uid}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.photoURL ? (
                          <img className="h-10 w-10 rounded-full" src={user.photoURL} alt="" />
                        ) : (
                          <span className="text-gray-500 font-medium">
                            {user.displayName.substring(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.uid === user.uid ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value={UserRole.USER}>Usuario</option>
                        <option value={UserRole.EDITOR}>Editor</option>
                        <option value={UserRole.ANALISTA}>Analista</option>
                        <option value={UserRole.GERENTE_OFICINA}>Gerente de Oficina</option>
                        <option value={UserRole.GERENTE_GENERAL}>Gerente General</option>
                        <option value={UserRole.ADMIN}>Administrador</option>
                      </select>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getRoleName(user.role as UserRole)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.uid === user.uid && (editingUser.role === UserRole.GERENTE_OFICINA || editingUser.role === UserRole.ANALISTA) ? (
                      <select
                        value={editingUser.officeId || ''}
                        onChange={(e) => setEditingUser({...editingUser, officeId: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Seleccionar oficina</option>
                        {oficinas.map((oficina) => (
                          <option key={oficina.codigo} value={oficina.codigo}>
                            {oficina.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {(user.role === UserRole.GERENTE_OFICINA || user.role === UserRole.ANALISTA) 
                          ? getOfficeName(user.officeId || '')
                          : 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.disabled 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.disabled ? 'Inactivo' : 'Activo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingUser?.uid === user.uid ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={() => handleUpdateUser(
                            user.uid, 
                            editingUser.role as UserRole, 
                            editingUser.role === UserRole.GERENTE_OFICINA ? editingUser.officeId : undefined
                          )}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  );
};
