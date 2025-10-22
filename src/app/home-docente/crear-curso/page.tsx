'use client';
import NavbarDocente from '@/components/home-docente/NavbarDocente';
import CreateCourseForm from '@/components/home-docente/CreateCourseForm';

export default function CrearCurso() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarDocente />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Curso</h1>
          <CreateCourseForm />
        </div>
      </div>
    </div>
  );
}