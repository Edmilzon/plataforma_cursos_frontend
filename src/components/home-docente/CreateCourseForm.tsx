'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCourseForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoria: '',
    nivel: 'principiante'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creando curso:', formData);
    alert('Curso creado exitosamente');
    router.push('/home-docente');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-black font-medium text-gray-700 mb-2">Título del Curso</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" placeholder="Titulo" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" placeholder="Describe el contenido del curso..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" placeholder="Categoria" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
          <select name="nivel" value={formData.nivel} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500" >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Crear Curso</button>
      </div>
    </form>
  );
}