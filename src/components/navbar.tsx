'use client';

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Navegación JUNTOS a la IZQUIERDA */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">Polimathia</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <span className="text-gray-700 font-medium">Aprende</span>
              <span className="text-gray-700 font-medium">Certifícate</span>
            </nav>
          </div>

          {/* Botones de sesión, registro o perfil de usuario */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700 font-medium">
                  Hola, {user?.nombre || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Regístrate
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}