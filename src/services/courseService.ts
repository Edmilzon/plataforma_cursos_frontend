// Utiliza variables de entorno para la URL de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

const courseGradients = [
  'bg-gradient-to-br from-red-500 to-orange-500',
  'bg-gradient-to-br from-cyan-500 to-blue-500',
  'bg-gradient-to-br from-emerald-500 to-lime-600',
];

export interface NewCoursePayload {
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  duracion: number;
  precio: number;
  modalidad: string;  
  id_docente: number;
  id_tipo_curso: number;
  cupo: number;
  imagen_portada_url: string;
}

export interface ModulePayload {
  nombre: string;
  descripcion: string;
  orden: number;
}

export interface LessonPayload {
  titulo: string;
  contenido: string;
  url_recurso?: string;
  orden: number;
}

export interface Submission {
  id_entrega: number;
  id_usuario: number;
  nombre_estudiante: string;
  id_actividad: number;
  titulo_actividad: string;
  tipo_actividad: 'Tarea' | 'Evaluacion' | string;
  fecha_entrega: string;
  url_respuesta?: string;
  texto_respuesta?: string;
  calificacion: number | null;
  estado: 'Pendiente' | 'Calificado';
}

export interface GradePayload {
  calificacion: number;
}

// TODO: Definir interfaces para Tareas y Evaluaciones
// export interface AssignmentPayload { ... }

// Helper para manejar respuestas de la API y errores
async function handleApiResponse(response: Response, errorMessage: string) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: errorMessage }));
    throw new Error(errorData.message || 'Ocurrió un error inesperado.');
  }
  return response.json();
}

