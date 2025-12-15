'use client';

import { useEffect, useState } from 'react';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';
import { RoleManager } from '@/components/home-admin/RoleManager';
import { UserManager } from '@/components/home-admin/UserManager';
import { PermissionMatrix } from '@/components/home-admin/PermissionMatrix';
import { adminService } from '@/services/adminServices';
import type { Role, Permission, User } from '@/services/adminServices';

type TabType = 'roles' | 'usuarios' | 'matriz';

export default function PermissionsAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(' Cargando datos de administración...');

      const [rolesData, permissionsData, usersData] = await Promise.all([
        adminService.getRoles(),
        adminService.getPermissions(),
        adminService.getAllUsers(),
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData);
      setUsers(usersData);

      console.log(' Todos los datos cargados correctamente');
    } catch (err: any) {
      console.error(' Error cargando datos:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto mt-24 px-4 pb-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del administrador...</p>
          </div>
        </div>
        <BottomNavbar />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto mt-24 px-4 pb-20 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Administración del Sistema</h1>
          <p className="text-gray-600 mt-2">
            Gestiona roles, usuarios y permisos de la plataforma
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-red-800"> {error}</p>
              <button
                onClick={loadData}
                className="text-red-700 hover:text-red-900 text-sm underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-gray-200 bg-white rounded-t-lg p-1">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-3 font-medium transition-colors rounded-t-lg ${
              activeTab === 'roles'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
             Roles ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-6 py-3 font-medium transition-colors rounded-t-lg ${
              activeTab === 'usuarios'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
             Usuarios ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('matriz')}
            className={`px-6 py-3 font-medium transition-colors rounded-t-lg ${
              activeTab === 'matriz'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
             Matriz de Permisos
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-lg p-6">
          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <RoleManager
              roles={roles}
              permissions={permissions}
              onCreateRole={(nombre, descripcion, iconoUrl) =>
                adminService.createRole(nombre, descripcion, iconoUrl)
              }
              onDeleteRole={(roleId) => adminService.deleteRole(roleId)}
              onAssignPermissions={(roleId, permissionIds) =>
                adminService.assignPermissionsToRole(roleId, permissionIds)
              }
              onRefresh={loadData}
            />
          )}

          {/* Usuarios Tab */}
          {activeTab === 'usuarios' && (
            <UserManager
              users={users}
              roles={roles}
              onCreateUser={(nombre, apellido, correo, edad, password, roleIds) =>
                adminService.createUser(nombre, apellido, correo, edad, password, roleIds)
              }
              onDeleteUser={(userId) => adminService.deleteUser(userId)}
              onAssignRoles={(userId, roleIds) =>
                adminService.assignRolesToUser(userId, roleIds)
              }
              onRefresh={loadData}
            />
          )}

          {/* Matriz Tab */}
          {activeTab === 'matriz' && (
            <PermissionMatrix roles={roles} permissions={permissions} />
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{roles.length}</div>
            <div className="text-sm text-gray-600 mt-1">Roles Configurados</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-3xl font-bold text-green-600">{users.length}</div>
            <div className="text-sm text-gray-600 mt-1">Usuarios Totales</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{permissions.length}</div>
            <div className="text-sm text-gray-600 mt-1">Permisos del Sistema</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="text-3xl font-bold text-orange-600">
              {roles.reduce((sum, role) => sum + (role.permisos?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Asignaciones Activas</div>
          </div>
        </div>
      </div>
      <BottomNavbar />
    </>
  );
}