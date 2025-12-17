'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { courseService, Submission } from '@/services/courseService';
import { Course } from '@/components/landing/CourseCard';
import NavbarDocente from '@/components/home-docente/NavbarDocente';
import GradingModal from '@/components/home-docente/GradingModal';
import CourseSelector from '@/components/home-docente/CourseSelector';

export default function GradePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para el modal de calificación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionToGrade, setSubmissionToGrade] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (user) {
        setLoadingCourses(true);
        setError(null);
        try {
          // Usamos la nueva función del servicio para obtener solo los cursos del docente logueado
          const teacherCourses = await courseService.getCoursesByTeacher(user.id_usuario);
          setCourses(teacherCourses);
        } catch (err: any) {
          // Capturamos el mensaje de error específico para dar más contexto.
          const errorMessage = err.message || 'No se pudieron cargar tus cursos.';
          setError(errorMessage);
          console.error("Error en fetchCourses:", err);
        } finally {
          setLoadingCourses(false);
        }
      }
    };
    fetchCourses();
  }, [user]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (selectedCourseId) {
        setLoadingSubmissions(true);
        setError(null);
        try {
          const courseSubmissions = await courseService.getSubmissionsByCourse(selectedCourseId);
          setSubmissions(courseSubmissions);
        } catch (err) {
          setError('No se pudieron cargar las entregas para este curso.');
          setSubmissions([]);
        } finally {
          setLoadingSubmissions(false);
        }
      }
    };
    fetchSubmissions();
  }, [selectedCourseId]);

  const handleOpenModal = (submission: Submission) => {
    console.log('Opening modal for submission:', submission); // ¡Este log es clave!
    setSubmissionToGrade(submission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmissionToGrade(null);
  };

  const handleGradeSuccess = () => {
    handleCloseModal();
    // Recargar las entregas para reflejar el cambio de estado
    if (selectedCourseId) {
      courseService.getSubmissionsByCourse(selectedCourseId).then(setSubmissions);
    }
  };

  const pendingSubmissions = submissions.filter(s => s.estado === 'Pendiente');
  const gradedSubmissions = submissions.filter(s => s.estado === 'Calificado');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Calificar Entregas</h1>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

        {/* Selector de Curso */}
        <div className="mb-6">
          <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona un curso para ver las entregas:
          </label>
          {loadingCourses ? (
            <p>Cargando cursos...</p>
          ) : (
            <CourseSelector
              courses={courses}
              selectedCourse={courses.find(c => String(c.id_curso) === selectedCourseId) || null}
              onSelectCourse={(course) => setSelectedCourseId(course ? String(course.id_curso) : null)}
              disabled={courses.length === 0}
            />
          )}
        </div>

        {/* Lista de Entregas */}
        <div>
          {loadingSubmissions && <p className="text-gray-500">Cargando entregas...</p>}
          {!loadingSubmissions && selectedCourseId && (
            <>
              <SubmissionSection title="Entregas Pendientes" submissions={pendingSubmissions} onGradeClick={handleOpenModal} />
              <SubmissionSection title="Entregas Calificadas" submissions={gradedSubmissions} />
              {submissions.length === 0 && (
                <p className="text-center text-gray-500 mt-8 bg-gray-100 p-4 rounded-lg">Aún no hay entregas para este curso.</p>
              )}
            </>
          )}
        </div>
      </div>
      <NavbarDocente />
      {isModalOpen && submissionToGrade && (
        <GradingModal
          submission={submissionToGrade}
          onClose={handleCloseModal}
          onSuccess={handleGradeSuccess}
        />
      )}
    </div>
  );
}

interface SubmissionSectionProps {
  title: string;
  submissions: Submission[];
  onGradeClick?: (submission: Submission) => void;
}

function SubmissionSection({ title, submissions, onGradeClick }: SubmissionSectionProps) {
  if (submissions.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="space-y-4">
        {submissions.map(submission => (
          <div key={submission.id_entrega} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{submission.titulo_actividad}</p>
              <p className="text-sm text-gray-600">Estudiante: {submission.nombre_estudiante}</p>
              <p className="text-xs text-gray-500">Entregado: {new Date(submission.fecha_entrega).toLocaleString()}</p>
            </div>
            <div className="flex items-center space-x-4">
              {submission.estado === 'Calificado' && (
                <span className="text-lg font-bold text-green-600">{submission.calificacion}/100</span>
              )}
              {onGradeClick && submission.estado === 'Pendiente' && (
                <button
                  onClick={() => onGradeClick(submission)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Calificar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
