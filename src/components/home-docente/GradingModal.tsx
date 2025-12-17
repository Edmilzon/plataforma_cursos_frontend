'use client';

import { useState } from 'react';
import { courseService, Submission } from '@/services/courseService';

interface GradingModalProps {
  submission: Submission;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GradingModal({ submission, onClose, onSuccess }: GradingModalProps) {
  const [calificacion, setCalificacion] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calificacion === '' || calificacion < 0 || calificacion > 100) {
      setError('La calificación debe ser un número entre 0 y 100.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await courseService.gradeSubmission(String(submission.id_entrega), {
        calificacion: Number(calificacion),
      });
      alert('Calificación guardada exitosamente.');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar la calificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          aria-label="Cerrar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-bold mb-4 text-gray-900">Calificar Entrega</h3>

        <div className="space-y-3 mb-6 border-b pb-4">
          <p><strong>Actividad:</strong> {submission.titulo_actividad}</p>
          <p><strong>Estudiante:</strong> {submission.nombre_estudiante}</p>
          <p><strong>Fecha de Entrega:</strong> {new Date(submission.fecha_entrega).toLocaleString()}</p>
          {submission.texto_respuesta && (
            <div className="mt-2">
              <strong className="block mb-1">Respuesta de Texto:</strong>
              <p className="bg-gray-100 p-3 rounded-md border text-sm">{submission.texto_respuesta}</p>
            </div>
          )}
          {submission.url_respuesta && (
            <div className="mt-2">
              <strong className="block mb-1">Archivo Adjunto:</strong>
              <a
                href={submission.url_respuesta}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Ver archivo entregado
              </a>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="calificacion" className="block text-sm font-medium text-gray-700 mb-1">
              Calificación (0-100)
            </label>
            <input
              id="calificacion"
              type="number"
              min="0"
              max="100"
              value={calificacion}
              onChange={(e) => setCalificacion(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
              disabled={loading}
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
              {loading ? 'Guardando...' : 'Guardar Calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
