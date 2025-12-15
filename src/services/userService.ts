// services/userService.ts - VERSIÓN COMPLETA CORREGIDA
const API_BASE_URL = 'http://127.0.0.1:5000';

export interface ApiUser {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  edad: number;
  rol: 'Docente' | 'Estudiante' | 'Administrador';
  fecha_registro?: string;
  avatar_url?: string;
  saldo_punto?: number;
}

export interface UpdateProfileData {
  nombre?: string;
  apellido?: string;  
  edad?: number;
  password?: string;
}

export const userService = {
  async getUsersByRole(role: 'Docente' | 'Estudiante' | 'Administrador'): Promise<ApiUser[]> {
    try {
      console.log(` Obteniendo usuarios con rol: ${role}`);
      
      const response = await fetch(`${API_BASE_URL}/user/rol?rol=${role}`);
      
      console.log(` Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(` Error del servidor:`, errorText);
        throw new Error(`Error ${response.status}: No se pudieron obtener los usuarios con rol ${role}`);
      }

      const users = await response.json();
      console.log(` Usuarios obtenidos:`, users);
      
      return Array.isArray(users) ? users : [];
      
    } catch (error) {
      console.error(` Error en getUsersByRole:`, error);
      throw error;
    }
  },

  async getAllUsers(): Promise<ApiUser[]> {
    try {
      console.log(' Obteniendo todos los usuarios...');
      
      const response = await fetch(`${API_BASE_URL}/user`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron obtener todos los usuarios`);
      }

      const users = await response.json();
      console.log(`Todos los usuarios obtenidos:`, users.length);
      
      return Array.isArray(users) ? users : [];
      
    } catch (error) {
      console.error(' Error en getAllUsers:', error);
      throw error;
    }
  },

  async getProfile(userId: number): Promise<ApiUser> {
    try {
      console.log(` Obteniendo perfil del usuario ${userId}...`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación.');
      }

      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo obtener el perfil del usuario.');
      }

      const userData = await response.json();
      console.log(' Perfil obtenido:', userData);
      
      return userData;
      
    } catch (error) {
      console.error(' Error en getProfile:', error);
      throw error;
    }
  },

  /**
   * Obtiene el saldo de puntos de un usuario y actualiza el localStorage.
   * @param userId - El ID del usuario.
   * @returns El saldo de puntos actualizado.
   */
  async updateUserPointsInStorage(userId: number): Promise<number> {
    try {
      console.log(` Actualizando puntos para usuario ${userId}...`);
      
      // Usar el endpoint GET /user/{id} que SÍ existe
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación.');
      }

      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo obtener los datos del usuario.`);
      }

      const userData = await response.json();
      console.log(' Datos completos del usuario:', userData);
      
      const puntos = userData.saldo_punto || 0;
      
      // Actualizar localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr) as ApiUser;
        user.saldo_punto = puntos;
        localStorage.setItem('user', JSON.stringify(user));
        console.log(' Puntos actualizados en localStorage:', puntos);
      }

      return puntos;
    } catch (error) {
      console.error(' Error actualizando el saldo de puntos:', error);
      throw error;
    }
  },

  /**
   * Obtiene el saldo de puntos de un usuario SIN actualizar localStorage
   */
  async getUserPoints(userId: number): Promise<number> {
    try {
      return await this.updateUserPointsInStorage(userId);
    } catch (error) {
      console.error(' Error obteniendo puntos:', error);
      return 0;
    }
  },

  async updateProfile(userId: number, data: UpdateProfileData): Promise<ApiUser> {
    try {
      console.log(` Actualizando perfil para usuario ${userId}:`, data);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // 1. Actualizar perfil en el backend
      const response = await fetch(`${API_BASE_URL}/user/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo actualizar el perfil`);
      }

      const updatedUser = await response.json();
      console.log(' Perfil actualizado desde backend:', updatedUser);
      
      // 2. OBTENER PUNTOS ACTUALIZADOS DESPUÉS DEL CAMBIO
      let puntosActualizados = updatedUser.saldo_punto || 0;
      try {
        puntosActualizados = await this.updateUserPointsInStorage(userId);
        console.log(' Puntos obtenidos después de actualizar:', puntosActualizados);
      } catch (pointsError) {
        console.warn(' No se pudieron obtener puntos:', pointsError);
      }
      
      // 3. Actualizar localStorage con TODOS los datos actualizados
      const currentUserStr = localStorage.getItem('user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.id_usuario === userId) {
          // Combinar datos: primero los actuales, luego los del backend, luego puntos
          const mergedUser = { 
            ...currentUser, 
            ...updatedUser,
            saldo_punto: puntosActualizados,
            // Manejo especial para edad si no viene del backend
            edad: updatedUser.edad !== undefined ? updatedUser.edad : currentUser.edad
          };
          
          localStorage.setItem('user', JSON.stringify(mergedUser));
          console.log(' localStorage actualizado:', mergedUser);
        }
      }
      
      // 4. Devolver usuario con puntos actualizados
      return {
        ...updatedUser,
        saldo_punto: puntosActualizados
      };
      
    } catch (error) {
      console.error(' Error en updateProfile:', error);
      throw error;
    }
  },

  /**
   * Refresca todos los datos del usuario desde el backend
   */
  async refreshUserData(userId: number): Promise<ApiUser> {
    try {
      console.log(`🔄 Refrescando todos los datos del usuario ${userId}...`);
      
      // 1. Obtener perfil completo
      const userProfile = await this.getProfile(userId);
      
      // 2. Asegurar puntos actualizados
      const puntos = userProfile.saldo_punto || 0;
      
      // 3. Actualizar localStorage
      const currentUserStr = localStorage.getItem('user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.id_usuario === userId) {
          const mergedUser = { 
            ...currentUser, 
            ...userProfile,
            saldo_punto: puntos
          };
          localStorage.setItem('user', JSON.stringify(mergedUser));
        }
      }
      
      console.log('Datos refrescados:', userProfile);
      return userProfile;
      
    } catch (error) {
      console.error(' Error refrescando datos:', error);
      throw error;
    }
  }
};