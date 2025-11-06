'use client'; // Necesario para usar hooks como useState, useEffect y useParams

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Importamos todos los componentes de gestión que creamos
import ModuleManager from '@/components/home-docente/ModuleManager';
import Link from 'next/link';
import LessonManager from '@/components/home-docente/LessonManager';
import AssignmentManager from '@/components/home-docente/AssignmentManager';
import EvaluationManager from '@/components/home-docente/EvaluationManager';
import ScheduleManager from '@/components/home-docente/ScheduleManager';
import NavbarDocente from '@/components/home-docente/NavbarDocente';

// Importamos el servicio y la interfaz del curso
import { courseService } from '@/services/courseService';
import { Course } from '@/components/landing/CourseCard';

// Simplificamos los pasos principales. Las lecciones y demás se gestionarán DENTRO de los módulos.
const STEPS = ['horarios', 'modulos'] as const;
type Step = typeof STEPS[number];

const stepLabels: Record<Step, string> = {
  horarios: 'Paso 1: Horarios',
  modulos: 'Paso 2: Módulos y Contenido del Curso',
  // Los siguientes pasos ahora son parte de la gestión de un módulo
  // lecciones: 'Paso 3: Lecciones',
  // tareas: 'Paso 4: Tareas',
  // evaluaciones: 'Paso 5: Evaluaciones'
};

