'use client';
import { useState, useEffect } from 'react';
import { courseService } from '@/services/courseService';

interface Schedule {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

interface ScheduleManagerProps {
  courseId: string;
}

export default function ScheduleManager({ courseId }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({ dia_semana: 'Lunes', hora_inicio: '', hora_fin: ''});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para el modal de confirmación de borrado
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await courseService.getSchedulesByCourse(courseId);
      setSchedules(data);
    } catch (err) {
      setError('No se pudieron cargar los horarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [courseId]);

  const handleOpenForm = (schedule: Schedule | null = null) => {
    setError(null);
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        dia_semana: schedule.dia_semana,
        hora_inicio: schedule.hora_inicio.substring(0, 5), 
        hora_fin: schedule.hora_fin.substring(0, 5),
      });
    } else {
      setEditingSchedule(null);
      setFormData({ dia_semana: 'Lunes', hora_inicio: '', hora_fin: '' });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingSchedule) {
        await courseService.updateSchedule(courseId, String(editingSchedule.id_horario), formData);
      } else {
        await courseService.createSchedule(courseId, formData);
      }
      setIsFormOpen(false);
      loadSchedules();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el horario.');
    }
  };

  const openDeleteModal = (schedule: Schedule) => {
    setScheduleToDelete(schedule);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      await courseService.deleteSchedule(courseId, String(scheduleToDelete.id_horario));
      setIsDeleteModalOpen(false);
      setScheduleToDelete(null);
      loadSchedules();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el horario.');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Horarios del Curso</h2>
        <button onClick={() => handleOpenForm()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">+ Nuevo Horario</button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-4 text-gray-800">{editingSchedule ? 'Editar Horario' : 'Crear Nuevo Horario'}</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
              <select value={formData.dia_semana} onChange={(e) => setFormData({...formData, dia_semana: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" required>
                {dias.map(dia => <option key={dia} value={dia}>{dia}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label><input type="time" value={formData.hora_inicio} onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label><input type="time" value={formData.hora_fin} onChange={(e) => setFormData({...formData, hora_fin: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" required /></div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingSchedule ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      )}
      <div className="space-y-3">
        {loading && <p>Cargando horarios...</p>}
        {!loading && schedules.length === 0 && <p className="text-gray-500">No hay horarios definidos para este curso.</p>}
        {schedules.map((schedule) => (
          <div key={schedule.id_horario} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
            <p className="font-semibold text-gray-800">{schedule.dia_semana}: <span className="font-normal text-gray-600">{schedule.hora_inicio} - {schedule.hora_fin}</span></p>
            <div className="flex space-x-3">
              <button onClick={() => handleOpenForm(schedule)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
              <button onClick={() => openDeleteModal(schedule)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación de Borrado */}
      {isDeleteModalOpen && scheduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar el horario de <strong className='text-gray-800'>{scheduleToDelete.dia_semana} de {scheduleToDelete.hora_inicio} a {scheduleToDelete.hora_fin}</strong>? Esta acción no se puede deshacer.</p>
            {error && <p className="text-red-500 mt-2">{error}</p>}
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