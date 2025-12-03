export async function getTasksByCourse(idCurso: string) {
  const res = await fetch(`http://localhost:5000/cursos/${idCurso}/tareas`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Error al obtener tareas del curso");
  return res.json();
}

export async function getDeliveriesByTask(idTarea: string) {
  const res = await fetch(`http://localhost:5000/tareas/${idTarea}/entregas`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Error al obtener entregas de la tarea");
  return res.json();
}

export async function gradeDelivery(idEntrega: string, calificacion: number) {
  const res = await fetch(
    `http://localhost:5000/entregas/${idEntrega}/calificar`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calificacion }),
    }
  );
  if (!res.ok) throw new Error("Error al calificar entrega");
  return res.json();
}
