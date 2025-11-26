// app/home-admin/courses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';
import { courseService } from '@/services/courseService';
import { userService } from '@/services/userService';

interface Course {
  id_curso: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  duracion: number;
  precio: number;
  modalidad: string;
  id_docente: number;
  id_tipo_curso: number;
  cupo: number;
  imagen_portada_url: string;
  estado: string;
  docente?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  };
}

interface Teacher {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
}

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    duracion: 0,
    precio: 0,
    modalidad: 'Online',
    id_docente: 0,
    id_tipo_curso: 1, // Valor por defecto
    cupo: 30,
    imagen_portada_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, teachersData] = await Promise.all([
        courseService.getAllCourses(),
        userService.getUsersByRole('Docente')
      ]);
      setCourses(coursesData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validaciones básicas
      if (!formData.titulo || !formData.descripcion || !formData.fecha_inicio || !formData.fecha_fin) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }

      if (formData.id_docente === 0) {
        alert('Por favor selecciona un docente');
        return;
      }

      await courseService.createCourse(formData);
      setShowCreateModal(false);
      resetForm();
      await loadData(); // Recargar la lista
      alert('Curso creado exitosamente');
    } catch (error: any) {
      console.error('Error creating course:', error);
      alert(`Error al crear el curso: ${error.message}`);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      await courseService.updateCourse(selectedCourse.id_curso.toString(), formData);
      setShowEditModal(false);
      setSelectedCourse(null);
      resetForm();
      await loadData(); // Recargar la lista
      alert('Curso actualizado exitosamente');
    } catch (error: any) {
      console.error('Error updating course:', error);
      alert(`Error al actualizar el curso: ${error.message}`);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      try {
        await courseService.deleteCourse(courseId.toString());
        setCourses(courses.filter(course => course.id_curso !== courseId));
        alert('Curso eliminado exitosamente');
      } catch (error: any) {
        alert(`Error al eliminar el curso: ${error.message}`);
      }
    }
  };

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      titulo: course.titulo,
      descripcion: course.descripcion,
      fecha_inicio: course.fecha_inicio.split('T')[0], // Formato YYYY-MM-DD
      fecha_fin: course.fecha_fin.split('T')[0],
      duracion: course.duracion,
      precio: course.precio,
      modalidad: course.modalidad,
      id_docente: course.id_docente,
      id_tipo_curso: course.id_tipo_curso,
      cupo: course.cupo,
      imagen_portada_url: course.imagen_portada_url || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      duracion: 0,
      precio: 0,
      modalidad: 'Online',
      id_docente: 0,
      id_tipo_curso: 1,
      cupo: 30,
      imagen_portada_url: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duracion' || name === 'precio' || name === 'cupo' || name === 'id_docente' || name === 'id_tipo_curso' 
        ? Number(value) 
        : value
    }));
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto mt-24 px-4 pb-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <BottomNavbar />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto mt-24 px-4 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Cursos</h1>
            <p className="text-gray-600 mt-2">Administra todos los cursos de la plataforma</p>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Crear Nuevo Curso
          </button>
        </div>

        {/* Lista de Cursos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id_curso} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{course.titulo}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{course.descripcion}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>Inicio: {new Date(course.fecha_inicio).toLocaleDateString()}</div>
                      <div>Fin: {new Date(course.fecha_fin).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {course.modalidad}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      ${course.precio}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {course.cupo} estudiantes
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditClick(course)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(course.id_curso)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay cursos registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear curso */}
      {showCreateModal && (
        <CourseModal
          title="Crear Nuevo Curso"
          onSubmit={handleCreateCourse}
          onClose={() => setShowCreateModal(false)}
          formData={formData}
          onInputChange={handleInputChange}
          teachers={teachers}
          isEdit={false}
        />
      )}

      {/* Modal para editar curso */}
      {showEditModal && selectedCourse && (
        <CourseModal
          title="Editar Curso"
          onSubmit={handleEditCourse}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          formData={formData}
          onInputChange={handleInputChange}
          teachers={teachers}
          isEdit={true}
        />
      )}

      <BottomNavbar />
    </>
  );
}

// Componente Modal para crear/editar cursos
function CourseModal({ 
  title, 
  onSubmit, 
  onClose, 
  formData, 
  onInputChange, 
  teachers,
  isEdit 
}: { 
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  teachers: any[];
  isEdit: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 shadow-xl">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Curso *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={onInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa el título del curso"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={onInputChange}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe el contenido del curso"
              />
            </div>

            {/* Fechas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={onInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin *
              </label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={onInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Duración y Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (horas) *
              </label>
              <input
                type="number"
                name="duracion"
                value={formData.duracion}
                onChange={onInputChange}
                required
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio ($) *
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={onInputChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Modalidad y Cupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modalidad *
              </label>
              <select
                name="modalidad"
                value={formData.modalidad}
                onChange={onInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Online">Online</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cupo de Estudiantes *
              </label>
              <input
                type="number"
                name="cupo"
                value={formData.cupo}
                onChange={onInputChange}
                required
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Docente */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Docente *
              </label>
              <select
                name="id_docente"
                value={formData.id_docente}
                onChange={onInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">Selecciona un docente</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id_usuario} value={teacher.id_usuario}>
                    {teacher.nombre} {teacher.apellido} - {teacher.correo}
                  </option>
                ))}
              </select>
            </div>

            {/* URL de imagen */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de la Imagen de Portada
              </label>
              <input
                type="url"
                name="imagen_portada_url"
                value={formData.imagen_portada_url}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEdit ? 'Actualizar Curso' : 'Crear Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}