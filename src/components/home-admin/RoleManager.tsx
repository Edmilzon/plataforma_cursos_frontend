'use client';

import React, { useState } from 'react';
import { Role, Permission } from '@/services/adminServices';

interface RoleManagerProps {
  roles: Role[];
  permissions: Permission[];
  onCreateRole: (nombre: string, descripcion: string, iconoUrl?: string) => Promise<Role>;
  onDeleteRole: (roleId: number) => Promise<void>;
  onAssignPermissions: (roleId: number, permissionIds: number[]) => Promise<Role>;
  onRefresh: () => Promise<void>;
}

export const RoleManager: React.FC<RoleManagerProps> = ({
  roles,
  permissions,
  onCreateRole,
  onDeleteRole,
  onAssignPermissions,
  onRefresh,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('📝 Iniciando creación de rol:', formData);
      await onCreateRole(formData.nombre, formData.descripcion);
      console.log('✅ Rol creado exitosamente');
      setFormData({ nombre: '', descripcion: '' });
      setShowCreateForm(false);
      setSuccess('Rol creado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      await onRefresh();
    } catch (err: any) {
      console.error('❌ Error al crear rol:', err);
      setError(err.message || 'Error al crear el rol');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🗑️ Eliminando rol:', roleId);
      await onDeleteRole(roleId);
      console.log('✅ Rol eliminado exitosamente');
      setSuccess('Rol eliminado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      await onRefresh();
    } catch (err: any) {
      console.error('❌ Error al eliminar rol:', err);
      setError(err.message || 'Error al eliminar el rol');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const openPermissionModal = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permisos?.map(p => p.id_permiso) || []);
    setShowPermissionModal(true);
  };

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📌 Asignando permisos al rol:', selectedRole.id_rol, selectedPermissions);
      await onAssignPermissions(selectedRole.id_rol, selectedPermissions);
      console.log('✅ Permisos asignados exitosamente');
      setSuccess('Permisos asignados exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      setShowPermissionModal(false);
      await onRefresh();
    } catch (err: any) {
      console.error('❌ Error al asignar permisos:', err);
      setError(err.message || 'Error al asignar permisos');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Roles</h2>
          <p className="text-sm text-gray-600 mt-1">Crea, edita y gestiona roles del sistema</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Crear Rol</span>
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

      {/* Formulario Crear Rol */}
      {showCreateForm && (
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Nuevo Rol</h3>
          <form onSubmit={handleCreateRole} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Moderador"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe el propósito de este rol"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Creando...' : 'Crear Rol'}
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

      {/* Lista de Roles */}
      <div className="grid gap-4">
        {roles.map((role) => (
          <div key={role.id_rol} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{role.nombre}</h3>
                <p className="text-sm text-gray-600 mt-1">{role.descripcion}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openPermissionModal(role)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Permisos
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id_rol)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  Eliminar
                </button>
              </div>
            </div>

            {/* Permisos del Rol */}
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Permisos:</p>
              <div className="flex flex-wrap gap-1">
                {role.permisos && role.permisos.length > 0 ? (
                  role.permisos.map((permiso) => (
                    <span
                      key={permiso.id_permiso}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {permiso.nombre}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">Sin permisos asignados</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {roles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No hay roles disponibles</p>
          </div>
        )}
      </div>

      {/* Modal Permisos */}
      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">Permisos: {selectedRole.nombre}</h3>
            <p className="text-gray-600 mb-4">{selectedRole.descripcion}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {permissions.map((permission) => (
                <label key={permission.id_permiso} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id_permiso)}
                    onChange={() => handleTogglePermission(permission.id_permiso)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{permission.nombre}</div>
                    <div className="text-xs text-gray-600">{permission.descripcion}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedPermissions.length} de {permissions.length} permisos seleccionados
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePermissions}
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