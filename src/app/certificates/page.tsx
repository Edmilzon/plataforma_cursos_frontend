// src/app/certificates/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enrollmentService } from '@/services/enrollmentService';
import { BottomNavbar } from '@/components/BottomNavbar';

export default function CertificatesPage() {
<<<<<<< HEAD
  const router = useRouter();
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        // Obtenemos todos los cursos del estudiante
        const myCourses = await enrollmentService.getMyCourses();
        
        // Filtramos solo los que están al 100% (Criterio simple para la lista)
        // Nota: Si quieres ser estricto con las Tareas Finales aquí también, 
        // habría que hacer peticiones extra, pero por rendimiento solemos confiar en el progreso.
        const certified = myCourses.filter((c: any) => c.progreso === 100);
        setCompletedCourses(certified);
      } catch (error) {
        console.error("Error cargando certificados", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-gray-50 py-16 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Certificaciones</h1>
          <p className="text-gray-600 mb-8">
            Colección de logros académicos obtenidos en la plataforma.
          </p>

          {loading ? (
            <div className="text-center py-10">Cargando logros...</div>
          ) : completedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map((course) => (
                <div key={course.id_curso} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center p-4">
                     {/* Icono de medalla o diploma */}
                     <span className="text-5xl">🎓</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">
                      {course.titulo || `Curso #${course.id_curso}`}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Completado el: {new Date().toLocaleDateString()} {/* Fecha simulada si no viene del back */}
                    </p>
                    <button
                      onClick={() => router.push(`/certificates/${course.id_curso}`)}
                      className="w-full block text-center bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      Ver Certificado
                    </button>
                  </div>
=======
    return (
        <>
            <div className="container mx-auto mt-24 px-4 pb-20">
                <h1 className="text-3xl font-bold">Mis Certificados</h1>
                <p className="mt-4 text-lg text-gray-600">
                    Aquí encontrarás todos los certificados que has obtenido al completar tus cursos.
                </p>
                { /* Placeholder for certificates list */ }
                <div className="mt-8 p-8 border rounded-lg bg-gray-50 text-center text-gray-500">
                    <p>Aún no tienes certificados. ¡Completa un curso para obtener el primero!</p>
>>>>>>> origin/recompensa-y-pago-curso
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Aún no tienes certificados</h3>
              <p className="text-gray-600">
                Completa el 100% de tus cursos inscritos para obtener tus credenciales.
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNavbar />
    </>
  );
}