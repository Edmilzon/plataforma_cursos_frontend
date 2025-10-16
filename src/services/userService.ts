const API_BASE_URL = 'http://127.0.0.1:5000';

export interface ApiUser {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  edad: number;
  rol: 'Docente' | 'Estudiante' | 'Administrador';
}

export const userService = {

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

  async getUsersByRole(role: 'Docente' | 'Estudiante' | 'Administrador'): Promise<ApiUser[]> {
    const response = await fetch(`${API_BASE_URL}/user/rol?rol=${role}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Intenta parsear JSON, si falla, devuelve objeto vacío
      throw new Error(errorData.message || `No se pudieron obtener los usuarios con el rol ${role}.`);
    }

    const users = await response.json();
    
    return Array.isArray(users) ? users : [];
  }
};