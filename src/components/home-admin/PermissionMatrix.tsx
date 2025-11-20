'use client';

import React from 'react';
import { Role, Permission } from '@/services/adminServices';

interface PermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ roles, permissions }) => {
  const getPermissionColor = (hasPermission: boolean) => {
    return hasPermission ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400';
  };

  const getCheckmark = (hasPermission: boolean) => {
    return hasPermission ? '✓' : '○';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Matriz de Permisos</h2>
        <p className="text-sm text-gray-600 mt-1">Vista general de permisos por rol</p>
      </div>

      <div className="min-w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-300">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800 sticky left-0 bg-gray-50 z-10 min-w-40">
                Permisos
              </th>
              {roles.map((role) => (
                <th
                  key={role.id_rol}
                  className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800 min-w-32 bg-gradient-to-b from-blue-50 to-blue-100"
                >
                  <div className="text-sm font-bold text-gray-800">{role.nombre}</div>
                  <div className="text-xs text-gray-600 font-normal mt-1">
                    ({role.permisos?.length || 0})
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {permissions.map((permission, index) => {
              const hasAlternateRow = index % 2 === 0;
              return (
                <tr
                  key={permission.id_permiso}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                    hasAlternateRow ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800 sticky left-0 bg-inherit z-10">
                    <div className="font-semibold text-gray-800">{permission.nombre}</div>
                    <div className="text-xs text-gray-600 mt-1">{permission.descripcion}</div>
                  </td>

                  {roles.map((role) => {
                    const hasPermission = role.permisos?.some(p => p.id_permiso === permission.id_permiso) || false;
                    return (
                      <td
                        key={`${role.id_rol}-${permission.id_permiso}`}
                        className={`border border-gray-300 px-4 py-3 text-center font-bold text-lg ${getPermissionColor(
                          hasPermission
                        )}`}
                      >
                        {getCheckmark(hasPermission)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {permissions.length === 0 && (
              <tr>
                <td colSpan={roles.length + 1} className="text-center py-12 text-gray-500">
                  No hay permisos disponibles
                </td>
              </tr>
            )}
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
            <span className="text-gray-700">Permiso asignado</span>
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
    </div>
  );
};