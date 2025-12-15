// app/home-admin/recompensas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { adminService, Reward } from '@/services/adminServices';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';

type FormData = Omit<Reward, 'id_recompensa'>;

export default function RecompensasAdminPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    tipo: 'Digital',
    puntos_requeridos: 0,
    cantidad_disponible: 0,
    estado: 'Activo',
    imagen_url: '',
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRewards();
      setRewards(data);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar las recompensas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'puntos_requeridos' || name === 'cantidad_disponible' ? parseInt(value) : value }));
  };

  const openModal = (reward: Reward | null = null) => {
    setEditingReward(reward);
    if (reward) {
      setFormData({
        nombre: reward.nombre,
        descripcion: reward.descripcion,
        tipo: reward.tipo,
        puntos_requeridos: reward.puntos_requeridos,
        cantidad_disponible: reward.cantidad_disponible,
        estado: reward.estado,
        imagen_url: reward.imagen_url,
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: 'Digital',
        puntos_requeridos: 0,
        cantidad_disponible: 0,
        estado: 'Activo',
        imagen_url: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReward(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReward) {
        await adminService.updateReward(editingReward.id_recompensa!, formData);
      } else {
        await adminService.createReward(formData);
      }
      fetchRewards();
      closeModal();
    } catch (err) {
      console.error('Error guardando recompensa:', err);
      setError('No se pudo guardar la recompensa.');
    }
  };

  const handleDelete = async (rewardId: number) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta recompensa?')) {
      try {
        await adminService.deleteReward(rewardId);
        fetchRewards();
      } catch (err) {
        console.error('Error eliminando recompensa:', err);
        setError('No se pudo eliminar la recompensa.');
      }
    }
  };

  return (
    <>
      <div className="container mx-auto mt-10 px-4 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestionar Recompensas</h1>
          <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + Nueva Recompensa
          </button>
        </div>

        {loading && <p>Cargando recompensas...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rewards.map((reward) => (
                  <tr key={reward.id_recompensa}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{reward.nombre}</div>
                      <div className="text-sm text-gray-500">{reward.tipo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reward.puntos_requeridos}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reward.cantidad_disponible}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reward.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {reward.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(reward)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                      <button onClick={() => handleDelete(reward.id_recompensa!)} className="text-red-600 hover:text-red-900">Desactivar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{editingReward ? 'Editar' : 'Nueva'} Recompensa</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre de la recompensa" className="mt-1 w-full p-2 border rounded" required />
              </div>
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Detalles de la recompensa" className="mt-1 w-full p-2 border rounded" required />
              </div>
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo</label>
                <select id="tipo" name="tipo" value={formData.tipo} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded">
                  <option value="Digital">Digital</option>
                  <option value="Físico">Físico</option>
                </select>
              </div>
              <div>
                <label htmlFor="puntos_requeridos" className="block text-sm font-medium text-gray-700">Puntos Requeridos</label>
                <input type="number" id="puntos_requeridos" name="puntos_requeridos" value={formData.puntos_requeridos} onChange={handleInputChange} placeholder="Ej: 1500" className="mt-1 w-full p-2 border rounded" required />
              </div>
              <div>
                <label htmlFor="cantidad_disponible" className="block text-sm font-medium text-gray-700">Cantidad Disponible</label>
                <input type="number" id="cantidad_disponible" name="cantidad_disponible" value={formData.cantidad_disponible} onChange={handleInputChange} placeholder="Ej: 10" className="mt-1 w-full p-2 border rounded" required />
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
                <select id="estado" name="estado" value={formData.estado} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div>
                <label htmlFor="imagen_url" className="block text-sm font-medium text-gray-700">URL de la Imagen</label>
                <input type="text" id="imagen_url" name="imagen_url" value={formData.imagen_url} onChange={handleInputChange} placeholder="/img/recompensa.png" className="mt-1 w-full p-2 border rounded" />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavbar />
    </>
  );
}