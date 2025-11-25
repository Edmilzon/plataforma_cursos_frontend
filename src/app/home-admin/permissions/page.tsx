// app/home-admin/permissions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';
import { adminService } from '@/services/adminServices';

interface Role {
  id_rol: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

export default function PermissionsAdminPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesData, usersData] = await Promise.all([
        adminService.getRoles(),
        adminService.getAllUsers()
      ]);
      setRoles(rolesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id_usuario === userId ? { ...user, rol: newRole } : user
      ));
      alert('Rol actualizado exitosamente');
    } catch (error) {
      alert('Error al actualizar el rol');
    }
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto mt-24 px-4 pb-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <BottomNavbar />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto mt-24 px-4 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Permisos</h1>
            <p className="text-gray-600 mt-2">Administra roles y permisos de usuarios</p>
          </div>
          <button 
            onClick={() => setShowRoleModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Crear Nuevo Rol
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de Roles */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Roles del Sistema</h2>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id_rol} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{role.nombre}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {role.permisos.length} permisos
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{role.descripcion}</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permisos.map((permiso, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {permiso}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gestión de Usuarios */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Asignar Roles a Usuarios</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id_usuario} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">
                      {user.nombre} {user.apellido}
                    </div>
                    <div className="text-sm text-gray-600">{user.correo}</div>
                  </div>
                  <select 
                    value={user.rol}
                    onChange={(e) => handleUpdateUserRole(user.id_usuario, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Estudiante">Estudiante</option>
                    <option value="Docente">Docente</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear rol */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Crear Nuevo Rol</h3>
            <p className="text-gray-600 mb-4">
              Para crear roles personalizados, necesitamos implementar el backend correspondiente.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Crear Rol
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavbar />
    </>
  );
}