export default function ManageCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nuevo estado para controlar la vista: o un paso principal o la gestión de un módulo específico
  const [managingModuleId, setManagingModuleId] = useState<string | null>(null);
  const [managingModuleName, setManagingModuleName] = useState<string | null>(null);

  // Nuevos estados para gestionar Tareas y Evaluaciones dentro de una lección
  const [managingLessonId, setManagingLessonId] = useState<string | null>(null);
  const [managingLessonName, setManagingLessonName] = useState<string | null>(null);
  const [view, setView] = useState<'lessons' | 'assignments' | 'evaluations' | null>(null);

  const [currentStep, setCurrentStep] = useState<Step>('horarios'); // El flujo comienza en 'horarios'

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        try {
          setLoading(true);
          const courseData = await courseService.getCourseById(courseId);
          setCourse(courseData);
        } catch (err) {
          setError('No se pudo cargar la información del curso.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [courseId]);

  const currentStepIndex = STEPS.indexOf(currentStep);

  const goToNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
      // Reset module/lesson/view states when changing top-level step
      setManagingModuleId(null);
      setManagingModuleName(null);
      setManagingLessonId(null);
      setManagingLessonName(null);
      setView(null);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
      // Reset module/lesson/view states when changing top-level step
      setManagingModuleId(null);
      setManagingModuleName(null);
      setManagingLessonId(null);
      setManagingLessonName(null);
      setView(null);
    }
  };

  // Función para entrar a gestionar las lecciones de un módulo específico
  const handleManageLessons = (moduleId: string, moduleName: string) => {
    setManagingModuleId(moduleId);
    setManagingModuleName(moduleName);
    // Reset lesson/sub-content states when entering module lessons view
    setManagingLessonId(null);
    setManagingLessonName(null);
    setView(null);
  };

  // Funciones para entrar a gestionar Tareas/Evaluaciones de una lección
  const handleManageSubContent = (lessonId: string, lessonName: string, type: 'assignments' | 'evaluations') => {
    setManagingLessonId(lessonId);
    setManagingLessonName(lessonName);
    setView(type);
  };

  const handleBackToLessons = () => {
    setManagingLessonId(null);
    setManagingLessonName(null);
    setView(null);
  };

  // New function to go back to modules from lessons view
  const handleBackToModules = () => {
    setManagingModuleId(null);
    setManagingModuleName(null);
    setView(null);
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500 mt-8">Cargando curso...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500 mt-8">{error}</p>;
    }
    if (!course) {
      return <p className="text-center text-gray-500 mt-8">No se encontró el curso.</p>;
    }

    // Flujo anidado: Tareas o Evaluaciones
    if (managingLessonId && view === 'assignments') {
      return <AssignmentManager lessonId={managingLessonId} onBack={handleBackToLessons} />;
    }
    if (managingLessonId && view === 'evaluations') {
      return <EvaluationManager lessonId={managingLessonId} onBack={handleBackToLessons} />;
    }

    // Flujo anidado: Lecciones de un módulo
    if (managingModuleId) {
      return <LessonManager 
                courseId={courseId} 
                moduleId={managingModuleId} 
                onManageSubContent={handleManageSubContent} 
             />;
    }

    // Si no, mostramos el componente del paso actual
    switch (currentStep) {
      case 'horarios':
        return <ScheduleManager courseId={courseId} />;
      case 'modulos':
        return <ModuleManager courseId={courseId} onManageLessons={handleManageLessons} />;
      default:
        return null;
    }
  };

  const renderBreadcrumbs = () => {
    const crumbs = [];
    crumbs.push({ label: 'Mis Cursos', href: '/home-docente' });

    if (course) {
      crumbs.push({
        label: `Gestionar Curso: ${course.titulo}`,
        onClick: () => {
          setCurrentStep('horarios'); // Default to first step when going back to course root
          setManagingModuleId(null);
          setManagingLessonId(null);
          setView(null);
        },
      });
    }

    // Current top-level step (Horarios or Módulos)
    if (!managingModuleId && !managingLessonId) {
      if (currentStep === 'horarios') {
        crumbs.push({ label: 'Horarios' });
      } else if (currentStep === 'modulos') {
        crumbs.push({ label: 'Módulos' });
      }
    }

    // Module level
    if (managingModuleId && managingModuleName) {
      // Ensure 'Módulos' is in the breadcrumb if we are managing a module
      if (!crumbs.some(crumb => crumb.label === 'Módulos')) {
        crumbs.push({ label: 'Módulos', onClick: () => { setCurrentStep('modulos'); handleBackToModules(); } });
      }
      crumbs.push({ label: `Módulo: ${managingModuleName}`, onClick: handleBackToModules });

      // Lesson level
      if (managingLessonId && managingLessonName) {
        crumbs.push({ label: `Lección: ${managingLessonName}`, onClick: handleBackToLessons });

        // Sub-content level (Assignments/Evaluations)
        if (view === 'assignments') {
          crumbs.push({ label: 'Tareas' });
        } else if (view === 'evaluations') {
          crumbs.push({ label: 'Evaluaciones' });
        }
      }
    }

    return (
      <nav className="text-sm font-medium text-gray-500 mb-4" aria-label="Breadcrumb">
        <ol className="list-none p-0 inline-flex">
          {crumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {crumb.href ? (
                <Link href={crumb.href} className="text-blue-600 hover:text-blue-800">
                  {crumb.label}
                </Link>
              ) : crumb.onClick ? (
                <button onClick={crumb.onClick} className="text-blue-600 hover:text-blue-800">
                  {crumb.label}
                </button>
              ) : (
                <span className="text-gray-700">{crumb.label}</span>
              )}
              {index < crumbs.length - 1 && (
                <svg className="fill-current w-3 h-3 mx-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.029c9.373 9.372 9.373 24.568.001 33.942z"/>
                </svg>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20"> {/* Padding inferior para la barra de navegación */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestionar Curso: {course ? course.titulo : 'Cargando...'}
          </h1>
          <p className="text-gray-600">ID del Curso: {courseId}</p>
        </div>

        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Indicador de Paso Actual */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {managingLessonId
                ? `Gestionando ${view === 'assignments' ? 'Tareas' : 'Evaluaciones'} de: ${managingLessonName}`
                : managingModuleId
                ? `Gestionando Lecciones de: ${managingModuleName}`
                : stepLabels[currentStep]
              }
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}>
                </div>
            </div>
        </div>

        {/* Contenido dinámico basado en el paso actual */}
        <div>
          {renderContent()}
        </div>

        {/* La navegación entre pasos solo se muestra si NO estamos gestionando un módulo específico */}
        {!managingModuleId && !managingLessonId && ( // Only show if not managing module or lesson
          <div className="mt-8 flex justify-between">
              <button
                  onClick={goToPreviousStep}
                  disabled={currentStepIndex === 0}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              >
                  Anterior
              </button>
              <button
                  onClick={goToNextStep}
                  disabled={currentStepIndex === STEPS.length - 1}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                  Siguiente
              </button>
          </div>
        )}
      </div>
      <NavbarDocente />
    </div>
  );
}