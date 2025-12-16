// services/enrollmentService.ts
const API_BASE_URL = 'http://127.0.0.1:5000';

export const enrollmentService = {
  /**
   * Obtiene los cursos en los que el usuario está inscrito
   */
  async getMyCourses() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return [];

      const user = JSON.parse(userData);
      const userId = user.id_usuario;
      if (!userId) return [];

      const response = await fetch(`${API_BASE_URL}/inscripciones/estudiante/${userId}`);
      if (!response.ok) return [];

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

  /**
   * Verifica si el usuario está inscrito en un curso específico
   */
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

  /**
   * Obtiene los descuentos por recompensa disponibles para el usuario
   */
  async getDescuentosDisponibles(userId: number): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/inscripciones/descuentos-disponibles/${userId}`);
      if (!response.ok) {
        console.error('Error fetching descuentos:', response.status);
        return [];
      }
      
      const descuentos = await response.json();
      return Array.isArray(descuentos) ? descuentos : [];
    } catch (error) {
      console.error('Error getting descuentos disponibles:', error);
      return [];
    }
  },

  /**
   * Inscribe al usuario en un curso
   * @param courseId ID del curso
   * @param metodo_pago Método de pago (opcional)
   * @param id_canje_recompensa ID del canje de recompensa para aplicar descuento (opcional)
   */
  async enrollInCourse(
    courseId: string, 
    metodo_pago?: string, 
    id_canje_recompensa?: number
  ): Promise<any> {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('Usuario no autenticado');

    const user = JSON.parse(userData);
    const userId = user.id_usuario;

    if (!userId) throw new Error('ID de usuario no encontrado');

    const payload: any = {
      id_curso: parseInt(courseId),
      id_estudiante: userId,
    };

    // Solo agregar método de pago si se proporciona
    if (metodo_pago) {
      payload.metodo_pago = metodo_pago;
    }

    // Solo agregar id_canje_recompensa si se proporciona (no es 0 o null)
    if (id_canje_recompensa !== undefined && id_canje_recompensa !== null) {
      payload.id_canje_recompensa = id_canje_recompensa;
    }

    console.log('Enviando inscripción con payload:', payload);

    const response = await fetch(`${API_BASE_URL}/inscripciones`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = 'Error al inscribirse en el curso';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Si hay detalles específicos del error
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
      } catch (parseError) {
        // Si no se puede parsear la respuesta JSON
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Obtiene cursos populares con información de inscripciones
   */
  async getCoursesWithEnrollments(): Promise<any[]> {
    try {
      console.log('🔍 Obteniendo cursos populares...');
      
      const response = await fetch(`${API_BASE_URL}/ranking/courses/popularity`);
      if (!response.ok) {
        console.error('Error fetching popular courses:', response.status);
        return [];
      }
      
      const popularCourses = await response.json();
      console.log('📊 Cursos populares obtenidos:', popularCourses);
      
      return Array.isArray(popularCourses) ? popularCourses : [];
      
    } catch (error) {
      console.error('Error getting popular courses:', error);
      return [];
    }
  },

  /**
   * Obtiene el progreso de un usuario en un curso específico
   */
  async getCourseProgress(courseId: string): Promise<number> {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return 0;

      const user = JSON.parse(userData);
      const userId = user.id_usuario;
      if (!userId) return 0;

      const myCourses = await this.getMyCourses();
      const course = myCourses.find((c: any) => c.id_curso === parseInt(courseId));
      
      return course ? course.progreso : 0;
    } catch (error) {
      console.error('Error getting course progress:', error);
      return 0;
    }
  },

  /**
   * Obtiene información detallada de una inscripción específica
   */
  async getInscripcionDetails(inscripcionId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/inscripciones/${inscripcionId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting inscripcion details:', error);
      throw error;
    }
  },

  /**
   * Obtiene los datos del usuario actual
   */
  getCurrentUser(): any {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return null;
      
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Calcula el precio con descuento
   */
  calculatePriceWithDiscount(originalPrice: number, discountPercentage: number): number {
    if (discountPercentage <= 0) return originalPrice;
    
    const discountAmount = originalPrice * (discountPercentage / 100);
    const finalPrice = originalPrice - discountAmount;
    
    // Asegurarse de que el precio no sea negativo
    return Math.max(0, finalPrice);
  },

  /**
   * Formatea un precio para mostrar
   */
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
};