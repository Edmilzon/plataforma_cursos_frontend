'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import NavbarDocente from '@/components/home-docente/NavbarDocente';
import CourseList from '@/components/home-docente/CourseList';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { Course } from '@/components/landing/CourseCard';

export default function HomeDocente() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const allCourses = await courseService.getAllCourses();
      // Filtramos los cursos para mostrar solo los del docente actual
      const filteredCourses = allCourses.filter(course => course.docente?.id_usuario === user.id_usuario);
      setMyCourses(filteredCourses);
    } catch (err: any) {
      setError('No se pudieron cargar tus cursos. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyCourses();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8 pb-20"> {/* Padding bottom para la barra de navegación */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mis Cursos - Prof. {user?.nombre} {user?.apellido}
          </h1>
          <Link href="/home-docente/crear-curso" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            + Crear Nuevo Curso
          </Link>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Cargando tus cursos...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : myCourses.length > 0 ? (
          <CourseList courses={myCourses} onCourseUpdate={fetchMyCourses} />
        ) : (
          <p className="text-center text-gray-500 mt-10">Aún no has creado ningún curso. ¡Anímate a crear el primero!</p>
        )}
      </div>
      <NavbarDocente />
    </div>
  );
}