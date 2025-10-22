// components/home-docente/EvaluationManager.tsx
'use client';

import { useState, useEffect } from 'react';

interface Evaluation {
  id_evaluacion: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha_hora_entrega: string;
  fecha_de_inicio: string;
  calificacion_maxima: number;
  id_leccion: number;
}

interface Lesson {
  id_leccion: number;
  titulo: string;
}

interface EvaluationManagerProps {
  courseId: string;
}

export default function EvaluationManager({ courseId }: EvaluationManagerProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'quiz',
    fecha_hora_entrega: '',
    fecha_de_inicio: '',
    calificacion_maxima: 100,
    id_leccion: 0
  });

  useEffect(() => {
    loadLessons();
    loadEvaluations();
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

  const loadEvaluations = async () => {
    // Simular carga de evaluaciones
    setTimeout(() => {
      setEvaluations([
        { 
          id_evaluacion: 1, 
          titulo: 'Quiz de introducción', 
          descripcion: 'Evaluación de conceptos básicos', 
          tipo: 'quiz', 
          fecha_hora_entrega: '2024-12-31T23:59', 
          fecha_de_inicio: '2024-12-01T00:00', 
          calificacion_maxima: 100, 
          id_leccion: 1 
        }
      ]);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creando evaluación:', formData);
    setShowForm(false);
    setFormData({ 
      titulo: '', 
      descripcion: '', 
      tipo: 'quiz', 
      fecha_hora_entrega: '', 
      fecha_de_inicio: '', 
      calificacion_maxima: 100, 
      id_leccion: 0 
    });
    loadEvaluations();
  };

  const handleLessonChange = (lessonId: string) => {
    setSelectedLesson(lessonId);
    setFormData({ ...formData, id_leccion: parseInt(lessonId) });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Evaluaciones</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          + Nueva Evaluación
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-4">Crear Nueva Evaluación</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              >
                <option value="quiz">Quiz</option>
                <option value="examen">Examen</option>
                <option value="proyecto">Proyecto</option>
                <option value="tarea">Tarea</option>
              </select>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="datetime-local"
                value={formData.fecha_de_inicio}
                onChange={(e) => setFormData({...formData, fecha_de_inicio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Entrega</label>
              <input
                type="datetime-local"
                value={formData.fecha_hora_entrega}
                onChange={(e) => setFormData({...formData, fecha_hora_entrega: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calificación Máxima</label>
              <input
                type="number"
                value={formData.calificacion_maxima}
                onChange={(e) => setFormData({...formData, calificacion_maxima: parseInt(e.target.value)})}
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
              Crear Evaluación
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {evaluations.map((evaluation) => (
          <div key={evaluation.id_evaluacion} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{evaluation.titulo}</h3>
                <p className="text-gray-600 text-sm mb-2">{evaluation.descripcion}</p>
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span className="capitalize">{evaluation.tipo}</span>
                  <span>Máx: {evaluation.calificacion_maxima} pts</span>
                  <span>Inicio: {new Date(evaluation.fecha_de_inicio).toLocaleDateString()}</span>
                  <span>Entrega: {new Date(evaluation.fecha_hora_entrega).toLocaleDateString()}</span>
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