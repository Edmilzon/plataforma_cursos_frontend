'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface User {
  id: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  saldo_punto?: number;
  avatar_url?: string;
  edad?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: {
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
    edad: number;
    avatar_url?: string;
    rol: 'Estudiante' | 'Docente' | 'Administrador';
  }) => Promise<{ success: boolean; error?: any }>;
  loading: boolean;
  updateUser: (updatedUser: Partial<User>) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      // Aseguramos que id_usuario siempre tenga el valor correcto
      if (parsedUser.id && !parsedUser.id_usuario) {
        parsedUser.id_usuario = parsedUser.id;
      }
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Error en el inicio de sesión');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const register = async (userData: {
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
    edad: number;
    avatar_url?: string;
    rol: 'Estudiante' | 'Docente' | 'Administrador';
  }) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(userData);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/'); 
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, register, loading, error, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}