'use client';
import { useState, useEffect } from 'react';

interface Module {
  id_modulo: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

interface ModuleManagerProps {
  courseId: string;
}

export default function ModuleManager({ courseId }: ModuleManagerProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', orden: 1 });

  useEffect(() => {
    loadModules();
  }, [courseId]);

  const loadModules = () => {
    setTimeout(() => {
      setModules([
        { id_modulo: 1, nombre: 'Módulo 1: Introducción', descripcion: 'Conceptos básicos', orden: 1 },
        { id_modulo: 2, nombre: 'Módulo 2: Contenido Principal', descripcion: 'Desarrollo del tema', orden: 2 }
      ]);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creando módulo:', formData);
    setShowForm(false);
    setFormData({ nombre: '', descripcion: '', orden: 1 });
    loadModules();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-black font-bold">Módulos del Curso</h2>
        <button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">+ Nuevo Módulo</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-4 text-black">Crear Nuevo Módulo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-black" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Orden</label><input type="number" value={formData.orden} onChange={(e) => setFormData({...formData, orden: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-black" required /></div>
          </div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-black" rows={3} /></div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Crear Módulo</button>
          </div>
        </form>
      )}
      <div className="space-y-4">
        {modules.map((module) => (
          <div key={module.id_modulo} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{module.nombre}</h3>
                <p className="text-gray-600 text-sm mb-2">{module.descripcion}</p>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Orden: {module.orden}</span>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                <button className="text-green-600 hover:text-green-800 text-sm">Lecciones</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}