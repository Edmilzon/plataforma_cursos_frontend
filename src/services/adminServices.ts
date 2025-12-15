// services/adminService.ts
const API_BASE_URL = 'http://localhost:5000/admin';
import { userService, ApiUser } from './userService';

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

export interface User extends ApiUser {
  roles?: Role[];
  fecha_registro?: string;
}

export interface Reward {
  id_recompensa?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  puntos_requeridos: number;
  cantidad_disponible: number;
  estado: 'Activo' | 'Inactivo';
  imagen_url: string;
}

export const adminService = {
  // ==================== ROLES ====================

  async getRoles(): Promise<Role[]> {
    try {
      console.log('🔍 Obteniendo roles...');
      const response = await fetch(`${API_BASE_URL}/roles`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const roles = await response.json();
      console.log('✅ Roles obtenidos:', roles.length, 'roles');
      
      // Asegurarse de que los roles tengan el array permisos incluso si está vacío
      return roles.map((role: any) => ({
        ...role,
        permisos: role.permisos || []
      }));
    } catch (error) {
      console.error('❌ Error obteniendo roles:', error);
      throw error;
    }
  },

  async getRoleById(roleId: number): Promise<Role> {
    try {
      console.log(`🔍 Obteniendo rol ${roleId}...`);
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo obtener el rol'}`);
      }
      
      const role = await response.json();
      console.log('✅ Rol obtenido:', role);
      
      return {
        ...role,
        permisos: role.permisos || []
      };
    } catch (error) {
      console.error('❌ Error obteniendo rol:', error);
      throw error;
    }
  },

  async createRole(nombre: string, descripcion: string, iconoUrl?: string, adminId: number = 1): Promise<Role> {
    try {
      console.log(`📝 Creando rol: ${nombre}`);
      const response = await fetch(`${API_BASE_URL}/roles?adminId=${adminId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion, icono_url: iconoUrl }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo crear el rol'}`);
      }
      
      const role = await response.json();
      console.log('✅ Rol creado:', role);
      return role;
    } catch (error) {
      console.error('❌ Error creando rol:', error);
      throw error;
    }
  },

  async updateRole(roleId: number, nombre: string, descripcion: string, iconoUrl?: string): Promise<Role> {
    try {
      console.log(`✏️ Actualizando rol ${roleId}...`);
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion, icono_url: iconoUrl }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo actualizar el rol'}`);
      }
      
      const role = await response.json();
      console.log('✅ Rol actualizado:', role);
      return role;
    } catch (error) {
      console.error('❌ Error actualizando rol:', error);
      throw error;
    }
  },

  async deleteRole(roleId: number, adminId: number = 1): Promise<void> {
    try {
      console.log(`🗑️ Eliminando rol ${roleId}...`);
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}?adminId=${adminId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo eliminar el rol'}`);
      }
      
      console.log('✅ Rol eliminado correctamente');
    } catch (error) {
      console.error('❌ Error eliminando rol:', error);
      throw error;
    }
  },

  // ==================== PERMISOS ====================

  async getPermissions(): Promise<Permission[]> {
    try {
      console.log('🔍 Obteniendo permisos...');
      const response = await fetch(`${API_BASE_URL}/permisos`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const permissions = await response.json();
      console.log('✅ Permisos obtenidos:', permissions.length, 'permisos');
      return permissions;
    } catch (error) {
      console.error('❌ Error obteniendo permisos:', error);
      throw error;
    }
  },

  async getPermissionsOfRole(roleId: number): Promise<Permission[]> {
    try {
      console.log(`🔍 Obteniendo permisos del rol ${roleId}...`);
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}/permisos`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudieron obtener los permisos'}`);
      }
      
      const permissions = await response.json();
      console.log('✅ Permisos del rol obtenidos:', permissions.length, 'permisos');
      return permissions;
    } catch (error) {
      console.error('❌ Error obteniendo permisos del rol:', error);
      throw error;
    }
  },

  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<Role> {
    try {
      console.log(`📌 Asignando permisos al rol ${roleId}:`, permissionIds);
      
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}/permisos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudieron asignar los permisos'}`);
      }
      
      const result = await response.json();
      console.log('✅ Permisos asignados:', result);
      
      return {
        ...result,
        permisos: result.permisos || []
      };
    } catch (error) {
      console.error('❌ Error asignando permisos:', error);
      throw error;
    }
  },

  // ==================== USUARIOS ====================

  async getAllUsers(): Promise<User[]> {
    try {
      console.log('👥 Obteniendo todos los usuarios...');
      
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios`);
        
        if (response.ok) {
          const users = await response.json();
          console.log(`✅ Usuarios obtenidos (admin endpoint): ${users.length} usuarios`);
          
          return users.map((user: any) => ({
            ...user,
            roles: user.roles || [],
            fecha_registro: user.fecha_registro || user.fechaRegistro || null
          }));
        } else {
          console.log('⚠️ Endpoint admin/usuarios falló, intentando user endpoint...');
        }
      } catch (adminError) {
        console.log('⚠️ Endpoint admin/usuarios no disponible, intentando user endpoint...', adminError);
      }

      const users = await userService.getAllUsers();
      console.log(`✅ Usuarios obtenidos (user endpoint): ${users.length} usuarios`);
      
      return users.map((user: any) => ({
        ...user,
        roles: user.roles || []
      }));
      
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      throw error;
    }
  },

  async getUserById(userId: number): Promise<User> {
    try {
      console.log(`🔍 Obteniendo usuario ${userId}...`);
      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo obtener el usuario'}`);
      }
      
      const user = await response.json();
      console.log('✅ Usuario obtenido:', user);
      
      return {
        ...user,
        roles: user.roles || [],
        fecha_registro: user.fecha_registro || user.fechaRegistro || null
      };
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
      throw error;
    }
  },

  async createUser(
    nombre: string,
    apellido: string,
    correo: string,
    edad: number,
    password: string,
    roleIds?: number[],
    adminId: number = 1
  ): Promise<User> {
    try {
      console.log(`📝 Creando usuario: ${nombre} ${apellido}`, roleIds ? `con roles: ${roleIds}` : 'sin roles');
      
      const requestBody: any = { 
        nombre, 
        apellido, 
        correo, 
        edad, 
        password 
      };
      
      // Solo agregar roleIds si se proporcionan y no está vacío
      if (roleIds && roleIds.length > 0) {
        requestBody.roleIds = roleIds;
      }
      
      const response = await fetch(`${API_BASE_URL}/usuarios?adminId=${adminId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo crear el usuario'}`);
      }
      
      const user = await response.json();
      console.log('✅ Usuario creado:', user);
      
      return {
        ...user,
        roles: user.roles || []
      };
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      throw error;
    }
  },

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    try {
      console.log(`✏️ Actualizando usuario ${userId}...`);
      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo actualizar el usuario'}`);
      }
      
      const user = await response.json();
      console.log('✅ Usuario actualizado:', user);
      
      return {
        ...user,
        roles: user.roles || []
      };
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      throw error;
    }
  },

  async deleteUser(userId: number, adminId: number = 1): Promise<void> {
    try {
      console.log(`🗑️ Eliminando usuario ${userId}...`);
      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}?adminId=${adminId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo eliminar el usuario'}`);
      }
      
      console.log('✅ Usuario eliminado correctamente');
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      throw error;
    }
  },

  async assignRolesToUser(userId: number, roleIds: number[], adminId: number = 1): Promise<User> {
    try {
      console.log(`👤 Asignando roles al usuario ${userId}:`, roleIds);
      
      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/roles?adminId=${adminId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleIds }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudieron asignar los roles'}`);
      }
      
      const result = await response.json();
      console.log('✅ Roles asignados:', result);
      
      return {
        ...result,
        roles: result.roles || []
      };
    } catch (error) {
      console.error('❌ Error asignando roles:', error);
      throw error;
    }
  },

  async updateUserRole(userId: number, newRole: string): Promise<User> {
    try {
      console.log(`🔄 Cambiando rol del usuario ${userId} a ${newRole}`);
      
      // Obtener el ID del rol por nombre
      const roleId = await this.getRoleIdByName(newRole);
      
      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/roles?adminId=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleIds: [roleId] }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo cambiar el rol'}`);
      }
      
      const result = await response.json();
      console.log('✅ Rol actualizado:', result);
      
      return {
        ...result,
        roles: result.roles || []
      };
    } catch (error) {
      console.error('❌ Error cambiando rol:', error);
      throw error;
    }
  },

  // ==================== HELPERS ====================

  async getRoleIdByName(roleName: string): Promise<number> {
<<<<<<< HEAD
    const roles = await this.getRoles();
    const role = roles.find(r => r.nombre.toLowerCase() === roleName.toLowerCase());
    if (!role) throw new Error(`Rol "${roleName}" no encontrado`);
    return role.id_rol;
  },

  // ==================== RECOMPENSAS ====================

  async getRewards(): Promise<Reward[]> {
    try {
      console.log('🔍 Obteniendo todas las recompensas...');
      const response = await fetch(`http://localhost:5000/recompensas`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron obtener las recompensas`);
      }
      const rewards = await response.json();
      console.log('✅ Recompensas obtenidas:', rewards);
      return rewards;
    } catch (error) {
      console.error('❌ Error obteniendo recompensas:', error);
=======
    try {
      const roles = await this.getRoles();
      const role = roles.find(r => r.nombre.toLowerCase() === roleName.toLowerCase());
      if (!role) throw new Error(`Rol "${roleName}" no encontrado`);
      return role.id_rol;
    } catch (error) {
      console.error('❌ Error obteniendo ID del rol:', error);
>>>>>>> origin/feature/perfil-insignias-permisos
      throw error;
    }
  },

<<<<<<< HEAD
  async createReward(rewardData: Omit<Reward, 'id_recompensa'>): Promise<Reward> {
    try {
      console.log('📝 Creando recompensa:', rewardData);
      const response = await fetch(`http://localhost:5000/recompensas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor al crear:', errorText);
        throw new Error(`Error ${response.status}: No se pudo crear la recompensa`);
      }

      const newReward = await response.json();
      console.log('✅ Recompensa creada:', newReward);
      return newReward;
    } catch (error) {
      console.error('❌ Error creando recompensa:', error);
      throw error;
    }
  },

  async updateReward(rewardId: number, rewardData: Partial<Reward>): Promise<Reward> {
    try {
      console.log(`✏️ Actualizando recompensa ${rewardId}:`, rewardData);
      const response = await fetch(`http://localhost:5000/recompensas/${rewardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor al actualizar:', errorText);
        throw new Error(`Error ${response.status}: No se pudo actualizar la recompensa`);
      }

      const updatedReward = await response.json();
      console.log('✅ Recompensa actualizada:', updatedReward);
      return updatedReward;
    } catch (error) {
      console.error('❌ Error actualizando recompensa:', error);
      throw error;
    }
  },

  async deleteReward(rewardId: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando (desactivando) recompensa ${rewardId}...`);
      const response = await fetch(`http://localhost:5000/recompensas/${rewardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor al eliminar:', errorText);
        throw new Error(`Error ${response.status}: No se pudo eliminar la recompensa`);
      }

      console.log('✅ Recompensa eliminada (desactivada) correctamente');
    } catch (error) {
      console.error('❌ Error eliminando recompensa:', error);
      throw error;
    }
=======
  // ==================== VALIDACIÓN ====================

  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { 
        isValid: false, 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      };
    }
    
    return { isValid: true };
  },

  validateEmail(email: string): { isValid: boolean; message?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { 
        isValid: false, 
        message: 'El correo electrónico no es válido' 
      };
    }
    
    return { isValid: true };
>>>>>>> origin/feature/perfil-insignias-permisos
  }
};