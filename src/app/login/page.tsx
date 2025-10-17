'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      router.push('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">Polimathia</h1>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <span className="text-gray-700 font-medium">Aprende</span>
                <span className="text-gray-700 font-medium">Certifícate</span>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                href="/register"
                style={{ backgroundColor: '#59EA8A' }}
                className=" hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                Regístrate
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center pt-16 pb-0 px-0 sm:px-0 lg:px-0 relative">
        <div className="absolute -right-10 top-150 transform -translate-y-40 z-">
          <img 
            src="/fondoLogin.png" 
            alt="Login" 
            className="w-80 h-80 object-contain" />
        </div>

        {/* Formulario de login */}
        <div className="max-w-md w-full space-y-8 z-10 bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mt-6">
              Inicia Sesión
            </h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-lg font-semibold text-gray-900 mb-3">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full px-4 py-3 border-2 border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="Correo Electrónico"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-lg font-semibold text-gray-900 mb-3">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full px-4 py-3 border-2 border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="Contraseña"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="text-center text-gray-600 text-base">
              <p>
                Al continuar con tu correo o tu red social aceptas los términos y condiciones y el aviso de privacidad
              </p>
            </div>

            <div className="border-t border-gray-300 my-6"></div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#59EA8A' }}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white  hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <div className="text-center">
              <a href="/forgot-password" className="font-semibold text-gray-900 hover:text-blue-500 text-lg">
                Olvidé mi contraseña
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Barra inferior AZUL (sin footer, solo barra) */}
      <div className="bg-gray-900 h-18 w-full"></div>
    </div>
  );
}