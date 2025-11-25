// app/home-admin/reports/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';
import { adminService } from '@/services/adminServices';
import { pdfGenerator } from '@/utils/pdfGenerator';
import { courseService } from '@/services/courseService';
import { userService } from '@/services/userService';

interface ReportData {
  total_usuarios: number;
  total_cursos: number;
  total_inscripciones: number;
  cursos_populares: { titulo: string; inscritos: number }[];
  usuarios_activos: { nombre: string; cursos_completados: number }[];
}

export default function ReportsAdminPage() {
  const [stats, setStats] = useState<ReportData | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      const [coursesData, teachersData, studentsData] = await Promise.all([
        courseService.getAllCourses(),
        userService.getUsersByRole('Docente'),
        userService.getUsersByRole('Estudiante')
      ]);

      setCourses(coursesData);
      setTeachers(teachersData);
      setStudents(studentsData);

      // Simular datos de estadísticas
      setStats({
        total_usuarios: teachersData.length + studentsData.length,
        total_cursos: coursesData.length,
        total_inscripciones: coursesData.reduce((acc: number, course: any) => acc + (course.inscritos || 0), 0),
        cursos_populares: coursesData
          .sort((a: any, b: any) => (b.inscritos || 0) - (a.inscritos || 0))
          .slice(0, 5)
          .map((course: any) => ({
            titulo: course.titulo,
            inscritos: course.inscritos || 0
          })),
        usuarios_activos: studentsData.slice(0, 5).map((student: any) => ({
          nombre: `${student.nombre} ${student.apellido}`,
          cursos_completados: Math.floor(Math.random() * 10)
        }))
      });
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (reportType: string) => {
    setGeneratingPDF(true);
    try {
      switch (reportType) {
        case 'students':
          pdfGenerator.generateStudentsPDF(students);
          break;
        case 'courses':
          pdfGenerator.generateCoursesPDF(courses);
          break;
        case 'teachers':
          pdfGenerator.generateTeachersPDF(teachers);
          break;
        case 'general':
          if (stats) {
            pdfGenerator.generateGeneralReport(stats);
          }
          break;
      }
      alert(`Reporte ${reportType} generado exitosamente`);
    } catch (error) {
      alert('Error al generar el PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto mt-24 px-4 pb-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <BottomNavbar />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto mt-24 px-4 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-2">Genera reportes detallados de la plataforma</p>
        </div>

        {/* Tarjetas de Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-gray-800">{stats.total_usuarios}</div>
              <div className="text-gray-600 text-sm">Total Usuarios</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="text-2xl font-bold text-gray-800">{stats.total_cursos}</div>
              <div className="text-gray-600 text-sm">Total Cursos</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="text-2xl font-bold text-gray-800">{stats.total_inscripciones}</div>
              <div className="text-gray-600 text-sm">Total Inscripciones</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-gray-800">{teachers.length}</div>
              <div className="text-gray-600 text-sm">Profesores</div>
            </div>
          </div>
        )}

        {/* Generación de Reportes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Generar Reportes en PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ReportButton 
              title="Reporte de Estudiantes"
              description={`${students.length} estudiantes registrados`}
              onGenerate={() => handleGeneratePDF('students')}
              disabled={generatingPDF}
              color="blue"
            />
            <ReportButton 
              title="Reporte de Cursos"
              description={`${courses.length} cursos activos`}
              onGenerate={() => handleGeneratePDF('courses')}
              disabled={generatingPDF}
              color="green"
            />
            <ReportButton 
              title="Reporte de Profesores"
              description={`${teachers.length} profesores`}
              onGenerate={() => handleGeneratePDF('teachers')}
              disabled={generatingPDF}
              color="purple"
            />
            <ReportButton 
              title="Reporte General"
              description="Estadísticas completas"
              onGenerate={() => handleGeneratePDF('general')}
              disabled={generatingPDF}
              color="orange"
            />
          </div>
        </div>

        {/* Cursos Populares */}
        {stats && stats.cursos_populares.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Cursos Más Populares</h2>
            <div className="space-y-3">
              {stats.cursos_populares.map((curso, index) => (
                <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{curso.titulo}</div>
                      <div className="text-sm text-gray-600">{curso.inscritos} inscritos</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round((curso.inscritos / stats.total_inscripciones) * 100)}% del total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavbar />
    </>
  );
}

// Componente para botones de reporte
function ReportButton({ 
  title, 
  description, 
  onGenerate, 
  disabled, 
  color 
}: { 
  title: string; 
  description: string; 
  onGenerate: () => void; 
  disabled: boolean;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700'
  };

  return (
    <button
      onClick={onGenerate}
      disabled={disabled}
      className={`text-white p-4 rounded-lg transition-colors text-left ${colorClasses[color as keyof typeof colorClasses]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm opacity-90">{description}</div>
      {disabled && (
        <div className="text-xs mt-2">Generando PDF...</div>
      )}
    </button>
  );
}