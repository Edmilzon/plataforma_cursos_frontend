const API_BASE_URL = 'http://127.0.0.1:5000';

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al crear el curso' }));
      throw new Error(errorData.message || 'No se pudo crear el curso.');
    }

    return response.json();
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al actualizar el curso' }));
      throw new Error(errorData.message || 'No se pudo actualizar el curso.');
    }
    return response.json();
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

  async createModule(courseId: string, moduleData: { nombre: string; descripcion: string; orden: number }) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/modulos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moduleData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al crear el módulo' }));
      throw new Error(errorData.message || 'No se pudo crear el módulo.');
    }
    return response.json();
  },

  async updateModule(courseId: string, moduleId: string, moduleData: { nombre: string; descripcion: string; orden: number }) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/modulos/${moduleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moduleData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al actualizar el módulo' }));
      throw new Error(errorData.message || 'No se pudo actualizar el módulo.');
    }
    return response.json();
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al crear el horario' }));
      throw new Error(errorData.message || 'No se pudo crear el horario.');
    }
    return response.json();
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al actualizar el horario' }));
      throw new Error(errorData.message || 'No se pudo actualizar el horario.');
    }
    return response.json();
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

  async createLesson(courseId: string, moduleId: string, lessonData: any) {
    const response = await fetch(`${API_BASE_URL}/cursos/${courseId}/modulos/${moduleId}/lecciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al crear la lección' }));
      throw new Error(errorData.message || 'No se pudo crear la lección.');
    }
    return response.json();
  },

  async updateLesson(lessonId: string, lessonData: any) {
    const response = await fetch(`${API_BASE_URL}/lecciones/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al actualizar la lección' }));
      throw new Error(errorData.message || 'No se pudo actualizar la lección.');
    }
    return response.json();
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

  async createAssignment(lessonId: string, assignmentData: any) {
    const response = await fetch(`${API_BASE_URL}/lecciones/${lessonId}/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al crear la tarea' }));
      throw new Error(errorData.message || 'No se pudo crear la tarea.');
    }
    return response.json();
  },

  async updateAssignment(assignmentId: string, assignmentData: any) {
    const response = await fetch(`${API_BASE_URL}/lecciones/tareas/${assignmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al actualizar la tarea' }));
      throw new Error(errorData.message || 'No se pudo actualizar la tarea.');
    }
    return response.json();
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

  async createEvaluation(lessonId: string, evaluationData: any) {
    const response = await fetch(`${API_BASE_URL}/lecciones/${lessonId}/evaluaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluationData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al crear la evaluación' }));
      throw new Error(errorData.message || 'No se pudo crear la evaluación.');
    }
    return response.json();
  },

  async updateEvaluation(evaluationId: string, evaluationData: any) {
    const response = await fetch(`${API_BASE_URL}/lecciones/evaluaciones/${evaluationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluationData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al actualizar la evaluación' }));
      throw new Error(errorData.message || 'No se pudo actualizar la evaluación.');
    }
    return response.json();
  },

  async deleteEvaluation(evaluationId: string) {
    const response = await fetch(`${API_BASE_URL}/lecciones/evaluaciones/${evaluationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar la evaluación');
    }
  }
};