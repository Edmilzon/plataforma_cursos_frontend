// components/home-docente/AssignmentManager.tsx
'use client';
import { courseService } from '@/services/courseService';

import { useState, useEffect } from 'react';

interface Assignment {
  id_tarea: number;
  titulo: string;
  descripcion: string;
  url_contenido: string;
  fecha_entrega: string;
  id_leccion: number;
}

interface AssignmentManagerProps {
  lessonId: string;
  onBack: () => void;
}

export default function AssignmentManager({ lessonId, onBack }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFinalTask, setIsFinalTask] = useState(false);
  const [description, setDescription] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    url_contenido: '',
    fecha_entrega: '',
  });

  const [esTrabajoFinal, setEsTrabajoFinal] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  useEffect(() => {
    if (lessonId) {
      loadAssignments();
    }
  }, [lessonId]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const assignmentsForLesson = await courseService.getAssignmentsByLesson(lessonId);
      setAssignments(assignmentsForLesson);
    } catch (err) {
      setError('No se pudieron cargar las tareas.');
    } finally {
      setLoading(false);
    }
  };

const handleOpenForm = (assignment: Assignment | null = null) => {
    setError(null);
    // Definimos la marca técnica que usamos en el backend
    const MARCA_FINAL = ''; 

    if (assignment) {
      setEditingAssignment(assignment);
      // Detectar si es tarea final y limpiar la descripción visual
      const isFinal = assignment.descripcion.includes('[FINAL]');
      setIsFinalTask(isFinal);
      
      setFormData({
        titulo: assignment.titulo,
        descripcion: assignment.descripcion.replace('[FINAL]', '').trim(),
        url_contenido: assignment.url_contenido || '',
        fecha_entrega: new Date(assignment.fecha_entrega).toISOString().split('T')[0],
      });
    } else {
      setEditingAssignment(null);
      setIsFinalTask(false); // Resetear el checkbox
      setFormData({
        titulo: '',
        descripcion: '',
        url_contenido: '',
        fecha_entrega: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Preparamos la descripción real agregando la marca si el checkbox está activo
    let finalDescriptionPayload = formData.descripcion.trim();
    if (isFinalTask) {
      finalDescriptionPayload += ' [FINAL]';
    }

    // 2. Creamos el objeto final a enviar (payload)
    const payload = {
      ...formData,
      descripcion: finalDescriptionPayload
    };

    try {
      if (editingAssignment) {
        // Usamos 'payload' en lugar de 'formData'
        await courseService.updateAssignment(String(editingAssignment.id_tarea), payload);
      } else {
        // Usamos 'payload' en lugar de 'formData'
        await courseService.createAssignment(lessonId, payload);
      }
      setIsFormOpen(false);
      loadAssignments();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la tarea.');
    }
  };

  const openDeleteModal = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await courseService.deleteAssignment(String(assignmentToDelete.id_tarea));
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
      loadAssignments();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la tarea.');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <button onClick={onBack} className="mb-4 text-sm text-blue-600 hover:underline">
        &larr; Volver a las lecciones
      </button>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Tareas</h2>
        <button
          onClick={() => handleOpenForm()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          + Nueva Tarea
        </button>
      </div>
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-4 text-gray-800">{editingAssignment ? 'Editar Tarea' : 'Crear Nueva Tarea'}</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}

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

          <div className="flex items-center gap-2 mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <input
              type="checkbox"
              id="finalTaskCheck"
              checked={isFinalTask}
              onChange={(e) => setIsFinalTask(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="finalTaskCheck" className="font-medium text-gray-700 cursor-pointer select-none">
              Tarea final del curso.
            </label>
          </div>

          <div className="flex justify-end space-x-2"></div>
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
              {editingAssignment ? 'Actualizar Tarea' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading && <p>Cargando tareas...</p>}
        {!loading && assignments.length === 0 && <p className="text-gray-500">No hay tareas en esta lección.</p>}
        {assignments.map(assignment => (
          <div key={assignment.id_tarea} className="border border-gray-200 rounded-lg p-4 mb-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{assignment.titulo}</h3>
                <p className="text-gray-600 text-sm mb-2">{assignment.descripcion}</p>
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span>Entrega: {new Date(assignment.fecha_entrega).toLocaleDateString()}</span>
                  {assignment.url_contenido && (
                    <a href={assignment.url_contenido} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver recursos</a>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleOpenForm(assignment)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                <button onClick={() => openDeleteModal(assignment)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación de Borrado */}
      {isDeleteModalOpen && assignmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar la tarea "{assignmentToDelete.titulo}"? Esta acción no se puede deshacer.</p>
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