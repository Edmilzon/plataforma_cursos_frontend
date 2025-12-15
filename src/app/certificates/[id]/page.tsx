// src/app/certificates/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseService } from '@/services/courseService';
import { BottomNavbar } from '@/components/BottomNavbar';

export default function CertificateViewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [studentName, setStudentName] = useState("Estudiante");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Obtenemos datos del curso
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);

        // 2. Intentamos obtener el nombre del estudiante del LocalStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            const fullName = `${parsed.nombre || ''} ${parsed.apellido || ''}`.trim();
            if (fullName) setStudentName(fullName);
          } catch (e) { console.error("Error parseando usuario", e); }
        }
      } catch (err) {
        console.error("Error cargando datos del certificado", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) loadData();
  }, [courseId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Generando certificado...</div>;

  return (
    <>
      <main className="min-h-screen bg-gray-100 py-10 px-4 pb-24">
        {/* Barra superior de navegación simple */}
        <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
          <button 
            onClick={() => router.back()} 
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            &larr; Volver
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium print:hidden"
          >
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>

        {/* --- DIPLOMA --- */}
        <div className="max-w-5xl mx-auto bg-white border-8 border-double border-gray-300 p-10 shadow-2xl text-center relative overflow-hidden print:shadow-none print:border-4 print:max-w-full print:p-0">
          
          {/* Marca de agua decorativa */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
             <span className="text-[300px]">🏆</span>
          </div>

          <div className="relative z-10 py-10 border-4 border-gray-800 px-8">
            {/* Encabezado */}
            <div className="mb-8">
              <h1 className="text-5xl font-serif font-bold text-gray-800 mb-2 tracking-wide uppercase">Certificado</h1>
              <span className="text-xl text-gray-500 tracking-[0.2em] uppercase">De Finalización</span>
            </div>

            <div className="my-12">
              <p className="text-gray-600 text-lg italic mb-4">Este documento certifica que</p>
              
              <h2 className="text-4xl font-bold text-blue-900 border-b-2 border-gray-300 inline-block pb-2 px-10 mb-6 font-serif">
                {studentName}
              </h2>

              <p className="text-gray-600 text-lg italic mb-6">ha completado satisfactoriamente el curso de</p>

              <h3 className="text-3xl font-bold text-gray-800 mb-8 uppercase tracking-wider">
                {course?.titulo || "Curso Sin Título"}
              </h3>

              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Habiendo cumplido con todos los requisitos académicos, tareas y evaluaciones 
                establecidos por la plataforma educativa Polimathia.
              </p>
            </div>

            <div className="mt-16 flex justify-around items-end">
              {/* Se eliminó la sección de Firma del Director */}

              <div className="text-center">
                 {/* Sello simulado */}
                 <div className="w-24 h-24 rounded-full border-4 border-yellow-500 flex items-center justify-center text-yellow-600 font-bold transform rotate-[-15deg] opacity-80 mx-auto mb-2">
                    SELLO <br/> OFICIAL
                 </div>
                 <p className="text-xs text-gray-400">ID: {courseId}-{Date.now().toString().slice(-6)}</p>
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
                <div className="w-48 border-b border-gray-400 mb-2 mt-1"></div>
                <p className="font-bold text-gray-700">Fecha de Emisión</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="print:hidden">
        <BottomNavbar />
      </div>
      
      {/* Estilos específicos para impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          main, main * {
            visibility: visible;
          }
          main {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </>
  );
}