'use client';

import React, { useState } from 'react';
import { User, Role } from '@/services/adminServices';

interface UserManagerProps {
  users: User[];
  roles: Role[];
  onCreateUser: (
    nombre: string, 
    apellido: string, 
    correo: string, 
    edad: number, 
    password: string,
    roleIds?: number[]
  ) => Promise<User>;
  onDeleteUser: (userId: number) => Promise<void>;
  onAssignRoles: (userId: number, roleIds: number[]) => Promise<User>;
  onRefresh: () => Promise<void>;
}

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  roles,
  onCreateUser,
  onDeleteUser,
  onAssignRoles,
  onRefresh,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    edad: '',
    password: '',
  });
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para formatear la fecha de registro
  const formatFechaRegistro = (fechaString: any) => {
    if (!fechaString) return 'Fecha no disponible';
    
    try {
      // Si es un string, intentar parsearlo
      const fecha = new Date(fechaString);
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }
      
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      console.warn('Error al formatear fecha:', fechaString, err);
      return 'Fecha no disponible';
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log(' Iniciando creación de usuario:', formData, 'Roles:', selectedRoleIds);
      
      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      await onCreateUser(
        formData.nombre,
        formData.apellido,
        formData.correo,
        parseInt(formData.edad),
        formData.password,
        selectedRoleIds
      );
      
      console.log(' Usuario creado exitosamente');
      setFormData({ nombre: '', apellido: '', correo: '', edad: '', password: '' });
      setSelectedRoleIds([]);
      setShowCreateForm(false);
      setSuccess('Usuario creado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      await onRefresh();
    } catch (err: any) {
      console.error(' Error al crear usuario:', err);
      setError(err.message || 'Error al crear el usuario');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    setLoading(true);
    setError(null);

    try {
      console.log(' Eliminando usuario:', userId);
      await onDeleteUser(userId);
      console.log(' Usuario eliminado exitosamente');
      setSuccess('Usuario eliminado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      await onRefresh();
    } catch (err: any) {
      console.error(' Error al eliminar usuario:', err);
      setError(err.message || 'Error al eliminar el usuario');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles?.map(r => r.id_rol) || []);
    setShowRoleModal(true);
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) {
      setError('No hay usuario seleccionado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(' Asignando roles al usuario:', selectedUser.id_usuario, selectedRoles);
      await onAssignRoles(selectedUser.id_usuario, selectedRoles);
      console.log(' Roles asignados exitosamente');
      setSuccess('Roles asignados exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      setShowRoleModal(false);
      await onRefresh();
    } catch (err: any) {
      console.error(' Error al asignar roles:', err);
      setError(err.message || 'Error al asignar roles');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCreateRole = (roleId: number) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const filteredUsers = users.filter(user =>
    `${user.nombre} ${user.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-600 mt-1">Crea y asigna roles a usuarios</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Crear Usuario</span>
        </button>
      </div>

      {/* Mensajes */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800"> {success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800"> {error}</p>
        </div>
      )}

      {/* Formulario Crear Usuario */}
      {showCreateForm && (
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Nuevo Usuario</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Juan"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder="Pérez"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  placeholder="juan@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                  placeholder="25"
                  min="18"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(mínimo 6 caracteres)</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {/* Selección de Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asignar Roles (opcional)
              </label>
              {roles.length === 0 ? (
                <div className="border border-gray-300 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">
                    No hay roles disponibles. Crea roles primero.
                  </p>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <label 
                        key={role.id_rol} 
                        className={`flex items-start space-x-3 p-2 rounded cursor-pointer transition-colors ${
                          selectedRoleIds.includes(role.id_rol) 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoleIds.includes(role.id_rol)}
                          onChange={() => handleToggleCreateRole(role.id_rol)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          disabled={loading}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800">{role.nombre}</span>
                          <p className="text-xs text-gray-600 truncate">{role.descripcion}</p>
                          {role.permisos && role.permisos.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {role.permisos.slice(0, 3).map((permiso) => (
                                <span 
                                  key={permiso.id_permiso} 
                                  className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded"
                                >
                                  {permiso.nombre}
                                </span>
                              ))}
                              {role.permisos.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{role.permisos.length - 3} más
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {selectedRoleIds.length} rol(es) seleccionado(s)
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Crear Usuario</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedRoleIds([]);
                  setError(null);
                }}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Búsqueda */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {filteredUsers.length} de {users.length} usuarios encontrados
        </p>
      </div>

      {/* Lista de Usuarios */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div 
            key={user.id_usuario} 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {user.nombre} {user.apellido}
                      {user.roles && user.roles.length > 0 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {user.roles.length} rol(es)
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{user.correo}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500">Edad: {user.edad || 'No especificada'} años</p>
                      {user.fecha_registro && (
                        <p className="text-xs text-gray-500">
                          Registrado: {formatFechaRegistro(user.fecha_registro)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Roles del usuario */}
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Roles asignados:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <span
                          key={role.id_rol}
                          className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1"
                        >
                          <span>{role.nombre}</span>
                          {role.permisos && (
                            <span className="text-xs text-purple-600">
                              ({role.permisos.length})
                            </span>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">
                        Sin roles asignados
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => openRoleModal(user)}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  disabled={loading}
                >
                  <span>👤</span>
                  <span>Roles</span>
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id_usuario)}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
                  disabled={loading}
                >
                  <span>🗑️</span>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 text-4xl mb-3">👤</div>
            <p className="text-gray-500">
              {users.length === 0 
                ? 'No hay usuarios disponibles. Crea el primero.' 
                : 'No se encontraron usuarios con ese criterio de búsqueda.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal para asignar/editar roles */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Asignar Roles: {selectedUser.nombre} {selectedUser.apellido}
                </h3>
                <p className="text-gray-600">{selectedUser.correo}</p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Actualmente tiene {selectedRoles.length} rol(es) seleccionado(s)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {roles.map((role) => (
                <label 
                  key={role.id_rol} 
                  className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedRoles.includes(role.id_rol)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id_rol)}
                    onChange={() => handleToggleRole(role.id_rol)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-800">{role.nombre}</div>
                      {role.permisos && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {role.permisos.length} permisos
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{role.descripcion}</div>
                    {role.permisos && role.permisos.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {role.permisos.slice(0, 3).map((permiso) => (
                          <span 
                            key={permiso.id_permiso} 
                            className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded"
                          >
                            {permiso.nombre}
                          </span>
                        ))}
                        {role.permisos.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{role.permisos.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedRoles.length}</span> de{' '}
                <span className="font-medium">{roles.length}</span> roles seleccionados
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRoles}
                  disabled={loading || selectedRoles.length === 0}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    selectedRoles.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};