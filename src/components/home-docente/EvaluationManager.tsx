// components/home-docente/EvaluationManager.tsx
'use client';
import { courseService } from '@/services/courseService';

import { useState, useEffect } from 'react';

interface Evaluation {
  id_evaluacion: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  calificacion_maxima: number;
  fecha_hora_inicio: string;
  fecha_hora_entrega: string;
  id_leccion: number;
}

interface EvaluationManagerProps {
  lessonId: string;
  onBack: () => void;
}

export default function EvaluationManager({ lessonId, onBack }: EvaluationManagerProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFinalEvaluation, setIsFinalEvaluation] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'Cuestionario',
    fecha_hora_inicio: '',
    fecha_hora_entrega: '',
    calificacion_maxima: 100,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<Evaluation | null>(null);

  useEffect(() => {
    if (lessonId) {
      loadEvaluations();
    }
  }, [lessonId]);

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const evaluationsData = await courseService.getEvaluationsByLesson(lessonId);
      setEvaluations(evaluationsData);
    } catch (err) {
      setError('No se pudieron cargar las evaluaciones.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (evaluation: Evaluation | null = null) => {
    setError(null);
    if (evaluation) {
      setEditingEvaluation(evaluation);
      // Lógica para detectar si es evaluación final
      const isFinal = evaluation.descripcion.includes('[FINAL]');
      setIsFinalEvaluation(isFinal);

      setFormData({
        titulo: evaluation.titulo,
        descripcion: evaluation.descripcion.replace('[FINAL]', '').trim(), // Limpiamos la etiqueta visualmente
        tipo: evaluation.tipo,
        fecha_hora_inicio: new Date(evaluation.fecha_hora_inicio).toISOString().substring(0, 16),
        fecha_hora_entrega: new Date(evaluation.fecha_hora_entrega).toISOString().substring(0, 16),
        calificacion_maxima: evaluation.calificacion_maxima,
      });
    } else {
      setEditingEvaluation(null);
      setIsFinalEvaluation(false); // Resetear checkbox
      setFormData({
        titulo: '',
        descripcion: '',
        tipo: 'Cuestionario',
        fecha_hora_inicio: '',
        fecha_hora_entrega: '',
        calificacion_maxima: 100,
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // 1. Preparamos la descripción con la marca [FINAL] si corresponde
      let finalDescriptionPayload = formData.descripcion.trim();
      if (isFinalEvaluation) {
        finalDescriptionPayload += ' [FINAL]';
      }

      // 2. Preparamos el payload (objeto a enviar)
      // La API espera 'YYYY-MM-DD HH:mm:ss', convertimos desde 'YYYY-MM-DDTHH:mm'
      const payload = {
        ...formData,
        descripcion: finalDescriptionPayload,
        fecha_hora_inicio: `${formData.fecha_hora_inicio.replace('T', ' ')}:00`,
        fecha_hora_entrega: `${formData.fecha_hora_entrega.replace('T', ' ')}:00`,
      };

      if (editingEvaluation) {
        await courseService.updateEvaluation(String(editingEvaluation.id_evaluacion), payload);
      } else {
        // @ts-ignore
        await courseService.createEvaluation(lessonId, payload);
      }
      setIsFormOpen(false);
      loadEvaluations();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la evaluación.');
    }
  };

  const openDeleteModal = (evaluation: Evaluation) => {
    setEvaluationToDelete(evaluation);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!evaluationToDelete) return;
    try {
      await courseService.deleteEvaluation(String(evaluationToDelete.id_evaluacion));
      setIsDeleteModalOpen(false);
      setEvaluationToDelete(null);
      loadEvaluations();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la evaluación.');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <button onClick={onBack} className="mb-4 text-sm text-blue-600 hover:underline">
        &larr; Volver a las lecciones
      </button>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Evaluaciones</h2>
        <button
          onClick={() => handleOpenForm()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          + Nueva Evaluación
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-4 text-gray-800">{editingEvaluation ? 'Editar Evaluación' : 'Crear Nueva Evaluación'}</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                value={formData.fecha_hora_inicio}
                onChange={(e) => setFormData({...formData, fecha_hora_inicio: e.target.value})}
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

          <div className="flex items-center gap-2 mb-6 p-3 bg-purple-50 border border-purple-200 rounded text-sm">
            <input
              type="checkbox"
              id="finalEvalCheck"
              checked={isFinalEvaluation}
              onChange={(e) => setIsFinalEvaluation(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="finalEvalCheck" className="font-medium text-gray-700 cursor-pointer select-none">
              Evaluación Final.
            </label>
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
              {editingEvaluation ? 'Actualizar Evaluación' : 'Crear Evaluación'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading && <p>Cargando evaluaciones...</p>}
        {!loading && evaluations.length === 0 && <p className="text-gray-500">No hay evaluaciones en esta lección.</p>}
        {evaluations.map(evaluation => (
          <div key={evaluation.id_evaluacion} className="border border-gray-200 rounded-lg p-4 mb-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{evaluation.titulo}</h3>
                <p className="text-gray-600 text-sm mb-2">{evaluation.descripcion}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="capitalize"><strong>Tipo:</strong> {evaluation.tipo}</span>
                  <span><strong>Máx:</strong> {evaluation.calificacion_maxima} pts</span>
                  <span><strong>Inicio:</strong> {new Date(evaluation.fecha_hora_inicio).toLocaleString()}</span>
                  <span><strong>Entrega:</strong> {new Date(evaluation.fecha_hora_entrega).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleOpenForm(evaluation)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                <button onClick={() => openDeleteModal(evaluation)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación de Borrado */}
      {isDeleteModalOpen && evaluationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar la evaluación "{evaluationToDelete.titulo}"? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}