'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { courseService, NewCoursePayload } from '@/services/courseService';
import NavbarDocente from '@/components/home-docente/NavbarDocente';

export default function CreateCoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<NewCoursePayload, 'id_docente'>>({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    duracion: 0,
    precio: 0,
    modalidad: 'Online',
    id_tipo_curso: 1, // Asumimos un tipo de curso por defecto, esto podría venir de una API
    cupo: 50,
    imagen_portada_url: 'https://via.placeholder.com/600x400.png?text=Portada+del+Curso'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const isNumeric = type === 'number';
    setFormData(prev => ({
      ...prev,
      [name]: isNumeric ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("No estás autenticado. No se puede crear el curso.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: NewCoursePayload = {
        ...formData,
        id_docente: user.id_usuario
      };

      const newCourse = await courseService.createCourse(payload);
      
      // Redirigir a la página de gestión del curso recién creado (puedes crear esta página después)
      alert('¡Curso creado exitosamente!');
      router.push(`/home-docente/cursos/${newCourse.id_curso}`);

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al crear el curso.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Crear Nuevo Curso</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título del Curso</label>
            <input type="text" name="titulo" id="titulo" value={formData.titulo} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea name="descripcion" id="descripcion" value={formData.descripcion} onChange={handleChange} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input type="date" name="fecha_inicio" id="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
              <input type="date" name="fecha_fin" id="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="duracion" className="block text-sm font-medium text-gray-700">Duración (horas)</label>
              <input type="number" name="duracion" id="duracion" value={formData.duracion} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700">Precio (USD)</label>
              <input type="number" name="precio" id="precio" step="0.01" value={formData.precio} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="cupo" className="block text-sm font-medium text-gray-700">Cupo</label>
              <input type="number" name="cupo" id="cupo" value={formData.cupo} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="modalidad" className="block text-sm font-medium text-gray-700">Modalidad</label>
              <select name="modalidad" id="modalidad" value={formData.modalidad} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option>Online</option>
                <option>Presencial</option>
                <option>Híbrido</option>
              </select>
            </div>
            <div>
              <label htmlFor="id_tipo_curso" className="block text-sm font-medium text-gray-700">Tipo de Curso</label>
              <select name="id_tipo_curso" id="id_tipo_curso" value={formData.id_tipo_curso} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                {/* Estos valores deberían venir de una API */}
                <option value={1}>Desarrollo Web</option>
                <option value={2}>Bases de Datos</option>
                <option value={3}>Ciencia de Datos</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="imagen_portada_url" className="block text-sm font-medium text-gray-700">URL de la Imagen de Portada</label>
            <input type="url" name="imagen_portada_url" id="imagen_portada_url" value={formData.imagen_portada_url} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
              {loading ? 'Creando...' : 'Crear Curso'}
            </button>
          </div>
        </form>
      </div>
      <NavbarDocente />
    </div>
  );
}