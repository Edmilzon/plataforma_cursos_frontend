'use client';
import { useEffect, useState } from 'react';

interface Assignment {
  id_entrega: number;
  id_usuario: number;
  id_tarea?: number;
  url_archivo?: string;
  estado: string;
  fecha_entrega: string;
  calificacion?: number | null;
  nombre_estudiante: string;
  nombre_tarea: string;
}

interface Props {
  idCurso: string;
}

export default function AssignmentGrading({ idCurso }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cambiamos el tipo para permitir number | undefined
  const [grading, setGrading] = useState<{ [key: number]: number | undefined }>({});

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/entregas/curso/${idCurso}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setAssignments(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setError('No se pudieron cargar las entregas. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, [idCurso]);

  const handleGrade = async (id_entrega: number) => {
    const grade = grading[id_entrega];
    
    if (grade === undefined || grade < 0 || grade > 100) {
      alert('Ingresa una calificación válida entre 0 y 100');
      return;
    }
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/entregas/${id_entrega}/calificar`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ calificacion: grade }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const updated = await response.json();
      
      // Actualizar la lista de entregas
      setAssignments(prev => 
        prev.map(a => a.id_entrega === id_entrega ? updated : a)
      );
      
      // Limpiar el valor temporal de grading para esta entrega
      setGrading(prev => {
        const newGrading = { ...prev };
        delete newGrading[id_entrega];
        return newGrading;
      });
      
      alert('Calificación registrada exitosamente');
    } catch (error) {
      console.error('Error al calificar:', error);
      alert('Error al calificar la entrega. Verifica la conexión.');
    }
  };

  const handleGradeChange = (id_entrega: number, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    
    // Solo actualizar si es undefined o un número válido entre 0 y 100
    if (numValue === undefined || (numValue >= 0 && numValue <= 100)) {
      setGrading(prev => ({
        ...prev,
        [id_entrega]: numValue
      }));
    }
  };

  if (loading) return <p>Cargando entregas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (assignments.length === 0) return <p>No hay entregas para calificar.</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Calificar entregas del curso</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Estudiante</th>
              <th className="py-2 px-4 border-b text-left">Tarea</th>
              <th className="py-2 px-4 border-b text-left">Archivo</th>
              <th className="py-2 px-4 border-b text-left">Calificación Actual</th>
              <th className="py-2 px-4 border-b text-left">Nueva Calificación</th>
              <th className="py-2 px-4 border-b text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id_entrega} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{a.nombre_estudiante}</td>
                <td className="py-2 px-4 border-b">{a.nombre_tarea}</td>
                <td className="py-2 px-4 border-b">
                  {a.url_archivo ? (
                    <a 
                      href={a.url_archivo} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver archivo
                    </a>
                  ) : (
                    <span className="text-gray-500">No entregado</span>
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {a.calificacion !== null && a.calificacion !== undefined 
                    ? `${a.calificacion}/100` 
                    : 'Sin calificar'}
                </td>
                <td className="py-2 px-4 border-b">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0-100"
                    value={grading[a.id_entrega] ?? ''}
                    onChange={e => handleGradeChange(a.id_entrega, e.target.value)}
                    className="w-24 px-2 py-1 border rounded"
                  />
                </td>
                <td className="py-2 px-4 border-b">
                  <button 
                    onClick={() => handleGrade(a.id_entrega)}
                    disabled={grading[a.id_entrega] === undefined}
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Calificar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}