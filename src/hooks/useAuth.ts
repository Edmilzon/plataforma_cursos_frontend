import { useState } from 'react';
import { useAuth as useAuthContext, User } from '@/context/AuthContext';
import { userService, ApiUser } from '@/services/userService';
import { authService } from '@/services/authService';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, login, logout } = useAuthContext();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.login(email, password);
      
      localStorage.setItem('token', data.token);
      
      const apiUser: ApiUser = await userService.getProfile(data.id_usuario);
      
      const userData: User = {
        id_usuario: apiUser.id_usuario,
        nombre: apiUser.nombre,
        apellido: apiUser.apellido,
        correo: apiUser.correo,
        rol: apiUser.rol,
      };

      login(userData);
      return { success: true, token: data.token };
    } catch (err: any) {
      const errorMessage = err.message || 'Ocurrió un error inesperado.';
      setError(errorMessage);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: {
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
    edad: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.register(userData);
      if (data) {
        await handleLogin(userData.correo, userData.password);
      }
      return { success: true, data: data };
    } catch (err: any) {
      const errorMessage = err.message || 'Ocurrió un error inesperado.';
      setError(errorMessage);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};