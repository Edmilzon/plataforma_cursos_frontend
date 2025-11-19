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

export const deliveryService = {
  // Entregar una tarea
  async deliverAssignment(assignmentId: string, fileUrl: string): Promise<DeliveryResponse> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const payload: DeliveryPayload = {
      id_usuario: parseInt(userId),
      id_tarea: parseInt(assignmentId),
      url_archivo: fileUrl
    };

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
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const payload: DeliveryPayload = {
      id_usuario: parseInt(userId),
      id_evaluacion: parseInt(evaluationId)
    };

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
      const userId = localStorage.getItem('userId');
      if (!userId) return null;

      // Esta endpoint necesitaría ser implementado en el backend
      const response = await fetch(`${API_BASE_URL}/entregas/tarea/${assignmentId}/usuario/${userId}`);
      if (!response.ok) return null;
      
      return response.json();
    } catch (error) {
      console.error('Error getting assignment delivery:', error);
      return null;
    }
  },

  // Obtener entregas de un usuario para una evaluación específica
  async getEvaluationDelivery(evaluationId: string) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return null;

      // Esta endpoint necesitaría ser implementado en el backend
      const response = await fetch(`${API_BASE_URL}/entregas/evaluacion/${evaluationId}/usuario/${userId}`);
      if (!response.ok) return null;
      
      return response.json();
    } catch (error) {
      console.error('Error getting evaluation delivery:', error);
      return null;
    }
  }
};  