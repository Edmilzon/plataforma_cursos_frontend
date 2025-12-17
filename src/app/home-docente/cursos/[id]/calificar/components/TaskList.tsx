'use client';
import { useEffect, useState } from 'react';

interface Task {
  id_tarea: number;
  nombre: string;
}

interface Delivery {
  id_entrega: number;
  nombre_estudiante: string;
  url_archivo?: string;
  fecha_entrega: string;
  calificacion?: number | null;
}

interface Props {
  idCurso: string;
}

export default function TaskListGrading({ idCurso }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`http://127.0.0.1:5000/cursos/${idCurso}/tareas`);
        if (!res.ok) throw new Error('Error al cargar tareas');
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las tareas');
      }
    }
    fetchTasks();
  }, [idCurso]);

  const handleViewDeliveries = async (task: Task) => {
    setSelectedTask(task);
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/entregas/tarea/${task.id_tarea}`);
      if (!res.ok) throw new Error('Error al cargar entregas');
      const data = await res.json();
      setDeliveries(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las entregas de la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Tareas del curso</h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="mb-6">
        {tasks.map(task => (
          <li key={task.id_tarea} className="mb-2 flex justify-between items-center border p-2 rounded">
            <span>{task.nombre}</span>
            <button
              onClick={() => handleViewDeliveries(task)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ver entregas
            </button>
          </li>
        ))}
      </ul>

      {selectedTask && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Entregas de: {selectedTask.nombre}</h3>
          {loading ? (
            <p>Cargando entregas...</p>
          ) : deliveries.length === 0 ? (
            <p>No hay entregas para esta tarea.</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Estudiante</th>
                  <th className="py-2 px-4 border-b text-left">Archivo</th>
                  <th className="py-2 px-4 border-b text-left">Calificación</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(d => (
                  <tr key={d.id_entrega} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{d.nombre_estudiante}</td>
                    <td className="py-2 px-4 border-b">
                      {d.url_archivo ? (
                        <a href={d.url_archivo} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          Ver archivo
                        </a>
                      ) : (
                        <span className="text-gray-500">No entregado</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {d.calificacion !== null && d.calificacion !== undefined ? `${d.calificacion}/100` : 'Sin calificar'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
