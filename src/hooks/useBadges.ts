import { useState, useEffect, useCallback } from 'react';
import { badgeService, Badge, CreateBadgeDto, UpdateBadgeDto } from '@/services/badgeService';

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0 });

  // Cargar todas las insignias
  const loadBadges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await badgeService.getAllBadges();
      setBadges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar insignias');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      const statsData = await badgeService.getBadgeStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadBadges();
    loadStats();
  }, [loadBadges, loadStats]);

  // Crear nueva insignia
  const createBadge = useCallback(async (badgeData: CreateBadgeDto) => {
    setLoading(true);
    setError(null);
    try {
      // Validar datos
      const errors = badgeService.validateBadgeData(badgeData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const newBadge = await badgeService.createBadge(badgeData);
      setBadges(prev => [...prev, newBadge]);
      
      // Actualizar estadísticas
      await loadStats();
      
      return newBadge;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear insignia';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Actualizar insignia
  const updateBadge = useCallback(async (id: number, badgeData: UpdateBadgeDto) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBadge = await badgeService.updateBadge(id, badgeData);
      setBadges(prev => prev.map(badge => 
        badge.id_insignia === id ? updatedBadge : badge
      ));
      return updatedBadge;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar insignia';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar insignia
  const deleteBadge = useCallback(async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta insignia?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await badgeService.deleteBadge(id);
      setBadges(prev => prev.filter(badge => badge.id_insignia !== id));
      
      // Actualizar estadísticas
      await loadStats();
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar insignia';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Buscar insignias
  const searchBadges = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await badgeService.searchBadgesByName(name);
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al buscar insignias';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Asignar insignia a usuario
  const assignBadge = useCallback(async (userId: number, badgeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await badgeService.assignBadgeToUser(userId, badgeId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al asignar insignia';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener insignias convertidas para UI
  const getDisplayBadges = useCallback(() => {
    return badges.map(badge => badgeService.convertToDisplayBadge(badge));
  }, [badges]);

  return {
    badges,
    displayBadges: getDisplayBadges(),
    loading,
    error,
    stats,
    loadBadges,
    createBadge,
    updateBadge,
    deleteBadge,
    searchBadges,
    assignBadge,
    refreshStats: loadStats,
  };
}