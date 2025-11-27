const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Reward {
  id_recompensa: number;
  nombre: string;
  descripcion:string;
  tipo: string;
  puntos_requeridos: number;
  cantidad_disponible: number;
  estado: string;
  imagen_url: string;
}

export const rewardsService = {
  /**
   * Obtiene todas las recompensas disponibles.
   */
  async getRewards(): Promise<Reward[]> {
    const response = await fetch(`${API_URL}/recompensas`);

    if (!response.ok) {
      console.error('Error al obtener las recompensas:', response.statusText);
      throw new Error('No se pudieron cargar las recompensas. Inténtalo de nuevo más tarde.');
    }

    return response.json();
  },

  /**
   * Canjea una recompensa para el usuario autenticado.
   * @param rewardId - El ID de la recompensa a canjear.
   * @param requiredPoints - Los puntos necesarios para la recompensa.
   */
  async redeemReward(rewardId: number, requiredPoints: number): Promise<any> {
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('Usuario no autenticado. Por favor, inicia sesión para canjear recompensas.');
    }

    const user = JSON.parse(userData);
    const userId = user.id_usuario;
    const userPoints = user.saldo_punto ?? 0;

    if (!userId) {
      throw new Error('No se pudo obtener la información del usuario.');
    }

    if (userPoints < requiredPoints) {
      throw new Error('No tienes suficientes puntos para canjear esta recompensa.');
    }

    const response = await fetch(`${API_URL}/recompensas/${rewardId}/canjear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido al canjear la recompensa.' }));
      throw new Error(errorData.message || 'Ocurrió un error al procesar tu solicitud.');
    }

    return response.json();
  },
};