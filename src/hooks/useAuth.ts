import { useState } from 'react';
import { useAuth as useAuthContext } from '@/context/AuthContext';
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
      
      // Guardar el token JWT que responde el backend
      localStorage.setItem('token', data.token);
      
      // Como el backend no envía datos del usuario en el login,
      // podemos hacer una petición adicional o usar los datos básicos
      const userData = {
        id: data.userId || 0, // Si el backend no envía userId, ajusta esto
        name: '', // Podrías necesitar otro endpoint para obtener el perfil
        email: email,
        lastname: '', // Ajustar según la respuesta real
        phone: '' // Ajustar según la respuesta real
      };
      
      login(userData);
      return { success: true, token: data.token };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: {
    email: string;
    password: string;
    name: string;
    lastname: string;
    phone: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.register(userData);
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
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