'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';
import { badgeService } from '@/services/badgeService';

export default function EditBadgePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen_url: '',
    criterio: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBadge = async () => {
      try {
        const badge = await badgeService.getBadgeById(id);
        setFormData({
          nombre: badge.nombre,
          descripcion: badge.descripcion,
          imagen_url: badge.imagen_url,
          criterio: badge.criterio
        });
      } catch (err) {
        setError('Error al cargar la insignia');
      } finally {
        setLoadingPage(false);
      }
    };

    if (id) {
      loadBadge();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validar datos
      const errors = badgeService.validateBadgeData(formData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      await badgeService.updateBadge(id, formData);
      router.push('/home-admin/badges');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar insignia');
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

  if (loadingPage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Insignia</h1>
              <p className="text-gray-600 mt-2">Modifica los detalles de la insignia</p>
            </div>
            <button
              onClick={() => router.push('/home-admin/badges')}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://ejemplo.com/insignia.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Criterio *
              </label>
              <textarea
                name="criterio"
                value={formData.criterio}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Completar 5 cursos, Alcanzar 1000 puntos, etc."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/home-admin/badges')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Actualizando...' : 'Actualizar Insignia'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}