export const courseService = {
  async getAllCourses() {
    const response = await fetch(`${API_BASE_URL}/cursos`);
    if (!response.ok) {
      throw new Error('Error al obtener los cursos');
    }
    const apiCourses = await response.json();
    console.log(" ESTRUCTURA DE CURSOS:", apiCourses);
    if (!Array.isArray(apiCourses)) {
      console.error("La respuesta de la API no es un array:", apiCourses);
      return [];
    }
    return apiCourses.map((course, index) => ({
      ...course,
      gradient: courseGradients[index % courseGradients.length],
    }));
  },

  async createCourse(courseData: NewCoursePayload) {
    const response = await fetch(`${API_BASE_URL}/cursos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });

    return handleApiResponse(response, 'Error al crear el curso');
  },

  async getCourseById(courseId: string) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}`);
    if (!response.ok) {
      throw new Error('Error al obtener el curso');
    }
    return response.json();
  },

  async updateCourse(courseId: string, courseData: Partial<NewCoursePayload>) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    return handleApiResponse(response, 'Error al actualizar el curso');
  },

  async deleteCourse(courseId: string) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el curso');
    }
  },

  async getModulesByCourse(courseId: string) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/modulos`);
    if (!response.ok) {
      return [];
    }
    return response.json();
  },

  async createModule(courseId: string, moduleData: ModulePayload) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/modulos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moduleData),
    });
    return handleApiResponse(response, 'Error al crear el módulo');
  },

  async updateModule(courseId: string, moduleId: string, moduleData: ModulePayload) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/modulos/${moduleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moduleData),
    });
    return handleApiResponse(response, 'Error al actualizar el módulo');
  },

  async deleteModule(courseId: string, moduleId: string) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/modulos/${moduleId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el módulo');
    }
  },

  async getSchedulesByCourse(courseId: string) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/horarios`);
    if (!response.ok) {
      return []; 
    }
    return response.json();
  },

  async createSchedule(courseId: string, scheduleData: { dia_semana: string; hora_inicio: string; hora_fin: string }) {
    const payload = {
      ...scheduleData,
      hora_inicio: `${scheduleData.hora_inicio}:00`,
      hora_fin: `${scheduleData.hora_fin}:00`,
    };

    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/horarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleApiResponse(response, 'Error al crear el horario');
  },

  async updateSchedule(courseId: string, scheduleId: string, scheduleData: { dia_semana: string; hora_inicio: string; hora_fin: string }) {
    const payload = {
      ...scheduleData,
      hora_inicio: scheduleData.hora_inicio.includes(':00') ? scheduleData.hora_inicio : `${scheduleData.hora_inicio}:00`,
      hora_fin: scheduleData.hora_fin.includes(':00') ? scheduleData.hora_fin : `${scheduleData.hora_fin}:00`,
    };
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/horarios/${scheduleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleApiResponse(response, 'Error al actualizar el horario');
  },

  async deleteSchedule(courseId: string, scheduleId: string) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/horarios/${scheduleId}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('Error al eliminar el horario');
    }
  },

  // --- Lecciones ---
  async getLessonsByModule(courseId: string, moduleId: string) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/modulos/${moduleId}/lecciones`);
    if (!response.ok) return [];
    return response.json();
  },

  async createLesson(courseId: string, moduleId: string, lessonData: LessonPayload) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/modulos/${moduleId}/lecciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    });
    return handleApiResponse(response, 'Error al crear la lección');
  },

  async updateLesson(lessonId: string, lessonData: Partial<LessonPayload>) {
    const response = await fetch(`${API_BASE_URL}/lecciones/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    });
    return handleApiResponse(response, 'Error al actualizar la lección');
  },

  async deleteLesson(lessonId: string) {
    const response = await fetch(`${API_BASE_URL}/lecciones/${lessonId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar la lección');
    }
  },

  // --- Tareas ---
  async getAssignmentsByLesson(lessonId: string) {
    const response = await fetch(`${API_BASE_URL}/lecciones/${lessonId}/tareas`);
    if (!response.ok) return [];
    return response.json();
  },

  async createAssignment(lessonId: string, assignmentData: any) { // TODO: Crear interface para assignmentData
    const response = await fetch(`${API_BASE_URL}/lecciones/${lessonId}/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData),
    });
    return handleApiResponse(response, 'Error al crear la tarea');
  },

  async updateAssignment(assignmentId: string, assignmentData: any) { // TODO: Crear interface para assignmentData
    const response = await fetch(`${API_BASE_URL}/lecciones/tareas/${assignmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData),
    });
    return handleApiResponse(response, 'Error al actualizar la tarea');
  },

  async deleteAssignment(assignmentId: string) {
    const response = await fetch(`${API_BASE_URL}/lecciones/tareas/${assignmentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar la tarea');
    }
  },

  // --- Evaluaciones ---
  async getEvaluationsByLesson(lessonId: string) {
    const response = await fetch(`${API_BASE_URL}/lecciones/${lessonId}/evaluaciones`);
    if (!response.ok) return [];
    return response.json();
  },

  async createEvaluation(lessonId: string, evaluationData: any) { // TODO: Crear interface para evaluationData
    const response = await fetch(`${API_BASE_URL}/lecciones/${lessonId}/evaluaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluationData),
    });
    return handleApiResponse(response, 'Error al crear la evaluación');
  },

  async updateEvaluation(evaluationId: string, evaluationData: any) { // TODO: Crear interface para evaluationData
    const response = await fetch(`${API_BASE_URL}/lecciones/evaluaciones/${evaluationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluationData),
    });
    return handleApiResponse(response, 'Error al actualizar la evaluación');
  },

  async deleteEvaluation(evaluationId: string) {
    const response = await fetch(`${API_BASE_URL}/lecciones/evaluaciones/${evaluationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar la evaluación');
    }
  },

  /**
   * Obtiene todos los cursos de un docente específico.
   */
  async getCoursesByTeacher(teacherId: number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/cursos/docente/${teacherId}`);
    if (!response.ok) {
      console.error('Error al obtener los cursos del docente');
      return [];
    }
    const apiCourses = await response.json();
    if (!Array.isArray(apiCourses)) {
      console.error("La respuesta de la API para cursos de docente no es un array:", apiCourses);
      return [];
    }
    return apiCourses.map((course, index) => ({
      ...course,
      gradient: courseGradients[index % courseGradients.length],
    }));
  },

  // --- Entregas y Calificaciones ---

  /**
   * Obtiene todas las entregas (tareas y evaluaciones) de un curso específico.
   */
  async getSubmissionsByCourse(courseId: string): Promise<Submission[]> {
    const response = await fetch(`${API_BASE_URL}/entregas/curso/${courseId}`);
    // Si la API devuelve 404, significa que no hay entregas. Devolvemos un array vacío.
    if (response.status === 404) {
      return [];
    }
    
    const data = await handleApiResponse(response, 'Error al obtener las entregas del curso.');

    // Mapeamos la respuesta de la API a la interfaz Submission que espera el frontend
    return data.map((item: any) => ({
      id_entrega: item.id_entrega, // Aseguramos que el id_entrega se mapee correctamente
      id_usuario: item.id_usuario,
      nombre_estudiante: `${item.nombre_usuario} ${item.apellido_usuario}`,
      id_actividad: item.id_actividad,
      titulo_actividad: item.titulo_actividad,
      tipo_actividad: item.tipo_actividad,
      calificacion: item.calificacion,
      url_respuesta: item.url_archivo, // Mapeo de url_archivo a url_respuesta
      fecha_entrega: item.fecha_entrega,
      estado: item.estado === 'Entregado' ? 'Pendiente' : item.estado, // Transformamos 'Entregado' a 'Pendiente'
    }));
  },

  /**
   * Obtiene una entrega específica por su ID.
   */
  async getSubmissionById(submissionId: string): Promise<Submission> {
    const response = await fetch(`${API_BASE_URL}/entregas/${submissionId}`);
    return handleApiResponse(response, 'Error al obtener la entrega.');
  },

  /**
   * Califica una entrega específica.
   */
  async gradeSubmission(submissionId: string, payload: GradePayload) {
    const response = await fetch(`${API_BASE_URL}/entregas/${submissionId}/calificar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleApiResponse(response, 'Error al calificar la entrega.');
  }
};