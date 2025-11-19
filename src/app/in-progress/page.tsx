// app/in-progress/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enrollmentService } from '@/services/enrollmentService';
import { BottomNavbar } from '@/components/BottomNavbar';

interface Course {
  id_curso: number;
  titulo: string;
  descripcion: string;
  imagen_portada_url: string;
  progreso?: number;
}

export default function InProgressPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const myCourses = await enrollmentService.getMyCourses();
        setCourses(myCourses);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <>
        <div className="container mx-auto mt-24 px-4 pb-20 text-center">
          <p>Cargando tus cursos...</p>
        </div>
        <BottomNavbar />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto mt-24 px-4 pb-20">
        <h1 className="text-3xl font-bold mb-6">Mis Cursos en Progreso</h1>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No estás inscrito en ningún curso aún.</p>
            <button 
              onClick={() => router.push('/cursos')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Explorar Cursos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div 
                key={course.id_curso}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/my-courses/${course.id_curso}`)}
              >
                <img 
                  src={course.imagen_portada_url || '/placeholder-course.jpg'} 
                  alt={course.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{course.titulo}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.descripcion}</p>
                  
                  {course.progreso !== undefined && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso</span>
                        <span>{course.progreso}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${course.progreso}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-2">
                    Continuar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNavbar />
    </>
  );
}