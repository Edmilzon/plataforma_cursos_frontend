// components/home-docente/AssignmentManager.tsx
'use client';

import { useState, useEffect } from 'react';

interface Assignment {
  id_tarea: number;
  titulo: string;
  descripcion: string;
  url_contenido: string;
  fecha_entrega: string;
  id_leccion: number;
}

interface Lesson {
  id_leccion: number;
  titulo: string;
}

interface AssignmentManagerProps {
  courseId: string;
}

export default function AssignmentManager({ courseId }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    url_contenido: '',
    fecha_entrega: '',
    id_leccion: 0
  });

  useEffect(() => {
    loadLessons();
    loadAssignments();
  }, [courseId]);

  const loadLessons = async () => {
    // Simular carga de lecciones
    setTimeout(() => {
      setLessons([
        { id_leccion: 1, titulo: 'Introducción al curso' },
        { id_leccion: 2, titulo: 'Conceptos básicos' }
      ]);
    }, 500);
  };

  const loadAssignments = async () => {
    // Simular carga de tareas
    setTimeout(() => {
      setAssignments([
        { 
          id_tarea: 1, 
          titulo: 'Tarea de investigación', 
          descripcion: 'Investigar sobre los temas vistos', 
          url_contenido: 'https://ejemplo.com/recursos', 
          fecha_entrega: '2024-12-31', 
          id_leccion: 1 
        }
      ]);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creando tarea:', formData);
    setShowForm(false);
    setFormData({ 
      titulo: '', 
      descripcion: '', 
      url_contenido: '', 
      fecha_entrega: '', 
      id_leccion: 0 
    });
    loadAssignments();
  };

  const handleLessonChange = (lessonId: string) => {
    setSelectedLesson(lessonId);
    setFormData({ ...formData, id_leccion: parseInt(lessonId) });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Tareas</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          + Nueva Tarea
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-4">Crear Nueva Tarea</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lección</label>
            <select
              value={selectedLesson}
              onChange={(e) => handleLessonChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            >
              <option value="">Seleccionar lección</option>
              {lessons.map((lesson) => (
                <option key={lesson.id_leccion} value={lesson.id_leccion}>
                  {lesson.titulo}
                </option>
              ))}
            </select>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Contenido (opcional)</label>
              <input
                type="url"
                value={formData.url_contenido}
                onChange={(e) => setFormData({...formData, url_contenido: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="https://ejemplo.com/recursos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label>
              <input
                type="date"
                value={formData.fecha_entrega}
                onChange={(e) => setFormData({...formData, fecha_entrega: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Crear Tarea
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id_tarea} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{assignment.titulo}</h3>
                <p className="text-gray-600 text-sm mb-2">{assignment.descripcion}</p>
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span>Entrega: {new Date(assignment.fecha_entrega).toLocaleDateString()}</span>
                  {assignment.url_contenido && (
                    <a href={assignment.url_contenido} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Ver recursos
                    </a>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                <button className="text-green-600 hover:text-green-800 text-sm">Revisar</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}