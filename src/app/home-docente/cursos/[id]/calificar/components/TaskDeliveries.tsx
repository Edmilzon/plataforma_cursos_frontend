"use client";
import { useEffect, useState } from "react";
import { getDeliveriesByTask, gradeDelivery } from "../services/gradingService";

interface Props {
  idTarea: string;
  onBack: () => void;
}

export default function TaskDeliveries({ idTarea, onBack }: Props) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    getDeliveriesByTask(idTarea)
      .then(setDeliveries)
      .finally(() => setLoading(false));
  }, [idTarea]);

  async function handleGrade(idEntrega: string, calificacion: number) {
    setSending(idEntrega);
    await gradeDelivery(idEntrega, calificacion);
    const updated = await getDeliveriesByTask(idTarea);
    setDeliveries(updated);
    setSending(null);
  }

  if (loading) return <p>Cargando entregas...</p>;

  return (
    <div>
      <button onClick={onBack} className="mb-4 underline">
        ← Volver a tareas
      </button>

      <h2 className="text-xl font-semibold mb-4">Entregas de la tarea</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Estudiante</th>
            <th className="p-2 text-left">Archivo</th>
            <th className="p-2 text-left">Calificación</th>
            <th className="p-2 text-left">Nueva calificación</th>
          </tr>
        </thead>

        <tbody>
          {deliveries.map((entrega) => (
            <tr key={entrega.id_entrega} className="border-b">
              <td className="p-2">{entrega.nombre_estudiante}</td>
              <td className="p-2">
                <a
                  href={entrega.url_archivo}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Ver archivo
                </a>
              </td>
              <td className="p-2">{entrega.calificacion ?? "—"}</td>

              <td className="p-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="border p-1 w-16"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const value = Number(
                        (e.target as HTMLInputElement).value
                      );
                      handleGrade(entrega.id_entrega, value);
                    }
                  }}
                  disabled={sending === entrega.id_entrega}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
