// services/enrollmentService.ts
const API_BASE_URL = 'http://127.0.0.1:5000';

export const enrollmentService = {
  async getMyCourses() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        return [];
      }

      const user = JSON.parse(userData);
      const userId = user.id_usuario;
      
      if (!userId) {
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/inscripciones/estudiante/${userId}`);
      
      if (!response.ok) {
        return [];
      }
      
      const inscripciones = await response.json();
      
      if (Array.isArray(inscripciones)) {
        return inscripciones.map((inscripcion: any) => ({
          id_curso: inscripcion.id_curso,
          titulo: inscripcion.titulo || inscripcion.titulo_curso || `Curso ${inscripcion.id_curso}`,
          descripcion: inscripcion.descripcion || `Continúa tu aprendizaje en este curso`,
          imagen_portada_url: inscripcion.imagen_portada_url || '/placeholder-course.jpg',
          progreso: parseFloat(inscripcion.porcentaje_completado) || 0
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting my courses:', error);
      return [];
    }
  },

  async checkEnrollment(courseId: string): Promise<boolean> {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return false;

      const user = JSON.parse(userData);
      const userId = user.id_usuario;
      
      if (!userId) return false;

      const myCourses = await this.getMyCourses();
      return myCourses.some((course: any) => course.id_curso === parseInt(courseId));
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  },

  async enrollInCourse(courseId: string, metodo_pago?: string, puntos_utilizados?: number): Promise<any> {
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('Usuario no autenticado');
    }

    const user = JSON.parse(userData);
    const userId = user.id_usuario;

    const payload: any = {
      id_curso: parseInt(courseId),
      id_estudiante: userId,
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