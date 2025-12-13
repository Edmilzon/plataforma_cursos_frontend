// services/userService.ts - VERSIÓN CORREGIDA
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

export const userService = {
  async getUsersByRole(role: 'Docente' | 'Estudiante' | 'Administrador'): Promise<ApiUser[]> {
    try {
      console.log(`🔍 Obteniendo usuarios con rol: ${role}`);
      
      const response = await fetch(`${API_BASE_URL}/user/rol?rol=${role}`);
      
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      
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

  // NUEVO: Obtener todos los usuarios
  async getAllUsers(): Promise<ApiUser[]> {
    try {
      console.log('🔍 Obteniendo todos los usuarios...');
      
      const response = await fetch(`${API_BASE_URL}/user`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron obtener todos los usuarios`);
      }

      const users = await response.json();
      console.log(` Todos los usuarios obtenidos:`, users.length);
      
      return Array.isArray(users) ? users : [];
      
    } catch (error) {
      console.error(' Error en getAllUsers:', error);
      throw error;
    }
  },

  async getProfile(userId: number): Promise<ApiUser> {
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

    return response.json();
  },

  /**
   * Obtiene el saldo de puntos de un usuario y actualiza el localStorage.
   * @param userId - El ID del usuario.
   * @returns El saldo de puntos actualizado.
   */
  async updateUserPointsInStorage(userId: number): Promise<number | undefined> {
    try {
      console.log(`Actualizando saldo de puntos para el usuario ${userId}...`);
      const response = await fetch(`${API_BASE_URL}/user/${userId}/saldo-punto`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo obtener el saldo de puntos.`);
      }

      const data = await response.json();
      const newPoints = data.saldo_punto;

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr) as ApiUser;
        user.saldo_punto = newPoints;
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Saldo de puntos actualizado en localStorage:', newPoints);
      }

      return newPoints;
    } catch (error) {
      console.error('Error actualizando el saldo de puntos:', error);
      return undefined;
    }
  }
};