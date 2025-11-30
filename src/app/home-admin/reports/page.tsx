// src/app/home-admin/reports/page.tsx - VERSIÓN MEJORADA
'use client';

import { useEffect, useState } from 'react';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';
import { ReportPreviewModal } from '@/components/home-admin/ReportPreviewModal';
import { reportDataService } from '@/utils/reportDataService';
import { pdfGenerator } from '@/utils/pdfGenerator';

interface ReportData {
  total_usuarios: number;
  total_cursos: number;
  total_inscripciones: number;
  cursos_populares: { titulo: string; inscritos: number }[];
  usuarios_activos: { nombre: string; cursos_completados: number }[];
}

export default function ReportsAdminPage() {
  const [stats, setStats] = useState<ReportData | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el modal de vista previa
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentReportType, setCurrentReportType] = useState<'students' | 'courses' | 'teachers' | 'general'>('general');
  const [currentReportData, setCurrentReportData] = useState<any>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      console.log('📊 Cargando datos para reportes...');
      
      const [studentsData, coursesData, teachersData, generalStatsData] = await Promise.all([
        reportDataService.getStudentReportData(),
        reportDataService.getCourseReportData(),
        reportDataService.getTeacherReportData(),
        reportDataService.getGeneralStats()
      ]);

      console.log('✅ Datos cargados:', {
        students: studentsData.length,
        courses: coursesData.length,
        teachers: teachersData.length,
        generalStats: generalStatsData
      });

      setStudents(studentsData);
      setCourses(coursesData);
      setTeachers(teachersData);
      setGeneralStats(generalStatsData);

      // Preparar stats para las tarjetas
      setStats({
        total_usuarios: generalStatsData.total_usuarios,
        total_cursos: generalStatsData.total_cursos,
        total_inscripciones: generalStatsData.total_inscripciones,
        cursos_populares: generalStatsData.cursos_populares,
        usuarios_activos: generalStatsData.usuarios_activos
      });

    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowPreview = async (reportType: 'students' | 'courses' | 'teachers' | 'general') => {
    setCurrentReportType(reportType);
    setGeneratingPDF(true);

    try {
      let reportData;
      
      switch (reportType) {
        case 'students':
          reportData = {
            ...generalStats,
            students: students,
            teachers_count: teachers.length
          };
          break;
        case 'courses':
          reportData = {
            ...generalStats,
            courses: courses,
            teachers_count: teachers.length
          };
          break;
        case 'teachers':
          reportData = {
            ...generalStats,
            teachers: teachers,
            teachers_count: teachers.length
          };
          break;
        case 'general':
          reportData = {
            ...generalStats,
            students_count: students.length,
            teachers_count: teachers.length,
            courses_count: courses.length
          };
          break;
      }

      setCurrentReportData(reportData);
      setIsPreviewOpen(true);
      
    } catch (error) {
      console.error('Error preparing preview:', error);
      alert('Error al preparar la vista previa');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleGeneratePDF = async () => {
    // Solo delegar al modal - evita doble generación
    console.log('Generación delegada al modal');
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setCurrentReportData(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-24 px-4 pb-20">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Cargando datos de reportes...</div>
        </div>
        <BottomNavbar />
      </div>
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
              onGenerate={() => handleShowPreview('students')}
              disabled={generatingPDF}
              color="blue"
            />
            <ReportButton 
              title="Reporte de Cursos"
              description={`${courses.length} cursos activos`}
              onGenerate={() => handleShowPreview('courses')}
              disabled={generatingPDF}
              color="green"
            />
            <ReportButton 
              title="Reporte de Profesores"
              description={`${teachers.length} profesores`}
              onGenerate={() => handleShowPreview('teachers')}
              disabled={generatingPDF}
              color="purple"
            />
            <ReportButton 
              title="Reporte General"
              description="Estadísticas completas"
              onGenerate={() => handleShowPreview('general')}
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
                    {stats.total_inscripciones > 0 ? Math.round((curso.inscritos / stats.total_inscripciones) * 100) : 0}% del total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Vista Previa */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        reportType={currentReportType}
        data={currentReportData}
        generatingPDF={generatingPDF}
        onGeneratePDF={handleGeneratePDF}
      />

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
        <div className="text-xs mt-2">Cargando vista previa...</div>
      )}
    </button>
  );
}