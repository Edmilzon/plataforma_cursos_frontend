'use client';

import { useEffect, useState } from 'react';
import { rewardsService } from '@/services/rewardsService';
import { BottomNavbar } from '@/components/BottomNavbar';

interface Reward {
  id_recompensa: number;
  nombre_recompensa: string;
  descripcion: string;
  costo_puntos: number;
  stock: number;
  canjeada: boolean;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) throw new Error('Usuario no encontrado en localStorage');
      const user = JSON.parse(userString);

      const res = await rewardsService.getRewardsWithUserStatus(user.id_usuario);
      
      setRewards(res.rewards || []);
      setUserPoints(user.saldo_punto || 0);
    } catch (err: any) {
      console.error(err);
      setError('No se pudieron cargar las recompensas');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id_usuario) {
        alert('Usuario no encontrado');
        return;
      }

      const res = await rewardsService.redeemReward(user.id_usuario, rewardId);
      alert(res.message);
      loadRewards();
    } catch (err: any) {
      alert(err.message || 'No fue posible canjear esta recompensa.');
    }
  };


  if (loading) return <p className="mt-24 text-center">Cargando...</p>;
  if (error) return <p className="mt-24 text-center text-red-500">{error}</p>;

  return (
    <>
      <div className="container mx-auto mt-24 px-4 pb-20">
        <h1 className="text-3xl font-bold">Puntos y Recompensas</h1>
        <p className="mt-2 text-gray-600">Puntos disponibles: <strong>{userPoints}</strong></p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rewards.map((r) => (
            <div key={r.id_recompensa} className="p-6 border rounded-lg shadow bg-white">
              <h2 className="text-xl font-semibold">{r.nombre_recompensa}</h2>
              <p className="text-gray-600 mt-2">{r.descripcion}</p>

              <p className="mt-4">Costo: <strong>{r.costo_puntos} puntos</strong></p>

              {r.stock <= 0 ? (
                <p className="mt-4 font-semibold text-red-600">Agotada</p>
              ) : userPoints < r.costo_puntos ? (
                <p className="mt-4 text-gray-500">No tienes suficientes puntos</p>
              ) : r.canjeada ? (
                <p className="mt-4 text-green-600 font-semibold">Ya canjeada</p>
              ) : (
                <button
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  onClick={() => handleRedeem(r.id_recompensa)}
                >
                  Canjear
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomNavbar />
    </>
  );
}
