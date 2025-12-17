// services/deliveryService.ts
const API_BASE_URL = 'http://127.0.0.1:5000';

export interface DeliveryPayload {
  id_usuario: number;
  id_tarea?: number;
  id_evaluacion?: number;
  url_archivo?: string;
}

export interface DeliveryResponse {
  message: string;
  entrega: {
    id_entrega: number;
    id_usuario: number;
    id_tarea?: number;
    id_evaluacion?: number;
    url_archivo?: string;
    estado: string;
    fecha_entrega: string;
    calificacion?: number;
  };
}

// Helper para obtener el usuario actual
const getCurrentUserId = (): number => {
  if (typeof window === 'undefined') return 0;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.error('No se encontró user en localStorage');
      return 0;
    }
    
    const user = JSON.parse(userStr);
    if (!user || !user.id_usuario) {
      console.error('Usuario no tiene id_usuario:', user);
      return 0;
    }
    
    return user.id_usuario;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return 0;
  }
};

// Helper para obtener el usuario completo
const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const deliveryService = {
  // Entregar una tarea
  async deliverAssignment(assignmentId: string, fileUrl: string): Promise<DeliveryResponse> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
    }

    const payload: DeliveryPayload = {
      id_usuario: userId,
      id_tarea: parseInt(assignmentId),
      url_archivo: fileUrl
    };

    console.log('Enviando entrega de tarea:', payload);

    const response = await fetch(`${API_BASE_URL}/entregas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al entregar la tarea');
    }

    return response.json();
  },

  // Entregar una evaluación
  async deliverEvaluation(evaluationId: string): Promise<DeliveryResponse> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
    }

    const payload: DeliveryPayload = {
      id_usuario: userId,
      id_evaluacion: parseInt(evaluationId)
    };

    console.log('Enviando entrega de evaluación:', payload);

    const response = await fetch(`${API_BASE_URL}/entregas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al entregar la evaluación');
    }

    return response.json();
  },

  // Obtener entregas de un usuario para una tarea específica
  async getAssignmentDelivery(assignmentId: string) {
    try {
      const userId = getCurrentUserId();
      if (!userId) return null;

      const response = await fetch(`${API_BASE_URL}/entregas/tarea/${assignmentId}/usuario/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting assignment delivery:', error);
      return null;
    }
  },

  // Obtener entregas de un usuario para una evaluación específica
  async getEvaluationDelivery(evaluationId: string) {
    try {
      const userId = getCurrentUserId();
      if (!userId) return null;

      const response = await fetch(`${API_BASE_URL}/entregas/evaluacion/${evaluationId}/usuario/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting evaluation delivery:', error);
      return null;
    }
  },

  // Marcar una lección como completada
  async markLessonAsCompleted(lessonId: number): Promise<{ success: boolean }> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado.');
    }

    // Asumiendo un endpoint como /progreso/leccion
    const response = await fetch(`${API_BASE_URL}/progreso/leccion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: userId,
        id_leccion: lessonId,
        completado: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al marcar la lección como completada');
    }
    return { success: true };
  },

  // Obtener todas las entregas de un usuario para un curso específico
  async getAllUserDeliveriesForCourse(courseId: string): Promise<any[]> {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No se pudo obtener el ID de usuario para buscar entregas.');
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/entregas/usuario/${userId}/curso/${courseId}`);
      if (response.status === 404) {
        return []; // No hay entregas, es un caso normal.
      }
      if (!response.ok) {
        throw new Error(`Error al obtener las entregas del usuario para el curso ${courseId}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error en getAllUserDeliveriesForCourse:', error);
      return [];
    }
  },

  // Obtener progreso de lección
  async getLessonProgress(id_leccion: number) {
    try {
      const userId = getCurrentUserId();
      if (!userId) return { completado: false };

      const response = await fetch(`${API_BASE_URL}/entregas/progreso/${userId}/${id_leccion}`);
      if (!response.ok) {
        return { completado: false };
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting lesson progress:', error);
      return { completado: false };
    }
  },

  // Método para debug: verificar información del usuario
  debugUserInfo() {
    const user = getCurrentUser();
    const userId = getCurrentUserId();
    
    console.log('🔍 Debug - Información del usuario:', {
      userEnLocalStorage: user,
      userIdObtenido: userId,
      localStorageKeys: typeof window !== 'undefined' ? Object.keys(localStorage) : 'No disponible'
    });
    
    return { user, userId };
  }
};