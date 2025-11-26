// app/home-admin/permissions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';
import { adminService } from '@/services/adminServices';

interface Role {
  id_rol: number;
  nombre: string;
  descripcion: string;
  icono_url?: string;
  permisos?: Permission[];
}

interface Permission {
  id_permiso: number;
  nombre: string;
  descripcion: string;
}

interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  edad: number;
  rol: string;
}

export default function PermissionsAdminPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log('Cargando datos del backend...');
      
      const [rolesData, permissionsData, usersData] = await Promise.all([
        adminService.getRoles(),
        adminService.getPermissions(),
        adminService.getAllUsers()
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData);
      setUsers(usersData);
      
      setSuccessMessage(`Datos cargados: ${rolesData.length} roles, ${permissionsData.length} permisos, ${usersData.length} usuarios`);
      console.log('Todos los datos cargados correctamente');

    } catch (error: any) {
      console.error('Error cargando datos:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPermissions = async (roleId: number, permissionIds: number[]) => {
    try {
      await adminService.assignPermissionsToRole(roleId, permissionIds);
      
      const updatedRoles = await adminService.getRoles();
      setRoles(updatedRoles);
      setSelectedRole(null);
      
      setSuccessMessage('Permisos asignados exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      setError(`Error al asignar permisos: ${error.message}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      const result = await adminService.updateUserRole(userId, newRole);
      
      setUsers(users.map(user => 
        user.id_usuario === userId ? { ...user, rol: newRole } : user
      ));
      
      if (result.simulated) {
        setSuccessMessage(`${result.message}`);
      } else {
        setSuccessMessage('Rol actualizado exitosamente');
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      setError(`Error al actualizar el rol: ${error.message}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto mt-24 px-4 pb-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del backend...</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Roles y Permisos</h1>
          <p className="text-gray-600 mt-2">
            Administra los permisos del sistema y roles de usuarios
          </p>
        </div>

        {/* Mostrar mensajes */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-red-800">{error}</p>
                <button 
                  onClick={loadData}
                  className="mt-2 text-red-700 hover:text-red-800 text-sm underline"
                >
                  Reintentar carga
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sección: Roles y Permisos */}
          <div className="space-y-6">
            {/* Lista de Roles */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Roles del Sistema</h2>
                <span className="text-sm text-gray-500">{roles.length} roles</span>
              </div>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id_rol} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{role.nombre}</h3>
                        <p className="text-sm text-gray-600">{role.descripcion}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedRole(role)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Gestionar Permisos
                      </button>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Permisos asignados:</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.permisos && role.permisos.length > 0 ? (
                          role.permisos.map((permiso) => (
                            <span 
                              key={permiso.id_permiso}
                              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                            >
                              {permiso.nombre}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Sin permisos asignados
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permisos Disponibles */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Permisos Disponibles</h2>
                <span className="text-sm text-gray-500">{permissions.length} permisos</span>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                {permissions.map((permission) => (
                  <div key={permission.id_permiso} className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-medium text-gray-800">{permission.nombre}</h3>
                    <p className="text-sm text-gray-600">{permission.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sección: Gestión de Usuarios */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Asignar Roles a Usuarios</h2>
              <span className="text-sm text-gray-500">{users.length} usuarios</span>
            </div>
            
            {users.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id_usuario} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-sm text-gray-600">{user.correo}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Edad: {user.edad} años
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.rol === 'Administrador' ? 'bg-purple-100 text-purple-800' :
                        user.rol === 'Docente' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.rol}
                      </span>
                      
                      <select 
                        value={user.rol}
                        onChange={(e) => handleUpdateUserRole(user.id_usuario, e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Estudiante">Estudiante</option>
                        <option value="Docente">Docente</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No se pudieron cargar los usuarios</p>
                <button 
                  onClick={loadData}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Reintentar carga
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para gestionar permisos */}
      {selectedRole && (
        <ManagePermissionsModal 
          role={selectedRole}
          permissions={permissions}
          onClose={() => setSelectedRole(null)}
          onAssign={handleAssignPermissions}
        />
      )}

      <BottomNavbar />
    </>
  );
}

// Modal para gestionar permisos
function ManagePermissionsModal({ 
  role, 
  permissions, 
  onClose, 
  onAssign
}: { 
  role: Role; 
  permissions: Permission[]; 
  onClose: () => void; 
  onAssign: (roleId: number, permissionIds: number[]) => void;
}) {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    role.permisos ? role.permisos.map(p => p.id_permiso) : []
  );

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = () => {
    if (selectedPermissions.length === 0) {
      alert('Debes seleccionar al menos un permiso');
      return;
    }
    onAssign(role.id_rol, selectedPermissions);
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-300 shadow-xl">
        <h3 className="text-xl font-bold mb-2">Gestionar Permisos: {role.nombre}</h3>
        <p className="text-gray-600 mb-4">{role.descripcion}</p>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Permisos Actuales:</h4>
          <div className="flex flex-wrap gap-1">
            {role.permisos && role.permisos.length > 0 ? (
              role.permisos.map((permiso) => (
                <span 
                  key={permiso.id_permiso}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                >
                  {permiso.nombre}
                </span>
              ))
            ) : (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                Sin permisos asignados
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {permissions.map((permission) => (
            <div key={permission.id_permiso} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={selectedPermissions.includes(permission.id_permiso)}
                onChange={() => handleTogglePermission(permission.id_permiso)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">{permission.nombre}</div>
                <div className="text-sm text-gray-600">{permission.descripcion}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedPermissions.length} de {permissions.length} permisos seleccionados
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}