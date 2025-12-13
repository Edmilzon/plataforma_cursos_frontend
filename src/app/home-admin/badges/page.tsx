'use client';

import { useRouter } from 'next/navigation';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';
import { useBadges } from '@/hooks/useBadges';

export default function BadgesAdminPage() {
  const router = useRouter();
  const { 
    displayBadges, 
    loading, 
    error, 
    deleteBadge,
    stats 
  } = useBadges();

  const handleCreate = () => {
    router.push('/home-admin/badges/create');
  };

  const handleEdit = (id: number) => {
    router.push(`/home-admin/badges/edit/${id}`);
  };

  const handleAssign = async (badgeId: number) => {
    const userId = prompt('Ingresa el ID del usuario:');
    if (userId && !isNaN(Number(userId))) {
      try {
        const { assignBadge } = useBadges();
        await assignBadge(Number(userId), badgeId);
        alert('Insignia asignada exitosamente');
      } catch (err) {
        alert('Error al asignar insignia');
      }
    }
  };

  if (loading && displayBadges.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Cargando insignias...</div>
      </div>
    );
  }

  if (error && displayBadges.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Insignias</h1>
          <p className="text-gray-600 mt-2">Administra las insignias disponibles para los usuarios</p>
        </div>
      </div>

      {/* Botón para crear nueva insignia */}
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Nueva Insignia
        </button>
      </div>

      {/* Lista de insignias */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBadges.map((badge) => (
            <div key={badge.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      {badge.imagen_url ? (
                        <img 
                          src={badge.imagen_url} 
                          alt={badge.nombre}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <div className="text-2xl">🏆</div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{badge.nombre}</h3>
                      <p className="text-gray-600">{badge.descripcion}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-500">{badge.categoria}</span>
                        <span className="mx-2">•</span>
                        <span className="text-sm font-medium text-blue-600">
                          Criterio: {badge.criterio}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={() => handleAssign(badge.id)}
                    className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium"
                  >
                    Asignar
                  </button>
                  <button 
                    onClick={() => handleEdit(badge.id)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => deleteBadge(badge.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Estadísticas de Insignias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total Insignias</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Insignias Activas</p>
              <p className="text-2xl font-bold text-gray-900">{displayBadges.length}</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}