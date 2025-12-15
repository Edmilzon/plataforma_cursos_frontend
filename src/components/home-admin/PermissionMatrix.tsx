'use client';

import React, { useEffect } from 'react';
import { Role, Permission } from '@/services/adminServices';

interface PermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ roles, permissions }) => {
  // DEBUG: Ver qué datos llegan
  useEffect(() => {
    console.log(' DEBUG - PermissionMatrix recibió:');
    console.log(' Roles:', roles.length, 'roles');
    console.log('Permisos:', permissions.length, 'permisos');
    
    // Verificar estructura de los primeros 2 roles
    roles.slice(0, 2).forEach((role, index) => {
      console.log(`🔍 Rol ${index + 1} (${role.nombre}):`, {
        id: role.id_rol,
        tienePermisosProp: 'permisos' in role,
        permisosLength: role.permisos?.length || 0,
        permisosArray: Array.isArray(role.permisos),
        permisosSample: role.permisos?.slice(0, 2) // Muestra primeros 2 permisos
      });
    });
    
    // Verificar estructura de los primeros 2 permisos
    permissions.slice(0, 2).forEach((perm, index) => {
      console.log(` Permiso ${index + 1} (${perm.nombre}):`, {
        id: perm.id_permiso,
        tipoId: typeof perm.id_permiso
      });
    });
    
    // Verificar si hay coincidencias
    if (roles.length > 0 && permissions.length > 0) {
      const firstRole = roles[0];
      const firstPermission = permissions[0];
      
      const hasPermission = firstRole.permisos?.some(p => {
        const match = p.id_permiso === firstPermission.id_permiso;
        console.log(` Comparando permiso ${p.id_permiso} (${typeof p.id_permiso}) con ${firstPermission.id_permiso} (${typeof firstPermission.id_permiso}): ${match}`);
        return match;
      });
      
      console.log(`¿El rol ${firstRole.nombre} tiene permiso ${firstPermission.nombre}?:`, hasPermission);
    }
  }, [roles, permissions]);

  const getPermissionColor = (hasPermission: boolean) => {
    return hasPermission ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400';
  };

  const getCheckmark = (hasPermission: boolean) => {
    return hasPermission ? '✓' : '○';
  };

  // Si no hay datos, mostrar mensaje
  if (roles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Matriz de Permisos</h2>
        <p className="text-gray-600 mt-2">No hay roles disponibles</p>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Matriz de Permisos</h2>
        <p className="text-gray-600 mt-2">No hay permisos disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Matriz de Permisos</h2>
        <p className="text-sm text-gray-600 mt-1">
          Vista general de permisos por rol ({roles.length} roles, {permissions.length} permisos)
        </p>
      </div>

      <div className="min-w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-300">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800 sticky left-0 bg-gray-50 z-10 min-w-40">
                Permisos ({permissions.length})
              </th>
              {roles.map((role) => (
                <th
                  key={role.id_rol}
                  className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800 min-w-32 bg-gradient-to-b from-blue-50 to-blue-100"
                >
                  <div className="text-sm font-bold text-gray-800">{role.nombre}</div>
                  <div className="text-xs text-gray-600 font-normal mt-1">
                    {role.permisos?.length || 0} permisos
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {permissions.map((permission, index) => {
              const hasAlternateRow = index % 2 === 0;
              
              // DEBUG para cada permiso
              const debugPermission = index < 3; // Solo debug primeros 3
              
              return (
                <tr
                  key={permission.id_permiso}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                    hasAlternateRow ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800 sticky left-0 bg-inherit z-10">
                    <div className="font-semibold text-gray-800">
                      {permission.nombre}
                      {debugPermission && (
                        <span className="ml-2 text-xs text-gray-500">(ID: {permission.id_permiso})</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{permission.descripcion}</div>
                  </td>

                  {roles.map((role) => {
                    // Verificar si el rol tiene este permiso
                    const hasPermission = role.permisos?.some(p => {
                      // Asegurarnos de comparar números
                      const permId = Number(p.id_permiso);
                      const permissionId = Number(permission.id_permiso);
                      return permId === permissionId;
                    }) || false;
                    
                    // DEBUG para los primeros permisos y roles
                    if (debugPermission && role.id_rol <= 2) {
                      console.log(` Matriz: Rol ${role.nombre} (${role.id_rol}) tiene permiso ${permission.nombre} (${permission.id_permiso})?:`, hasPermission);
                    }
                    
                    return (
                      <td
                        key={`${role.id_rol}-${permission.id_permiso}`}
                        className={`border border-gray-300 px-4 py-3 text-center font-bold text-lg ${getPermissionColor(
                          hasPermission
                        )}`}
                        title={`${role.nombre} - ${permission.nombre}: ${hasPermission ? 'SÍ tiene' : 'NO tiene'}`}
                      >
                        {getCheckmark(hasPermission)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Leyenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <span className="bg-green-100 text-green-800 w-8 h-8 rounded flex items-center justify-center font-bold">
              ✓
            </span>
            <span className="text-gray-700">Permiso asignado ({roles.reduce((sum, role) => sum + (role.permisos?.length || 0), 0)} asignaciones)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-gray-100 text-gray-400 w-8 h-8 rounded flex items-center justify-center font-bold">
              ○
            </span>
            <span className="text-gray-700">Permiso no asignado</span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{roles.length}</div>
          <div className="text-sm text-gray-600">Roles Totales</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{permissions.length}</div>
          <div className="text-sm text-gray-600">Permisos Totales</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {roles.reduce((sum, role) => sum + (role.permisos?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Asignaciones Totales</div>
        </div>
      </div>
      
      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>Roles: {roles.length}</div>
            <div>Permisos: {permissions.length}</div>
            <div>Total asignaciones: {roles.reduce((sum, role) => sum + (role.permisos?.length || 0), 0)}</div>
          </div>
        </div>
      )}
    </div>
  );
};