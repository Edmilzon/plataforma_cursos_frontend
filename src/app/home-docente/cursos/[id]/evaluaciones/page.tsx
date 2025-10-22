'use client';
import { useParams } from 'next/navigation';
import NavbarDocente from '@/components/home-docente/NavbarDocente';
import EvaluationManager from '@/components/home-docente/EvaluationManager';

export default function EvaluacionesPage() {
  const params = useParams();
  const courseId = params.id as string;
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarDocente />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">Gestión de Evaluaciones</h1>
          <p className="text-gray-600">Curso ID: {courseId}</p>
        </div>
        <EvaluationManager courseId={courseId} />
      </div>
    </div>
  );
}