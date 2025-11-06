'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { courseService } from '@/services/courseService';
import { Course } from '@/components/landing/CourseCard';
import Image from 'next/image';

interface Module {
  id_modulo: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

interface CourseDetails extends Course {
  duracion: number;
  imagen_portada_url: string;
  tipo_curso: {
    nombre: string;
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      const fetchCourseDetails = async () => {
        try {
          setLoading(true);
          const [courseData, modulesData] = await Promise.all([
            courseService.getCourseById(courseId),
            courseService.getModulesByCourse(courseId)
          ]);
          setCourse(courseData);
          setModules(modulesData.sort((a: Module, b: Module) => a.orden - b.orden));
        } catch (err) {
          setError('No se pudo cargar el curso.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourseDetails();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-gray-500">Cargando detalles del curso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">No se encontró el curso.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Columna Principal (Izquierda) */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <span className="text-blue-600 font-semibold">{course.tipo_curso?.nombre || 'Categoría'}</span>
              <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">{course.titulo}</h1>
              <p className="text-lg text-gray-600 mb-6">{course.descripcion}</p>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Contenido del curso</h2>
                <div className="space-y-3">
                  {modules.length > 0 ? (
                    modules.map(module => (
                      <div key={module.id_modulo} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="font-semibold text-gray-800">{module.nombre}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">El contenido del curso se revelará pronto.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Derecha) */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-24">
              <Image
                src={course.imagen_portada_url || '/placeholder.png'}
                alt={`Portada de ${course.titulo}`}
                width={600}
                height={400}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <p className="text-4xl font-extrabold text-gray-900 mb-4">${course.precio}</p>
                <button 
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                  // onClick={() => handleEnrollment()} // La función se añadirá después
                >
                  Inscribirse ahora
                </button>
                <div className="mt-6 space-y-3 text-gray-600">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    <span>Docente: {course.docente?.nombre} {course.docente?.apellido}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 11.586V6z" clipRule="evenodd" /></svg>
                    <span>Duración: {course.duracion} horas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2 1v2h12V6H4zm0 4v6h12v-6H4z" clipRule="evenodd" /></svg>
                    <span>Modalidad: {course.modalidad}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}