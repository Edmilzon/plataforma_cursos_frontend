// app/my-courses/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
<<<<<<< HEAD
import { deliveryService } from '@/services/deliveryService';
=======
>>>>>>> origin/modal-descuento
import { BottomNavbar } from '@/components/BottomNavbar';

interface Module {
  id_modulo: number;
  nombre: string;
  descripcion: string;
  orden: number;
  lecciones?: Lesson[];
}

interface Lesson {
  id_leccion: number;
  titulo: string;
  contenido: string;
  url_recurso: string;
  orden: number;
  completado?: boolean;
  tareas?: Assignment[];
  evaluaciones?: Evaluation[];
}

interface Assignment {
  id_tarea: number;
  titulo: string;
  descripcion: string;
  url_contenido: string;
  fecha_entrega: string;
  entrega?: any;
}

interface Evaluation {
  id_evaluacion: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha_hora_inicio: string;
  fecha_hora_entrega: string;
  calificacion_maxima: number;
  entrega?: any;
}

type TabType = 'contenido' | 'tareas' | 'evaluaciones';

export default function MyCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('contenido');
  const [selectedAssignment, setSelectedAssignment] = useState<{assignment: Assignment, module: Module, lesson: Lesson} | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<{evaluation: Evaluation, module: Module, lesson: Lesson} | null>(null);
  const [deliveryUrl, setDeliveryUrl] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        const enrolled = await enrollmentService.checkEnrollment(courseId);
        setIsEnrolled(enrolled);
        
        if (!enrolled) {
          setLoading(false);
          return;
        }

        // 1. Obtener datos principales en paralelo
        const [courseData, modulesData, allDeliveries] = await Promise.all([
          courseService.getCourseById(courseId),
          courseService.getModulesByCourse(courseId),
          deliveryService.getAllUserDeliveriesForCourse(courseId),
        ]);
        
        setCourse(courseData);

        // 2. Construir la estructura completa del curso con todo el contenido
        const modulesWithContent = await Promise.all(
          modulesData.map(async (module: Module) => {
            try {
              const lessons = await courseService.getLessonsByModule(courseId, module.id_modulo.toString());
              
              // 3. Para cada lección, obtener sus tareas, evaluaciones y progreso
              const lessonsWithContent = await Promise.all(
                lessons.map(async (lesson: Lesson) => {
                  try {
                    const [assignments, evaluations] = await Promise.all([
                      courseService.getAssignmentsByLesson(lesson.id_leccion.toString()),
                      courseService.getEvaluationsByLesson(lesson.id_leccion.toString()),
                    ]);

                    // 4. Asignar entregas a cada tarea usando la lista que ya obtuvimos
                    const assignmentsWithDeliveries = await Promise.all(
                      assignments.map(async (assignment: Assignment) => {
                        const delivery = allDeliveries.find(d => d.tipo_actividad === 'Tarea' && parseInt(d.id_actividad) === assignment.id_tarea);
                        return { ...assignment, entrega: delivery || null };
                      })
                    );

                    // 5. Asignar entregas a cada evaluación
                    const evaluationsWithDeliveries = await Promise.all(
                      evaluations.map(async (evaluation: Evaluation) => {
                        const delivery = allDeliveries.find(d => d.tipo_actividad === 'Evaluacion' && parseInt(d.id_actividad) === evaluation.id_evaluacion);
                        return { ...evaluation, entrega: delivery || null };
                      })
                    );

                    // Verificar progreso de la lección
                    const progressData = await deliveryService.getLessonProgress(lesson.id_leccion);

                    return {
                      ...lesson,
<<<<<<< HEAD
                      completado: progressData.completado || false,
                      tareas: assignmentsWithDeliveries || [],
                      evaluaciones: evaluationsWithDeliveries || []
=======
                      completado: false, // Por ahora siempre false, luego se actualiza con lógica real
                      tareas: assignments || [],
                      evaluaciones: evaluations || []
>>>>>>> origin/modal-descuento
                    };
                  } catch (error) {
                    console.error('Error loading lesson content:', error);
                    return {
                      ...lesson,
                      completado: false,
                      tareas: [],
                      evaluaciones: []
                    };
                  }
                })
              );

              return {
                ...module,
                lecciones: lessonsWithContent.sort((a, b) => a.orden - b.orden)
              };
            } catch (error) {
              console.error('Error loading module:', error);
              return {
                ...module,
                lecciones: []
              };
            }
          })
        );
        
        setModules(modulesWithContent.sort((a, b) => a.orden - b.orden));
      } catch (error) {
        console.error('Error loading course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

<<<<<<< HEAD
  const handleMarkCompleted = async (lessonId: number) => {
    try {
      // 1. Llamar a la API para persistir el cambio
      await deliveryService.markLessonAsCompleted(lessonId);

      // 2. Actualizar el estado local para reflejar el cambio inmediatamente
=======
  // --- LÓGICA DEL CERTIFICADO ---
  // Esta función verifica si el estudiante cumple con TODO para habilitar el botón
  const checkCertificateEligibility = () => {
    // 1. Verificar progreso numérico (Debe ser 100%)
    if (progress < 100) return false;

    // 2. Verificar si hay Tareas marcadas como [FINAL] y si están entregadas
    const hasPendingFinalTask = modules.some(m => 
      m.lecciones?.some(l => 
        l.tareas?.some(t => t.descripcion.includes('[FINAL]') && !t.entrega)
      )
    );
    if (hasPendingFinalTask) return false;

    // 3. Verificar si hay Evaluaciones marcadas como [FINAL] y si están entregadas
    const hasPendingFinalEval = modules.some(m => 
      m.lecciones?.some(l => 
        l.evaluaciones?.some(e => e.descripcion.includes('[FINAL]') && !e.entrega)
      )
    );
    if (hasPendingFinalEval) return false;

    // Si pasa todas las validaciones, es apto
    return true;
  };
  
  const isCertificateEligible = checkCertificateEligibility();
  // -----------------------------

  const handleMarkCompleted = async (lessonId: string) => {
    try {
>>>>>>> origin/modal-descuento
      setModules(prev => prev.map(module => ({
        ...module,
        lecciones: module.lecciones?.map(lesson => 
          lesson.id_leccion === lessonId 
            ? { ...lesson, completado: true }
            : lesson
        )
      })));

<<<<<<< HEAD
=======
      const totalLessons = modules.reduce((acc, module) => acc + (module.lecciones?.length || 0), 0);
      const completedLessons = modules.reduce((acc, module) => 
        acc + (module.lecciones?.filter(lesson => lesson.completado).length || 0), 0
      ) + 1;
      
      const newProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      setProgress(newProgress);

>>>>>>> origin/modal-descuento
    } catch (error) {
      console.error('Error:', error);
      alert('Error al marcar la lección como completada');
    }
  };

  // El progreso se recalcula cada vez que el estado de los módulos cambia
  useEffect(() => {
    updateProgress();
  }, [modules]);

  const openAssignmentModal = (assignment: Assignment, module: Module, lesson: Lesson) => {
    const now = new Date();
    const dueDate = new Date(assignment.fecha_entrega);
    
    if (now > dueDate) {
      alert('La fecha de entrega ha expirado. Ya no puedes entregar esta tarea.');
      return;
    }

<<<<<<< HEAD
    setSelectedAssignment({ assignment, module, lesson });
    setDeliveryUrl('');
  };
=======
    try {
      const fileUrl = await simulateFileUpload(selectedFile);
      
      setModules(prevModules => 
        prevModules.map(module => ({
          ...module,
          lecciones: module.lecciones?.map(lesson => ({
            ...lesson,
            tareas: lesson.tareas?.map(tarea => {
              if (tarea.id_tarea === parseInt(assignmentId)) {
                return {
                  ...tarea,
                  entrega: {
                    estado: 'Entregado',
                    fecha_entrega: new Date().toISOString(),
                    url_archivo: fileUrl
                  }
                };
              }
              return tarea;
            })
          }))
        }))
      );
>>>>>>> origin/modal-descuento

  const openEvaluationModal = (evaluation: Evaluation, module: Module, lesson: Lesson) => {
    const now = new Date();
    const startDate = new Date(evaluation.fecha_hora_inicio);
    const endDate = new Date(evaluation.fecha_hora_entrega);
    
    if (now < startDate) {
      alert('Esta evaluación aún no está disponible.');
      return;
    }
    
    if (now > endDate) {
      alert('El tiempo para entregar esta evaluación ha expirado.');
      return;
    }

    setSelectedEvaluation({ evaluation, module, lesson });
    setDeliveryUrl('');
  };

  const closeModal = () => {
    setSelectedAssignment(null);
    setSelectedEvaluation(null);
    setDeliveryUrl('');
  };

  const handleDeliver = async () => {
    try {
      if (selectedAssignment) {
        if (!deliveryUrl) {
          alert('Para entregar una tarea debes proporcionar una URL del archivo');
          return;
        }

        const response = await deliveryService.deliverAssignment(
          selectedAssignment.assignment.id_tarea.toString(),
          deliveryUrl
        );
        
        setModules(prev => prev.map(module => 
          module.id_modulo === selectedAssignment.module.id_modulo 
            ? {
                ...module,
                lecciones: module.lecciones?.map(lesson => 
                  lesson.id_leccion === selectedAssignment.lesson.id_leccion
                    ? {
                        ...lesson,
                        tareas: lesson.tareas?.map(tarea => 
                          tarea.id_tarea === selectedAssignment.assignment.id_tarea 
                            ? { 
                                ...tarea, 
                                entrega: response.entrega
                              }
                            : tarea
                        )
                      }
                    : lesson
                )
              }
            : module
        ));

        updateProgress();
        alert('Tarea entregada exitosamente');
      
      } else if (selectedEvaluation) {
        const response = await deliveryService.deliverEvaluation(
          selectedEvaluation.evaluation.id_evaluacion.toString()
        );
        
        setModules(prev => prev.map(module => 
          module.id_modulo === selectedEvaluation.module.id_modulo 
            ? {
                ...module,
                lecciones: module.lecciones?.map(lesson => 
                  lesson.id_leccion === selectedEvaluation.lesson.id_leccion
                    ? {
                        ...lesson,
                        evaluaciones: lesson.evaluaciones?.map(evaluacion => 
                          evaluacion.id_evaluacion === selectedEvaluation.evaluation.id_evaluacion 
                            ? { 
                                ...evaluacion, 
                                entrega: response.entrega
                              }
                            : evaluacion
                        )
                      }
                    : lesson
                )
              }
            : module
        ));

        updateProgress();
        alert('Evaluación entregada exitosamente');
      }

      closeModal();
    } catch (error: any) {
      console.error('Error delivering:', error);
      alert(error.message || 'Error al entregar la actividad');
    }
  };

<<<<<<< HEAD
  const updateProgress = () => {
    let totalActivities = 0;
    let deliveredActivities = 0;
=======
  const handleDeliverEvaluation = async (evaluationId: string) => {
    try {
      setModules(prevModules => 
        prevModules.map(module => ({
          ...module,
          lecciones: module.lecciones?.map(lesson => ({
            ...lesson,
            evaluaciones: lesson.evaluaciones?.map(evaluacion => {
              if (evaluacion.id_evaluacion === parseInt(evaluationId)) {
                return {
                  ...evaluacion,
                  entrega: {
                    estado: 'Entregado',
                    fecha_entrega: new Date().toISOString()
                  }
                };
              }
              return evaluacion;
            })
          }))
        }))
      );
>>>>>>> origin/modal-descuento

    modules.forEach(module => {
      module.lecciones?.forEach(lesson => {
        totalActivities += lesson.tareas?.length || 0;
        deliveredActivities += lesson.tareas?.filter(t => t.entrega).length || 0;

<<<<<<< HEAD
        totalActivities += lesson.evaluaciones?.length || 0;
        deliveredActivities += lesson.evaluaciones?.filter(e => e.entrega).length || 0;
      });
=======
  const simulateFileUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://example.com/uploads/${file.name}`);
      }, 1000);
>>>>>>> origin/modal-descuento
    });

    const newProgress = totalActivities > 0 ? Math.round((deliveredActivities / totalActivities) * 100) : 0;
    setProgress(newProgress);
  };

  const canDeliver = (dueDate: string): boolean => {
    const now = new Date();
    const due = new Date(dueDate);
    return now <= due;
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto mt-24 px-4 pb-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
        <BottomNavbar />
      </>
    );
  }

  if (!isEnrolled) {
    return (
      <>
        <div className="container mx-auto mt-24 px-4 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4">No estás inscrito en este curso</h1>
          <p className="text-gray-600 mb-6">Para acceder al contenido del curso, primero debes inscribirte.</p>
          <button 
            onClick={() => router.push(`/cursos/${courseId}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Ir a la página del curso
          </button>
        </div>
        <BottomNavbar />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto mt-24 px-4 pb-20">
        {/* Header del curso */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{course?.titulo}</h1>
              <p className="text-gray-600 mt-2">{course?.descripcion}</p>
              {course?.horario_clases && (
                <div className="flex items-center gap-2 mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-800 font-medium text-sm">
                    Horario: {course.horario_clases}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{progress}%</div>
              <div className="text-sm text-gray-500">Completado</div>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

<<<<<<< HEAD
          {/* Pestañas */}
          <div className="mt-6 border-b">
            <nav className="flex space-x-8">
              {[
                { id: 'contenido', label: 'Contenido' },
                { id: 'tareas', label: 'Tareas' },
                { id: 'evaluaciones', label: 'Evaluaciones' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
=======
          {/* BOTÓN DE CERTIFICADO (AQUÍ ESTÁ LA LÓGICA VISUAL) */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col items-center justify-center">
            <button
              onClick={() => router.push(`../certificates/${courseId}`)}
              disabled={!isCertificateEligible}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-lg font-bold shadow-sm transition-all transform duration-200
                ${isCertificateEligible 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:shadow-lg hover:-translate-y-1 cursor-pointer' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isCertificateEligible ? 'Descargar Certificado de Finalización' : 'Certificado Bloqueado'}
            </button>
            
            {!isCertificateEligible && (
               <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    * Para desbloquear el certificado debes completar el <strong>100% del contenido</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    y entregar todas las actividades finales (Tareas o Evaluaciones).
                  </p>
               </div>
            )}
          </div>
          {/* FIN BOTÓN DE CERTIFICADO */}

>>>>>>> origin/modal-descuento
        </div>

        {/* Contenido según pestaña activa */}
        {activeTab === 'contenido' && (
          <div className="space-y-6">
            {modules.map(module => (
              <div key={module.id_modulo} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-xl font-bold">{module.nombre}</h2>
                  <p className="text-gray-600 text-sm mt-1">{module.descripcion}</p>
                </div>

                <div className="divide-y">
                  {module.lecciones?.map(lesson => (
                    <div key={lesson.id_leccion} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {lesson.completado ? (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                            )}
                            <h3 className="font-semibold text-lg">{lesson.titulo}</h3>
                          </div>
                          <p className="text-gray-600 ml-9 mb-4">{lesson.contenido}</p>
                          
                          {lesson.url_recurso && (
                            <div className="mt-3 ml-9 mb-4">
                              <div className="bg-gray-100 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Recurso de la lección:</h4>
                                <video 
                                  src={lesson.url_recurso} 
                                  controls 
                                  className="w-full max-w-md rounded-lg"
                                />
                              </div>
                            </div>
                          )}
                        </div>

<<<<<<< HEAD
                        {!lesson.completado && (
                          <button // @ts-ignore
                            onClick={() => handleMarkCompleted(lesson.id_leccion.toString())}
                            className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 whitespace-nowrap transition-colors"
                          >
                            Marcar como completado
                          </button>
=======
                        {/* Tareas */}
                        {lesson.tareas && lesson.tareas.length > 0 && (
                          <div className="mt-4 ml-9">
                            <h4 className="font-semibold text-gray-700 mb-3">Tareas:</h4>
                            <div className="space-y-4">
                              {lesson.tareas.map(tarea => (
                                <div key={tarea.id_tarea} className="bg-gray-50 p-4 rounded-lg border">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-medium text-lg">{tarea.titulo}</h5>
                                        {tarea.descripcion.includes('[FINAL]') && (
                                           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded border border-yellow-200 font-bold">
                                              TAREA FINAL
                                           </span>
                                        )}
                                      </div>
                                      
                                      {/* Limpiamos la etiqueta [FINAL] para que no se vea feo en la descripción */}
                                      <p className="text-gray-600 mt-1">{tarea.descripcion.replace('[FINAL]', '')}</p>
                                      <p className="text-sm text-gray-500 mt-2">
                                        📅 Entrega: {new Date(tarea.fecha_entrega).toLocaleDateString()}
                                      </p>
                                      {tarea.url_contenido && (
                                        <a 
                                          href={tarea.url_contenido} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 text-sm mt-2 inline-block hover:underline"
                                        >
                                          📎 Ver material de la tarea
                                        </a>
                                      )}
                                    </div>
                                    <div className="ml-4">
                                      {tarea.entrega ? (
                                        <div className="text-center">
                                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                            ✅ Entregado
                                          </span>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {new Date(tarea.entrega.fecha_entrega).toLocaleDateString()}
                                          </p>
                                          {tarea.entrega.calificacion && (
                                            <p className="text-xs font-medium mt-1">
                                              Calificación: {tarea.entrega.calificacion}
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-center">
                                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                            📤 Pendiente
                                          </span>
                                          <div className="mt-2">
                                            <input
                                              type="file"
                                              onChange={handleFileSelect}
                                              className="text-sm mb-2"
                                            />
                                            <button 
                                              onClick={() => handleDeliverAssignment(tarea.id_tarea.toString())}
                                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 w-full"
                                            >
                                              Entregar
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Evaluaciones */}
                        {lesson.evaluaciones && lesson.evaluaciones.length > 0 && (
                          <div className="mt-6 ml-9">
                            <h4 className="font-semibold text-gray-700 mb-3">Evaluaciones:</h4>
                            <div className="space-y-4">
                              {lesson.evaluaciones.map(evaluacion => (
                                <div key={evaluacion.id_evaluacion} className="bg-gray-50 p-4 rounded-lg border">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-medium text-lg">{evaluacion.titulo}</h5>
                                        {evaluacion.descripcion.includes('[FINAL]') && (
                                           <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded border border-purple-200 font-bold">
                                              EVALUACIÓN FINAL
                                           </span>
                                        )}
                                      </div>
                                      
                                      <p className="text-gray-600 mt-1">{evaluacion.descripcion.replace('[FINAL]', '')}</p>
                                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                        <div>
                                          <span className="font-medium">Tipo:</span> {evaluacion.tipo}
                                        </div>
                                        <div>
                                          <span className="font-medium">Puntos máx:</span> {evaluacion.calificacion_maxima}
                                        </div>
                                        <div>
                                          <span className="font-medium">Inicia:</span> {new Date(evaluacion.fecha_hora_inicio).toLocaleString()}
                                        </div>
                                        <div>
                                          <span className="font-medium">Finaliza:</span> {new Date(evaluacion.fecha_hora_entrega).toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      {evaluacion.entrega ? (
                                        <div className="text-center">
                                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                            ✅ Entregado
                                          </span>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {new Date(evaluacion.entrega.fecha_entrega).toLocaleDateString()}
                                          </p>
                                          {evaluacion.entrega.calificacion && (
                                            <p className="text-xs font-medium mt-1">
                                              Calificación: {evaluacion.entrega.calificacion}
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-center">
                                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                            📝 Pendiente
                                          </span>
                                          <button 
                                            onClick={() => handleDeliverEvaluation(evaluacion.id_evaluacion.toString())}
                                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 mt-2 w-full"
                                          >
                                            Realizar
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
>>>>>>> origin/modal-descuento
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {modules.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">El contenido del curso estará disponible pronto.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tareas' && (
          <div className="space-y-6">
            {modules.map(module => (
              <div key={module.id_modulo} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                  <h2 className="text-xl font-bold text-blue-800">Módulo: {module.nombre}</h2>
                  <p className="text-blue-600 text-sm mt-1">{module.descripcion}</p>
                </div>

                <div className="divide-y">
                  {module.lecciones?.filter(lesson => lesson.tareas && lesson.tareas.length > 0)
                    .map(lesson => (
                    <div key={lesson.id_leccion} className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">
                          Lección: {lesson.titulo}
                        </h3>
                        <p className="text-gray-600 text-sm">{lesson.contenido}</p>
                      </div>

                      <div className="space-y-4 ml-4">
                        {lesson.tareas?.map(tarea => (
                          <div key={tarea.id_tarea} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 mb-2">{tarea.titulo}</h4>
                                <p className="text-gray-600 text-sm mb-3">{tarea.descripcion}</p>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <p>📅 Entrega: {new Date(tarea.fecha_entrega).toLocaleDateString()}</p>
                                  {tarea.url_contenido && (
                                    <a 
                                      href={tarea.url_contenido} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      📎 Material de apoyo
                                    </a>
                                  )}
                                </div>
                              </div>
                              
                              <div className="ml-4 text-center min-w-[120px]">
                                {tarea.entrega ? (
                                  <div>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                      ✅ Entregado
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(tarea.entrega.fecha_entrega).toLocaleDateString()}
                                    </p>
                                    {tarea.entrega.calificacion && (
                                      <p className="text-xs font-medium mt-1 text-green-600">
                                        Calificación: {tarea.entrega.calificacion}
                                      </p>
                                    )}
                                  </div>
                                ) : canDeliver(tarea.fecha_entrega) ? (
                                  <button
                                    onClick={() => openAssignmentModal(tarea, module, lesson)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-full"
                                  >
                                    Entregar Tarea
                                  </button>
                                ) : (
                                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                    ⏰ Expirado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {module.lecciones?.filter(lesson => lesson.tareas && lesson.tareas.length > 0).length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No hay tareas en este módulo
                  </div>
                )}
              </div>
            ))}

            {modules.filter(module => 
              module.lecciones?.some(lesson => lesson.tareas && lesson.tareas.length > 0)
            ).length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No hay tareas asignadas para este curso.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evaluaciones' && (
          <div className="space-y-6">
            {modules.map(module => (
              <div key={module.id_modulo} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
                  <h2 className="text-xl font-bold text-purple-800">Módulo: {module.nombre}</h2>
                  <p className="text-purple-600 text-sm mt-1">{module.descripcion}</p>
                </div>

                <div className="divide-y">
                  {module.lecciones?.filter(lesson => lesson.evaluaciones && lesson.evaluaciones.length > 0)
                    .map(lesson => (
                    <div key={lesson.id_leccion} className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">
                          Lección: {lesson.titulo}
                        </h3>
                        <p className="text-gray-600 text-sm">{lesson.contenido}</p>
                      </div>

                      <div className="space-y-4 ml-4">
                        {lesson.evaluaciones?.map(evaluacion => (
                          <div key={evaluacion.id_evaluacion} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 mb-2">{evaluacion.titulo}</h4>
                                <p className="text-gray-600 text-sm mb-3">{evaluacion.descripcion}</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                  <div>
                                    <span className="font-medium">Tipo:</span> {evaluacion.tipo}
                                  </div>
                                  <div>
                                    <span className="font-medium">Puntos máx:</span> {evaluacion.calificacion_maxima}
                                  </div>
                                  <div>
                                    <span className="font-medium">Inicia:</span> {new Date(evaluacion.fecha_hora_inicio).toLocaleString()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Finaliza:</span> {new Date(evaluacion.fecha_hora_entrega).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="ml-4 text-center min-w-[120px]">
                                {evaluacion.entrega ? (
                                  <div>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                      ✅ Entregado
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(evaluacion.entrega.fecha_entrega).toLocaleDateString()}
                                    </p>
                                    {evaluacion.entrega.calificacion && (
                                      <p className="text-xs font-medium mt-1 text-green-600">
                                        Calificación: {evaluacion.entrega.calificacion}
                                      </p>
                                    )}
                                  </div>
                                ) : canDeliver(evaluacion.fecha_hora_entrega) ? (
                                  <button
                                    onClick={() => openEvaluationModal(evaluacion, module, lesson)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm w-full"
                                  >
                                    Realizar Evaluación
                                  </button>
                                ) : (
                                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                    ⏰ Expirado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {module.lecciones?.filter(lesson => lesson.evaluaciones && lesson.evaluaciones.length > 0).length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No hay evaluaciones en este módulo
                  </div>
                )}
              </div>
            ))}

            {modules.filter(module => 
              module.lecciones?.some(lesson => lesson.evaluaciones && lesson.evaluaciones.length > 0)
            ).length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No hay evaluaciones para este curso.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de entrega */}
      {(selectedAssignment || selectedEvaluation) && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedAssignment ? 'Entregar Tarea' : 'Entregar Evaluación'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedAssignment 
                      ? `Módulo: ${selectedAssignment.module.nombre} - Lección: ${selectedAssignment.lesson.titulo}`
                      : `Módulo: ${selectedEvaluation?.module.nombre} - Lección: ${selectedEvaluation?.lesson.titulo}`
                    }
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {selectedAssignment?.assignment.titulo || selectedEvaluation?.evaluation.titulo}
                </h4>
                <p className="text-gray-600 text-sm">
                  {selectedAssignment?.assignment.descripcion || selectedEvaluation?.evaluation.descripcion}
                </p>
                {selectedAssignment && (
                  <p className="text-sm text-gray-500 mt-2">
                    📅 Entrega: {new Date(selectedAssignment.assignment.fecha_entrega).toLocaleString()}
                  </p>
                )}
                {selectedEvaluation && (
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-2">
                    <div>Puntos máx: {selectedEvaluation.evaluation.calificacion_maxima}</div>
                    <div>Tipo: {selectedEvaluation.evaluation.tipo}</div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {selectedAssignment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL del archivo entregado *
                    </label>
                    <input
                      type="url"
                      value={deliveryUrl}
                      onChange={(e) => setDeliveryUrl(e.target.value)}
                      placeholder="https://drive.google.com/... o https://github.com/..."
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Sube tu archivo a Google Drive, Dropbox, GitHub, etc. y pega el enlace aquí
                    </p>
                  </div>
                )}

                {selectedEvaluation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-blue-500 mr-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-blue-800">
                          Para entregar esta evaluación, solo haz clic en "Entregar Evaluación". 
                          El sistema registrará tu entrega automáticamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeliver}
                    disabled={selectedAssignment ? !deliveryUrl : false}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {selectedAssignment ? 'Entregar Tarea' : 'Entregar Evaluación'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavbar />
    </>
  );
}