'use client';
import { useParams } from 'next/navigation';
import NavbarDocente from '@/components/home-docente/NavbarDocente';
import AssignmentManager from '@/components/home-docente/AssignmentManager';

export default function TareasPage() {
  const params = useParams();
  const courseId = params.id as string;
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarDocente />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Revisión de Tareas</h1>
          <p className="text-gray-600">Curso ID: {courseId}</p>
        </div>
        <AssignmentManager courseId={courseId} />
      </div>
    </div>
  );
}