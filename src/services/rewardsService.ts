// services/rewardsService.ts
export const rewardsService = {
  getRewardsWithUserStatus: async (userId: number) => {
    try {
      // Supongamos que tu backend tiene un endpoint que devuelve todas las recompensas
      // y marca cuáles el usuario ya canjeó
      const res = await fetch(`/api/rewards?userId=${userId}`);
      if (!res.ok) {
        throw new Error('Error al cargar las recompensas');
      }
      const data = await res.json();
      return data; // debe devolver un array con { id_recompensa, nombre, descripcion, puntos_requeridos, cantidad_disponible, estado, imagen_url, canjeada }
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
