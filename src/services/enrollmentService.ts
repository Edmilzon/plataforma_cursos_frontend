// services/enrollmentService.ts
const API_BASE_URL = 'http://127.0.0.1:5000';

export interface EnrollmentPayload {
  id_curso: number;
  id_estudiante: number;
  metodo_pago?: string;
  puntos_utilizados?: number;
}

export interface EnrollmentResponse {
  message: string;
  inscripcion: {
    id_inscripcion: number;
    fecha_inscripcion: string;
    estado_progreso: string;
    porcentaje_completado: string;
    id_curso: number;
    id_estudiante: number;
  };
}

export const enrollmentService = {
  // Verificar si el usuario está inscrito en un curso
  async checkEnrollment(courseId: string): Promise<boolean> {
    try {
      // Necesitamos obtener todas las inscripciones del usuario y verificar
      const userId = localStorage.getItem('userId');
      if (!userId) return false;

      const myCourses = await this.getMyCourses();
      return myCourses.some((course: any) => course.id_curso === parseInt(courseId));
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  },

  // Obtener cursos en los que el usuario está inscrito
  async getMyCourses() {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return [];

      const response = await fetch(`${API_BASE_URL}/inscripciones/estudiante/${userId}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting my courses:', error);
      return [];
    }
  },

  // Inscribirse en un curso
  async enrollInCourse(courseId: string, metodo_pago?: string, puntos_utilizados?: number): Promise<EnrollmentResponse> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const payload: EnrollmentPayload = {
      id_curso: parseInt(courseId),
      id_estudiante: parseInt(userId),
    };

    if (metodo_pago) {
      payload.metodo_pago = metodo_pago;
    }

    if (puntos_utilizados) {
      payload.puntos_utilizados = puntos_utilizados;
    }

    const response = await fetch(`${API_BASE_URL}/inscripciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al inscribirse en el curso');
    }

    return response.json();
  }
};