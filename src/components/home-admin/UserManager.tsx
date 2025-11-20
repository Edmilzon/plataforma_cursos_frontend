'use client';

import React, { useState } from 'react';
import { User, Role } from '@/services/adminServices';

interface UserManagerProps {
  users: User[];
  roles: Role[];
  onCreateUser: (nombre: string, apellido: string, correo: string, edad: number, password: string) => Promise<User>;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('📝 Iniciando creación de usuario:', formData);
      await onCreateUser(
        formData.nombre,
        formData.apellido,
        formData.correo,
        parseInt(formData.edad),
        formData.password
      );
      console.log('✅ Usuario creado exitosamente');
      setFormData({ nombre: '', apellido: '', correo: '', edad: '', password: '' });
      setShowCreateForm(false);
      setSuccess('Usuario creado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      await onRefresh();
    } catch (err: any) {
      console.error('❌ Error al crear usuario:', err);
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
      console.log('🗑️ Eliminando usuario:', userId);
      await onDeleteUser(userId);
      console.log('✅ Usuario eliminado exitosamente');
      setSuccess('Usuario eliminado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      await onRefresh();
    } catch (err: any) {
      console.error('❌ Error al eliminar usuario:', err);
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
    if (!selectedUser || selectedRoles.length === 0) {
      setError('Debes seleccionar al menos un rol');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('👤 Asignando roles al usuario:', selectedUser.id_usuario, selectedRoles);
      await onAssignRoles(selectedUser.id_usuario, selectedRoles);
      console.log('✅ Roles asignados exitosamente');
      setSuccess('Roles asignados exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      setShowRoleModal(false);
      await onRefresh();
    } catch (err: any) {
      console.error('❌ Error al asignar roles:', err);
      setError(err.message || 'Error al asignar roles');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
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
          <p className="text-green-800">✅ {success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Formulario Crear Usuario */}
      {showCreateForm && (
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Nuevo Usuario</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Juan"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Pérez"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="juan@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
              <input
                type="number"
                value={formData.edad}
                onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                placeholder="25"
                min="18"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Búsqueda */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de Usuarios */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id_usuario} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {user.nombre} {user.apellido}
                </h3>
                <p className="text-sm text-gray-600">{user.correo}</p>
                <p className="text-xs text-gray-500 mt-1">Edad: {user.edad} años</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <span
                        key={role.id_rol}
                        className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                      >
                        {role.nombre}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">Sin roles asignados</span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openRoleModal(user)}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Roles
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id_usuario)}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">
              {users.length === 0 ? 'No hay usuarios disponibles' : 'No se encontraron usuarios'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Roles */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">
              Asignar Roles: {selectedUser.nombre} {selectedUser.apellido}
            </h3>
            <p className="text-gray-600 mb-4">{selectedUser.correo}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {roles.map((role) => (
                <label key={role.id_rol} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id_rol)}
                    onChange={() => handleToggleRole(role.id_rol)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{role.nombre}</div>
                    <div className="text-xs text-gray-600">{role.descripcion}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedRoles.length} de {roles.length} roles seleccionados
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRoles}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};