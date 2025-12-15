'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';
import { badgeService } from '@/services/badgeService';

export default function CreateBadgePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen_url: '',
    criterio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Validar campos requeridos
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!formData.descripcion.trim()) {
        throw new Error('La descripción es requerida');
      }
      if (!formData.criterio.trim()) {
        throw new Error('El criterio es requerido');
      }

      // Validar URL de imagen si se proporciona
      if (formData.imagen_url && !badgeService.isValidUrl(formData.imagen_url)) {
        throw new Error('La URL de la imagen no es válida');
      }

      // Crear la insignia
      const result = await badgeService.createBadge({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        imagen_url: formData.imagen_url.trim(),
        criterio: formData.criterio.trim()
      });

      // Mostrar mensaje de éxito
      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/home-admin/badges');
      }, 2000);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear insignia';
      setError(message);
      console.error('Error creando insignia:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Insignia</h1>
              <p className="text-gray-600 mt-2">Diseña una nueva insignia para los usuarios</p>
            </div>
            <button
              onClick={() => router.push('/home-admin/badges')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Mensajes de estado */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ¡Insignia creada exitosamente! Redirigiendo...
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Insignia *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Ej: Principiante, Experto, Maestro del Saber"
                />
                <p className="mt-1 text-sm text-gray-500">El nombre que los usuarios verán</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  disabled={loading || success}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Describe qué debe hacer el usuario para ganar esta insignia"
                />
                <p className="mt-1 text-sm text-gray-500">Una breve descripción del logro</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Imagen
                </label>
                <input
                  type="url"
                  name="imagen_url"
                  value={formData.imagen_url}
                  onChange={handleChange}
                  disabled={loading || success}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="https://ejemplo.com/imagen-insignia.png"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Opcional. Si no se proporciona, se usará un ícono por defecto
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Criterio para Obtenerla *
                </label>
                <textarea
                  name="criterio"
                  value={formData.criterio}
                  onChange={handleChange}
                  required
                  disabled={loading || success}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Ej: Completar 5 cursos, Alcanzar 1000 puntos, Participar en 10 discusiones"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Define los requisitos específicos para ganar esta insignia
                </p>
              </div>

              {/* Ejemplos de criterios */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Ejemplos de criterios:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Completar al menos 5 cursos</li>
                  <li>• Alcanzar 1000 puntos de experiencia</li>
                  <li>• Participar en 10 discusiones del foro</li>
                  <li>• Obtener calificación perfecta en 3 evaluaciones</li>
                  <li>• Ayudar a 5 compañeros en sus dudas</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/home-admin/badges')}
                  disabled={loading || success}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando...
                    </>
                  ) : success ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      ¡Creado!
                    </>
                  ) : (
                    'Crear Insignia'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}