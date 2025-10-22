// components/home-docente/LessonManager.tsx
'use client';

import { useState, useEffect } from 'react';

interface Lesson {
  id_leccion: number;
  titulo: string;
  contenido: string;
  url_recurso: string;
  orden: number;
  id_modulo: number;
}

interface Module {
  id_modulo: number;
  nombre: string;
}

interface LessonManagerProps {
  courseId: string;
}

export default function LessonManager({ courseId }: LessonManagerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    url_recurso: '',
    orden: 1,
    id_modulo: 0
  });

  useEffect(() => {
    loadModules();
    loadLessons();
  }, [courseId]);

  const loadModules = async () => {
    // Simular carga de módulos
    setTimeout(() => {
      setModules([
        { id_modulo: 1, nombre: 'Módulo 1: Introducción' },
        { id_modulo: 2, nombre: 'Módulo 2: Contenido Principal' }
      ]);
    }, 500);
  };

  const loadLessons = async () => {
    // Simular carga de lecciones
    setTimeout(() => {
      setLessons([
        { 
          id_leccion: 1, 
          titulo: 'Introducción al curso', 
          contenido: 'Conceptos básicos y objetivos...', 
          url_recurso: '', 
          orden: 1, 
          id_modulo: 1 
        }
      ]);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creando lección:', formData);
    setShowForm(false);
    setFormData({ titulo: '', contenido: '', url_recurso: '', orden: 1, id_modulo: 0 });
    loadLessons();
  };

  const handleModuleChange = (moduleId: string) => {
    setSelectedModule(moduleId);
    setFormData({ ...formData, id_modulo: parseInt(moduleId) });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Lecciones</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          + Nueva Lección
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-4">Crear Nueva Lección</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
              <select
                value={selectedModule}
                onChange={(e) => handleModuleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              >
                <option value="">Seleccionar módulo</option>
                {modules.map((module) => (
                  <option key={module.id_modulo} value={module.id_modulo}>
                    {module.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input
                type="number"
                value={formData.orden}
                onChange={(e) => setFormData({...formData, orden: parseInt(e.target.value)})}
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
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Crear Lección
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id_leccion} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{lesson.titulo}</h3>
                <p className="text-gray-600 text-sm mb-2">{lesson.contenido}</p>
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span>Módulo: {modules.find(m => m.id_modulo === lesson.id_modulo)?.nombre}</span>
                  <span>Orden: {lesson.orden}</span>
                  {lesson.url_recurso && (
                    <span className="text-blue-600">Tiene recurso</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
