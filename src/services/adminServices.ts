// services/adminService.ts
const API_BASE_URL = 'http://localhost:5000/admin';
import { userService } from './userService';

export interface Role {
  id_rol: number;
  nombre: string;
  descripcion: string;
  icono_url?: string;
  permisos?: Permission[];
}

export interface Permission {
  id_permiso: number;
  nombre: string;
  descripcion: string;
}

export interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  edad: number;
  rol: string;
  fecha_registro?: string;
}

export const adminService = {
  // OBTENER ROLES EXISTENTES - Este endpoint SÍ funciona
  async getRoles(): Promise<Role[]> {
    try {
      console.log('🔍 Obteniendo roles...');
      const response = await fetch(`${API_BASE_URL}/roles`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const roles = await response.json();
      console.log(' Roles obtenidos:', roles);
      return roles;
    } catch (error) {
      console.error(' Error obteniendo roles:', error);
      throw error;
    }
  },

  // OBTENER PERMISOS DISPONIBLES - Este endpoint SÍ funciona
  async getPermissions(): Promise<Permission[]> {
    try {
      console.log('🔍 Obteniendo permisos...');
      const response = await fetch(`${API_BASE_URL}/permisos`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const permissions = await response.json();
      console.log(' Permisos obtenidos:', permissions);
      return permissions;
    } catch (error) {
      console.error(' Error obteniendo permisos:', error);
      throw error;
    }
  },

  // ASIGNAR PERMISOS A UN ROL - Este endpoint SÍ funciona
  async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
    try {
      console.log(`🔍 Asignando permisos al rol ${roleId}:`, permissionIds);
      
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}/permisos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(' Permisos asignados:', result);
      return result;
    } catch (error) {
      console.error(' Error asignando permisos:', error);
      throw error;
    }
  },

  // OBTENER TODOS LOS USUARIOS - Usando el nuevo método
  async getAllUsers(): Promise<User[]> {
    try {
      console.log(' Obteniendo todos los usuarios...');
      
      // Usar el nuevo método getAllUsers que usa el endpoint /user
      const users = await userService.getAllUsers();
      console.log(` Usuarios obtenidos: ${users.length}`);
      
      return users;
      
    } catch (error) {
      console.error(' Error obteniendo usuarios:', error);
      
      // Si falla getAllUsers, intentar con getUsersByRole
      try {
        console.log(' Intentando obtener usuarios por roles individuales...');
        
        const [teachers, students, admins] = await Promise.all([
          userService.getUsersByRole('Docente').catch(() => []),
          userService.getUsersByRole('Estudiante').catch(() => []),
          userService.getUsersByRole('Administrador').catch(() => [])
        ]);
        
        const allUsers = [...teachers, ...students, ...admins];
        console.log(` Usuarios obtenidos por roles: ${allUsers.length}`);
        return allUsers;
        
      } catch (fallbackError) {
        console.error(' Todos los métodos fallaron:', fallbackError);
        throw new Error('No se pudieron obtener los usuarios. Verifica que los endpoints /user y /user/rol estén funcionando.');
      }
    }
  },

  // CAMBIAR ROL DE USUARIO - Necesitas implementar este endpoint
  async updateUserRole(userId: number, newRole: string) {
    try {
      console.log(`🔄 Cambiando rol del usuario ${userId} a ${newRole}`);
      
      // Este endpoint necesitas implementarlo en tu backend
      const response = await fetch(`http://localhost:5000/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Rol actualizado:', result);
        return result;
      } else {
        // Si el endpoint no existe, simular el cambio
        console.log(` Endpoint no implementado, simulando cambio de rol`);
        return { 
          message: `Rol cambiado a ${newRole} (simulado - implementa el endpoint /admin/users/${userId}/role)`,
          simulated: true 
        };
      }
      
    } catch (error) {
      console.error(' Error cambiando rol:', error);
      throw new Error('Error al cambiar el rol del usuario');
    }
  }
};