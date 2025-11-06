// components/home-docente/LessonManager.tsx
'use client';
import { courseService } from '@/services/courseService';

import { useState, useEffect } from 'react';

interface Lesson {
  id_leccion: number;
  titulo: string;
  contenido: string;
  url_recurso: string;
  orden: number;
  id_modulo: number;
}

interface LessonManagerProps {
  courseId: string;
  moduleId: string;
  onManageSubContent: (lessonId: string, lessonName: string, type: 'assignments' | 'evaluations') => void;
}

const INITIAL_FORM_STATE = {
  titulo: '',
  contenido: '',
  url_recurso: '',
  orden: 1,
  // id_modulo no es necesario en el payload, se pasa por URL.
};

export default function LessonManager({ courseId, moduleId, onManageSubContent }: LessonManagerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    if (moduleId) {
      loadLessons();
    }
  }, [moduleId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null && !(event.target as Element).closest(`.dropdown-container-${openDropdownId}`)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const lessonsData = await courseService.getLessonsByModule(courseId, moduleId);
      setLessons(lessonsData.sort((a: Lesson, b: Lesson) => a.orden - b.orden));
    } catch (err) {
      setError('No se pudieron cargar las lecciones.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (lesson: Lesson | null = null) => {
    setError(null);
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        titulo: lesson.titulo,
        contenido: lesson.contenido,
        url_recurso: lesson.url_recurso || '',
        orden: lesson.orden,
      });
    } else {
      setEditingLesson(null);
      setFormData({ ...INITIAL_FORM_STATE, orden: lessons.length + 1 });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!moduleId) {
      setError('ID de módulo no válido.');
      return;
    }

    try {
      const payload = {
        ...formData,
        orden: Number(formData.orden) || 1
      };

      if (editingLesson) {
        await courseService.updateLesson(String(editingLesson.id_leccion), payload);
      } else {
        await courseService.createLesson(courseId, moduleId, payload); 
      }

      setIsFormOpen(false);
      loadLessons(); 
    } catch (err: any) {
      setError(err.message || 'Error al guardar la lección.');
    }
  };

  const openDeleteModal = (lesson: Lesson) => {
    setLessonToDelete(lesson);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!lessonToDelete) return;
    try {
      await courseService.deleteLesson(String(lessonToDelete.id_leccion));
      setIsDeleteModalOpen(false);
      setLessonToDelete(null);
      loadLessons();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la lección.');
      setIsDeleteModalOpen(false);
    }
  };

  const toggleDropdown = (lessonId: number) => {
    setOpenDropdownId(openDropdownId === lessonId ? null : lessonId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Lecciones</h2>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          + Nueva Lección
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-4 text-gray-800">{editingLesson ? 'Editar Lección' : 'Crear Nueva Lección'}</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input
                type="number"
                value={formData.orden}
                onChange={(e) => {
                  const value = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                  setFormData({...formData, orden: isNaN(value) ? 1 : value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <textarea
              value={formData.contenido}
              onChange={(e) => setFormData({...formData, contenido: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              rows={4}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Recurso (opcional)</label>
            <input
              type="url"
              value={formData.url_recurso}
              onChange={(e) => setFormData({...formData, url_recurso: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="https://ejemplo.com/recurso"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingLesson ? 'Actualizar Lección' : 'Crear Lección'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading && <p>Cargando lecciones...</p>}
        {!loading && lessons.length === 0 && <p className="text-gray-500">No hay lecciones en este módulo.</p>}
        {lessons.map((lesson) => (
          <div key={lesson.id_leccion} className="border border-gray-200 rounded-lg p-4 mb-2 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{lesson.titulo}</h3>
                <p className="text-gray-600 text-sm mb-2">{lesson.contenido}</p>
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span>Orden: {lesson.orden}</span>
                  {lesson.url_recurso && <span className="text-blue-600">Tiene recurso</span>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Botones de gestión de contenido */}
                <button onClick={() => onManageSubContent(String(lesson.id_leccion), lesson.titulo, 'assignments')} className="px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors">Tareas</button>
                <button onClick={() => onManageSubContent(String(lesson.id_leccion), lesson.titulo, 'evaluations')} className="px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors">Evaluaciones</button>
                
                {/* Dropdown para más acciones */}
                <div className={`relative dropdown-container-${lesson.id_leccion}`}>
                  <button onClick={() => toggleDropdown(lesson.id_leccion)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  {openDropdownId === lesson.id_leccion && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <ul className="py-1">
                        <li>
                          <button onClick={() => { handleOpenForm(lesson); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Editar Lección
                          </button>
                        </li>
                        <li>
                          <button onClick={() => { openDeleteModal(lesson); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                            Eliminar Lección
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación de Borrado */}
      {isDeleteModalOpen && lessonToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar la lección "{lessonToDelete.titulo}"? Se eliminarán también todas sus tareas y evaluaciones. Esta acción no se puede deshacer.</p>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
