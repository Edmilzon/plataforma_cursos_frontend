'use client';
import { useAuth } from '@/hooks/useAuth';
import NavbarDocente from '@/components/home-docente/NavbarDocente';
import CourseList from '@/components/home-docente/CourseList';
import Link from 'next/link';

export default function HomeDocente() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarDocente />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mis Cursos - Prof. {user?.nombre} {user?.apellido}
          </h1>
          <Link href="/home-docente/crear-curso" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            + Crear Nuevo Curso
          </Link>
        </div>
        <CourseList />
      </div>
    </div>
  );
}