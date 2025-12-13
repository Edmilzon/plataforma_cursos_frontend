const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Insignia {
  id_insignia: number;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  fecha_otorgacion: string;
}

export interface Badge {
  id_insignia: number;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  criterio: string;
}

export interface CreateBadgeDto {
  nombre: string;
  descripcion: string;
  imagen_url: string;
  criterio: string;
}

export interface UpdateBadgeDto {
  nombre?: string;
  descripcion?: string;
  imagen_url?: string;
  criterio?: string;
}

export interface BadgeStats {
  total: number;
}

export const badgeService = {
  // ==================== MÉTODOS PARA USUARIOS ====================
  
  async getUserBadges(userId: number): Promise<Insignia[]> {
    const response = await fetch(`${API_URL}/insignias/usuario/${userId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener las insignias del usuario');
    }
    return response.json();
  },

  // ==================== CRUD OPERATIONS ====================

  // Obtener todas las insignias
  async getAllBadges(): Promise<Badge[]> {
    const response = await fetch(`${API_URL}/insignias`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener insignias: ${response.statusText}`);
    }
    return response.json();
  },

  // Obtener una insignia por ID
  async getBadgeById(id: number): Promise<Badge> {
    const response = await fetch(`${API_URL}/insignias/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener insignia: ${response.statusText}`);
    }
    return response.json();
  },

  // Crear nueva insignia
  async createBadge(badgeData: CreateBadgeDto): Promise<Badge> {
    const response = await fetch(`${API_URL}/insignias`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(badgeData),
    });

    if (!response.ok) {
      throw new Error(`Error al crear insignia: ${response.statusText}`);
    }
    return response.json();
  },

  // Actualizar insignia
  async updateBadge(id: number, badgeData: UpdateBadgeDto): Promise<Badge> {
    const response = await fetch(`${API_URL}/insignias/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(badgeData),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar insignia: ${response.statusText}`);
    }
    return response.json();
  },

  // Eliminar insignia
  async deleteBadge(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/insignias/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar insignia: ${response.statusText}`);
    }
  },

  // ==================== MÉTODOS ADICIONALES ====================

  // Buscar insignias por nombre
  async searchBadgesByName(name: string): Promise<Badge[]> {
    const response = await fetch(`${API_URL}/insignias/search/buscar?nombre=${encodeURIComponent(name)}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al buscar insignias: ${response.statusText}`);
    }
    return response.json();
  },

  // Obtener estadísticas
  async getBadgeStats(): Promise<BadgeStats> {
    const response = await fetch(`${API_URL}/insignias/contar/total`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
    }
    return response.json();
  },

  // Asignar insignia a usuario
  async assignBadgeToUser(userId: number, badgeId: number): Promise<any> {
    const response = await fetch(`${API_URL}/insignias/asignar/${userId}/${badgeId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al asignar insignia: ${response.statusText}`);
    }
    return response.json();
  },

  // ==================== UTILIDADES ====================

  // Convertir Badge a formato para mostrar en UI
  convertToDisplayBadge(badge: Badge) {
    return {
      id: badge.id_insignia,
      nombre: badge.nombre,
      descripcion: badge.descripcion,
      imagen_url: badge.imagen_url,
      criterio: badge.criterio,
      // Puedes añadir campos calculados si necesitas
      categoria: this.getCategoryFromCriterio(badge.criterio),
      puntos_requeridos: this.extractPointsFromCriterio(badge.criterio),
    };
  },

  // Helper para extraer categoría del criterio
  getCategoryFromCriterio(criterio: string): string {
    if (criterio.toLowerCase().includes('completar') || criterio.toLowerCase().includes('curso')) {
      return 'Progreso';
    } else if (criterio.toLowerCase().includes('puntos') || criterio.toLowerCase().includes('score')) {
      return 'Logro';
    } else if (criterio.toLowerCase().includes('tiempo') || criterio.toLowerCase().includes('días')) {
      return 'Consistencia';
    }
    return 'General';
  },

  // Helper para extraer puntos del criterio
  extractPointsFromCriterio(criterio: string): number {
    const match = criterio.match(/\d+/);
    return match ? parseInt(match[0]) * 100 : 100; // Multiplicar por 100 como ejemplo
  },

  // Validar datos de creación
  validateBadgeData(data: CreateBadgeDto): string[] {
    const errors: string[] = [];

    if (!data.nombre || data.nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!data.descripcion || data.descripcion.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (!data.criterio || data.criterio.trim().length < 5) {
      errors.push('El criterio debe tener al menos 5 caracteres');
    }

    if (data.imagen_url && !this.isValidUrl(data.imagen_url)) {
      errors.push('La URL de la imagen no es válida');
    }

    return errors;
  },

  // Validar URL
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};