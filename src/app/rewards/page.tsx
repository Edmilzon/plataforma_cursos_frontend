'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { rewardsService, Reward } from '@/services/rewardsService';
import { BottomNavbar } from '@/components/BottomNavbar';

// --- Iconos ---
const PointsIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 ${className}`}><path d="m12 14 4-4"/><path d="M12 14 8 10"/><path d="M12 22a4.8 4.8 0 0 0 4-2 4.8 4.8 0 0 0 0-6 4.8 4.8 0 0 0-8 0 4.8 4.8 0 0 0 0 6 4.8 4.8 0 0 0 4 2Z"/><path d="M12 2a4.8 4.8 0 0 1 4 2 4.8 4.8 0 0 1 0 6 4.8 4.8 0 0 1-8 0 4.8 4.8 0 0 1 0-6 4.8 4.8 0 0 1 4-2Z"/></svg>;
const GiftIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;


export default function RewardsPage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  const userPoints = user?.saldo_punto ?? 0;

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoadingRewards(true);
        const availableRewards = await rewardsService.getRewards();
        setRewards(availableRewards);
      } catch (err: any) {
        setError('No se pudieron cargar las recompensas. Inténtalo de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoadingRewards(false);
      }
    };

    fetchRewards();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (!user) {
      alert('Debes iniciar sesión para canjear recompensas.');
      return;
    }

    if (userPoints < reward.puntos_requeridos) {
      alert('No tienes suficientes puntos para esta recompensa.');
      return;
    }

    const confirmation = confirm(`¿Estás seguro de que quieres canjear "${reward.nombre}" por ${reward.puntos_requeridos} puntos?`);
    if (!confirmation) return;

    setRedeemingId(reward.id_recompensa);
    try {
      await rewardsService.redeemReward(reward.id_recompensa, reward.puntos_requeridos);
      
      // Actualizar puntos del usuario en el contexto y localStorage
      const newPoints = userPoints - reward.puntos_requeridos;
      updateUser({ saldo_punto: newPoints });

      // Actualizar la cantidad disponible en la UI
      setRewards(prevRewards => 
        prevRewards.map(r => 
          r.id_recompensa === reward.id_recompensa 
            ? { ...r, cantidad_disponible: r.cantidad_disponible - 1 } 
            : r
        )
      );

      alert(`¡Has canjeado "${reward.nombre}" con éxito!`);

    } catch (err: any) {
      alert(`Error al canjear: ${err.message}`);
      console.error(err);
    } finally {
      setRedeemingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        Cargando...
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen text-gray-800">
        <div className="container mx-auto pt-20 px-4 pb-24">
          {/* --- Cabecera y Puntos del Usuario --- */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
              Tienda de Recompensas
            </h1>
            <p className="text-lg text-gray-600">
              Usa tus puntos para obtener increíbles beneficios.
            </p>
            {user && (
              <div className="mt-6 inline-flex items-center bg-white p-3 px-5 rounded-full shadow-md border border-gray-200">
                <PointsIcon className="text-green-500 mr-2" />
                <span className="text-xl font-bold text-gray-800">{userPoints}</span>
                <span className="ml-2 text-gray-600">Puntos Disponibles</span>
              </div>
            )}
          </div>

          {/* --- Galería de Recompensas --- */}
          {loadingRewards ? (
            <div className="text-center text-gray-500">Cargando recompensas...</div>
          ) : error ? (
            <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
          ) : rewards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {rewards.map((reward) => {
                const canAfford = userPoints >= reward.puntos_requeridos;
                const isAvailable = reward.cantidad_disponible > 0;
                const canRedeem = canAfford && isAvailable;
                const isBeingRedeemed = redeemingId === reward.id_recompensa;

                return (
                  <div
                    key={reward.id_recompensa}
                    className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 ${!canRedeem ? 'opacity-60' : 'hover:shadow-xl hover:-translate-y-1'}`}
                  >
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      <img src={`${process.env.NEXT_PUBLIC_API_URL}${reward.imagen_url}`} alt={reward.nombre} className="h-full w-full object-contain p-4" />
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-gray-900">{reward.nombre}</h3>
                      <p className="text-sm text-gray-600 mt-1 flex-grow">{reward.descripcion}</p>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center font-bold text-blue-600">
                            <PointsIcon className="mr-1.5 text-blue-500" />
                            {reward.puntos_requeridos} Puntos
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {reward.cantidad_disponible} disponibles
                          </span>
                        </div>

                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={!canRedeem || isBeingRedeemed}
                          className={`w-full text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                            canRedeem ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                          } ${isBeingRedeemed ? 'bg-blue-400' : ''}`}
                        >
                          <GiftIcon className="mr-2" />
                          {isBeingRedeemed ? 'Canjeando...' : (canAfford ? 'Canjear' : 'Puntos insuficientes')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-100 rounded-2xl">
              <p className="text-gray-500">No hay recompensas disponibles en este momento.</p>
            </div>
          )}
        </div>
      </div>
      <BottomNavbar />
    </>
  );
}