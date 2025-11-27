const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Insignia {
  id_insignia: number;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  fecha_otorgacion: string;
}

export const badgeService = {
  async getUserBadges(userId: number): Promise<Insignia[]> {
    const response = await fetch(`${API_URL}/insignias/usuario/${userId}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener las insignias del usuario');
    }
    return response.json();
  },
};