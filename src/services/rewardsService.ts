// src/services/rewardsService.ts
export const rewardsService = {
  getRewardsWithUserStatus: async (userId: number) => {
    try {
      const res = await fetch(`/api/rewards?userId=${userId}`);
      if (!res.ok) throw new Error('Error al cargar las recompensas');
      const data = await res.json();
      console.log(data);
      return {
        rewards: data.rewards || [],
        userPoints: data.userPoints || 0,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  redeemReward: async (userId: number, rewardId: number) => {
  try {
    const res = await fetch(`/Api/recompensas/${rewardId}/canjear`, {  // observa la mayúscula 'A' en Api
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: userId }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error al canjear la recompensa: ${text}`);
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Error al canjear la recompensa');
    return data;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}
};