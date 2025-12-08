// app/my-courses/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { progressService } from '@/services/progressService';
import { deliveryService } from '@/services/deliveryService';
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

export default function MyCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Verificar inscripción
        const enrolled = await enrollmentService.checkEnrollment(courseId);
        setIsEnrolled(enrolled);
        
        if (!enrolled) {
          setLoading(false);
          return;
        }

        // Obtener datos del curso y progreso
        const [courseData, modulesData, myCourses] = await Promise.all([
          courseService.getCourseById(courseId),
          courseService.getModulesByCourse(courseId),
          enrollmentService.getMyCourses(),
        ]);
        
        setCourse(courseData);
        
        // Encontrar el progreso de este curso específico
        const courseProgress = myCourses.find((course: any) => 
          course.id_curso === parseInt(courseId)
        );
        setProgress(courseProgress?.progreso || 0);

        // Obtener contenido completo de cada módulo
        const modulesWithContent = await Promise.all(
          modulesData.map(async (module: Module) => {
            try {
              const lessons = await courseService.getLessonsByModule(courseId, module.id_modulo.toString());
              
              // Obtener tareas y evaluaciones para cada lección
              const lessonsWithContent = await Promise.all(
                lessons.map(async (lesson: Lesson) => {
                  try {
                    const [assignments, evaluations] = await Promise.all([
                      courseService.getAssignmentsByLesson(lesson.id_leccion.toString()),
                      courseService.getEvaluationsByLesson(lesson.id_leccion.toString())
                    ]);

                    return {
                      ...lesson,
                      completado: false, // Por ahora siempre false
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
      // Por ahora solo actualizamos el estado local
      // Más adelante conectaremos con el backend
      setModules(prev => prev.map(module => ({
        ...module,
        lecciones: module.lecciones?.map(lesson => 
          lesson.id_leccion === parseInt(lessonId) 
            ? { ...lesson, completado: true }
            : lesson
        )
      })));

      // Actualizar progreso local
      const totalLessons = modules.reduce((acc, module) => acc + (module.lecciones?.length || 0), 0);
      const completedLessons = modules.reduce((acc, module) => 
        acc + (module.lecciones?.filter(lesson => lesson.completado).length || 0), 0
      ) + 1; // +1 porque acabamos de marcar una como completada
      
      const newProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      setProgress(newProgress);

    } catch (error) {
      console.error('Error:', error);
      alert('Error al marcar la lección como completada');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDeliverAssignment = async (assignmentId: string) => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    try {
      // Simular subida de archivo
      const fileUrl = await simulateFileUpload(selectedFile);
      
      // Por ahora solo actualizamos el estado local
      // Más adelante conectaremos con el backend
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

      setSelectedFile(null);
      alert('Tarea entregada exitosamente');
      
    } catch (error) {
      console.error('Error delivering assignment:', error);
      alert('Error al entregar la tarea');
    }
  };

  const handleDeliverEvaluation = async (evaluationId: string) => {
    try {
      // Por ahora solo actualizamos el estado local
      // Más adelante conectaremos con el backend
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

      alert('Evaluación entregada exitosamente');
      
    } catch (error) {
      console.error('Error delivering evaluation:', error);
      alert('Error al entregar la evaluación');
    }
  };

  // Función temporal para simular subida de archivos
  const simulateFileUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://example.com/uploads/${file.name}`);
      }, 1000);
    });
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
        </div>

        {/* Módulos y contenido */}
        <div className="space-y-6">
          {modules.map(module => (
            <div key={module.id_modulo} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header del módulo */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-bold">{module.nombre}</h2>
                <p className="text-gray-600 text-sm mt-1">{module.descripcion}</p>
              </div>

              {/* Lecciones del módulo */}
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
                        
                        {/* Video/recurso */}
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

                        {/* Tareas */}
                        {lesson.tareas && lesson.tareas.length > 0 && (
                          <div className="mt-4 ml-9">
                            <h4 className="font-semibold text-gray-700 mb-3">Tareas:</h4>
                            <div className="space-y-4">
                              {lesson.tareas.map(tarea => (
                                <div key={tarea.id_tarea} className="bg-gray-50 p-4 rounded-lg border">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-lg">{tarea.titulo}</h5>
                                      <p className="text-gray-600 mt-1">{tarea.descripcion}</p>
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
                                      <h5 className="font-medium text-lg">{evaluacion.titulo}</h5>
                                      <p className="text-gray-600 mt-1">{evaluacion.descripcion}</p>
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
                        )}
                      </div>

                      {/* Botón de completado */}
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
        </div>

        {/* Mensaje si no hay módulos */}
        {modules.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">El contenido del curso estará disponible pronto.</p>
          </div>
        )}
      </div>
      <BottomNavbar />
    </>
  );
}