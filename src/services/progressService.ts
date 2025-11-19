// services/progressService.ts
const API_BASE_URL = 'http://127.0.0.1:5000';

export const progressService = {
  // Obtener progreso del curso
  async getCourseProgress(courseId: string) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return null;

      // Obtener la inscripción para el curso
      const response = await fetch(`${API_BASE_URL}/inscripciones/estudiante/${userId}`);
      if (!response.ok) return null;
      
      const enrollments = await response.json();
      const courseEnrollment = enrollments.find((enrollment: any) => 
        enrollment.id_curso === parseInt(courseId)
      );
      
      return courseEnrollment || null;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  },

  // Marcar lección como completada
  async markLessonCompleted(lessonId: string) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/progreso-leccion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: parseInt(userId),
        id_leccion: parseInt(lessonId),
        completado: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al marcar lección como completada');
    }

    return response.json();
  },

  // Obtener lecciones completadas por el usuario
  async getCompletedLessons(courseId: string) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return [];

      const response = await fetch(`${API_BASE_URL}/progreso-leccion/usuario/${userId}/curso/${courseId}`);
      if (!response.ok) return [];
      
      return response.json();
    } catch (error) {
      console.error('Error getting completed lessons:', error);
      return [];
    }
  }
};