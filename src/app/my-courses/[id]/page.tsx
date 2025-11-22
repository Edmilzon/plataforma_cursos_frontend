// app/my-courses/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
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
  const [deliveryText, setDeliveryText] = useState('');
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

        const [courseData, modulesData, myCourses] = await Promise.all([
          courseService.getCourseById(courseId),
          courseService.getModulesByCourse(courseId),
          enrollmentService.getMyCourses(),
        ]);
        
        setCourse(courseData);
        
        const courseProgress = myCourses.find((course: any) => 
          course.id_curso === parseInt(courseId)
        );
        setProgress(courseProgress?.progreso || 0);

        const modulesWithContent = await Promise.all(
          modulesData.map(async (module: Module) => {
            try {
              const lessons = await courseService.getLessonsByModule(courseId, module.id_modulo.toString());
              
              const lessonsWithContent = await Promise.all(
                lessons.map(async (lesson: Lesson) => {
                  try {
                    const [assignments, evaluations] = await Promise.all([
                      courseService.getAssignmentsByLesson(lesson.id_leccion.toString()),
                      courseService.getEvaluationsByLesson(lesson.id_leccion.toString())
                    ]);

                    return {
                      ...lesson,
                      completado: false,
                      tareas: assignments || [],
                      evaluaciones: evaluations || []
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

  const handleMarkCompleted = async (lessonId: string) => {
    try {
      setModules(prev => prev.map(module => ({
        ...module,
        lecciones: module.lecciones?.map(lesson => 
          lesson.id_leccion === parseInt(lessonId) 
            ? { ...lesson, completado: true }
            : lesson
        )
      })));

      const totalLessons = modules.reduce((acc, module) => acc + (module.lecciones?.length || 0), 0);
      const completedLessons = modules.reduce((acc, module) => 
        acc + (module.lecciones?.filter(lesson => lesson.completado).length || 0), 0
      ) + 1;
      
      const newProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      setProgress(newProgress);

    } catch (error) {
      console.error('Error:', error);
      alert('Error al marcar la lección como completada');
    }
  };

  const openAssignmentModal = (assignment: Assignment, module: Module, lesson: Lesson) => {
    const now = new Date();
    const dueDate = new Date(assignment.fecha_entrega);
    
    if (now > dueDate) {
      alert('La fecha de entrega ha expirado. Ya no puedes entregar esta tarea.');
      return;
    }

    setSelectedAssignment({ assignment, module, lesson });
    setDeliveryText('');
    setDeliveryUrl('');
  };

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
    setDeliveryText('');
    setDeliveryUrl('');
  };

  const closeModal = () => {
    setSelectedAssignment(null);
    setSelectedEvaluation(null);
    setDeliveryText('');
    setDeliveryUrl('');
  };

  const handleDeliver = async () => {
    try {
      if (selectedAssignment) {
        const deliveryData = {
          respuesta_texto: deliveryText,
          url_archivo: deliveryUrl,
          fecha_entrega: new Date().toISOString()
        };

        // await deliveryService.deliverAssignment(selectedAssignment.assignment.id_tarea, deliveryData);
        
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
                            ? { ...tarea, entrega: { ...deliveryData, estado: 'Entregado' } }
                            : tarea
                        )
                      }
                    : lesson
                )
              }
            : module
        ));

        alert('Tarea entregada exitosamente');
      
      } else if (selectedEvaluation) {
        const deliveryData = {
          respuesta_texto: deliveryText,
          url_archivo: deliveryUrl,
          fecha_entrega: new Date().toISOString()
        };

        // await deliveryService.deliverEvaluation(selectedEvaluation.evaluation.id_evaluacion, deliveryData);
        
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
                            ? { ...evaluacion, entrega: { ...deliveryData, estado: 'Entregado' } }
                            : evaluacion
                        )
                      }
                    : lesson
                )
              }
            : module
        ));

        alert('Evaluación entregada exitosamente');
      }

      closeModal();
    } catch (error) {
      console.error('Error delivering:', error);
      alert('Error al entregar');
    }
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

                        {!lesson.completado && (
                          <button
                            onClick={() => handleMarkCompleted(lesson.id_leccion.toString())}
                            className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 whitespace-nowrap transition-colors"
                          >
                            Marcar como completado
                          </button>
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
                                  <p>Entrega: {new Date(tarea.fecha_entrega).toLocaleDateString()}</p>
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
                                      Entregado
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
                                    Expirado
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
                                      Entregado
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
                                    Expirado
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

      {/* Modal de entrega - Versión más natural */}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu solución (Texto)
                    <span className="text-gray-400 text-xs ml-1">- Opcional</span>
                  </label>
                  <textarea
                    value={deliveryText}
                    onChange={(e) => setDeliveryText(e.target.value)}
                    placeholder="Escribe tu respuesta, solución o comentarios aquí..."
                    className="w-full h-40 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de archivo externo
                    <span className="text-gray-400 text-xs ml-1">- Opcional</span>
                  </label>
                  <input
                    type="url"
                    value={deliveryUrl}
                    onChange={(e) => setDeliveryUrl(e.target.value)}
                    placeholder="https://drive.google.com/... o https://github.com/..."
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Puedes subir tu archivo a Google Drive, Dropbox, GitHub, etc. y pegar el enlace aquí
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeliver}
                    disabled={!deliveryText && !deliveryUrl}
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