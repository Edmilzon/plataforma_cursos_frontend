'use client';

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { ApplyAsTeacherModal } from './teacherCodeModal';

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

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
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                Sobre nosotros
              </Link>
              <Link href="/learn" className="text-gray-700 hover:text-blue-600 font-medium">Aprende</Link>
              <Link href="/certificates" className="text-gray-700 hover:text-blue-600 font-medium">Certifícate</Link>
            </nav>
          </div>

          {/* Botones de sesión, registro o perfil de usuario */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  className="text-gray-700 font-medium flex items-center space-x-2"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  Hola, {user?.nombre || user?.correo}
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 z-50">
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        setModalOpen(true);
                      }}
                    >
                      Aplicar como docente
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={logout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
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

      {/* MODAL FUERA DEL DROPDOWN */}
      <ApplyAsTeacherModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </header>
  );
}