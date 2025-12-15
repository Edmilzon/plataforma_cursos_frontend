'use client';
import Link from 'next/link';
import { Course } from '@/components/landing/CourseCard'; 
import { useState } from 'react';
import { courseService } from '@/services/courseService';

interface CourseListProps {
  courses: Course[];
  onCourseUpdate: () => void; 
}

export default function CourseList({ courses, onCourseUpdate }: CourseListProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: 0,
    modalidad: '',
    cupo: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      titulo: course.titulo,
      descripcion: course.descripcion,
      precio: course.precio,
      modalidad: course.modalidad,
      cupo: course.cupo || 0,
    });
    setIsEditModalOpen(true);
    setError(null);
  };

  const openDeleteModal = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
    setError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      await courseService.updateCourse(String(selectedCourse.id_curso), {
        ...formData,
        precio: Number(formData.precio),
        cupo: Number(formData.cupo)
      });
      setIsEditModalOpen(false);
      onCourseUpdate();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el curso.');
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;

    try {
      await courseService.deleteCourse(String(selectedCourse.id_curso));
      setIsDeleteModalOpen(false);
      onCourseUpdate();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el curso.');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id_curso} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col">
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.titulo}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{course.descripcion}</p>
            </div>
            
            <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between space-x-2">
                <Link 
                  href={`/home-docente/cursos/${course.id_curso}`} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex-1 text-center"
                >
                  Gestionar
                </Link>
                <Link
                  href={`/home-docente/cursos/${course.id_curso}/calificar`}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex-1 text-center"
                >
                  Calificar
                </Link>
              </div>
              
              <div className="flex justify-between space-x-2">
                <button 
                  onClick={() => openEditModal(course)} 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex-1"
                >
                  Editar
                </button>
                <button 
                  onClick={() => openDeleteModal(course)} 
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex-1"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edición */}
      {isEditModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Actualizar Curso: {selectedCourse.titulo}</h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input type="text" value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value)})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cupos Disponibles</label>
                <input 
                  type="number" 
                  min="0" 
                  value={formData.cupo} 
                  onChange={(e) => setFormData({...formData, cupo: parseInt(e.target.value) || 0})} 
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.precio} 
                    onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value)})} 
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cupos</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={formData.cupo} 
                    onChange={(e) => setFormData({...formData, cupo: parseInt(e.target.value) || 0})} 
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Modalidad</label>
                <input type="text" value={formData.modalidad} onChange={(e) => setFormData({...formData, modalidad: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-3 py-1.5 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                  Cancelar
                </button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Borrado */}
      {isDeleteModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Confirmar Eliminación</h3>
            <p className="text-gray-700">¿Estás seguro de que quieres eliminar el curso "{selectedCourse.titulo}"? Esta acción no se puede deshacer.</p>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-3 py-1.5 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}