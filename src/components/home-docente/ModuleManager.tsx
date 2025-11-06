'use client';
import { useState, useEffect } from 'react';
import { courseService } from '@/services/courseService';

interface Module {
  id_modulo: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

interface ModuleManagerProps {
  courseId: string;
  onManageLessons: (moduleId: string, moduleName: string) => void;
}

export default function ModuleManager({ courseId, onManageLessons }: ModuleManagerProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', orden: 1 });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);

  const loadModules = async () => {
    try {
      setLoading(true);
      const data = await courseService.getModulesByCourse(courseId);
      setModules(data.sort((a, b) => a.orden - b.orden));
    } catch (err) {
      setError('No se pudieron cargar los módulos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, [courseId]);

  const handleOpenForm = (module: Module | null = null) => {
    setError(null);
    if (module) {
      setEditingModule(module);
      setFormData({
        nombre: module.nombre,
        descripcion: module.descripcion,
        orden: module.orden,
      });
    } else {
      setEditingModule(null);
      setFormData({ nombre: '', descripcion: '', orden: modules.length + 1 });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingModule) {
        await courseService.updateModule(courseId, String(editingModule.id_modulo), formData);
      } else {
        await courseService.createModule(courseId, formData);
      }
      setIsFormOpen(false);
      loadModules();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el módulo.');
    }
  };

  const openDeleteModal = (module: Module) => {
    setModuleToDelete(module);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!moduleToDelete) return;
    try {
      await courseService.deleteModule(courseId, String(moduleToDelete.id_modulo));
      setIsDeleteModalOpen(false);
      setModuleToDelete(null);
      loadModules();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el módulo.');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-black font-bold">Módulos del Curso</h2>
        <button onClick={() => handleOpenForm()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">+ Nuevo Módulo</button>
      </div>
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-4 text-gray-800">{editingModule ? 'Editar Módulo' : 'Crear Nuevo Módulo'}</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Módulo</label><input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Orden</label><input type="number" value={formData.orden} onChange={(e) => setFormData({...formData, orden: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" required /></div>
          </div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" rows={3} /></div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingModule ? 'Actualizar Módulo' : 'Crear Módulo'}</button>
          </div>
        </form>
      )}
      <div className="space-y-4">
        {loading && <p>Cargando módulos...</p>}
        {!loading && modules.length === 0 && <p className="text-gray-500">No hay módulos creados para este curso.</p>}
        {modules.map((module) => (
          <div key={module.id_modulo} className="border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{module.nombre}</h3>
                <p className="text-gray-600 text-sm mb-2">{module.descripcion}</p>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Orden: {module.orden}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => onManageLessons(String(module.id_modulo), module.nombre)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >Gestionar Lecciones</button>
                <button onClick={() => handleOpenForm(module)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                <button onClick={() => openDeleteModal(module)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación de Borrado */}
      {isDeleteModalOpen && moduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar el módulo "{moduleToDelete.nombre}"? Se eliminarán también todas sus lecciones. Esta acción no se puede deshacer.</p>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}