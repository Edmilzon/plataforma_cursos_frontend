const API_BASE_URL = 'http://127.0.0.1:5000';

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo: email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el login');
    }

    return response.json();
  },

  async register(userData: {
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
    edad: number;
    avatar_url?: string;
    rol: 'Estudiante' | 'Docente' | 'Administrador';
  }) {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el registro');
    }

    return response.json();
  }
};