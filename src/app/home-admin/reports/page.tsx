'use client';

import { useEffect, useState } from 'react';
import { ReportPreviewModal } from '@/components/home-admin/ReportPreviewModal';
import { 
  reportDataService, 
  StudentReportData, 
  CourseReportData, 
  TeacherReportData,
  GeneralStats
} from '@/utils/reportDataService';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';

export default function ReportsAdminPage() {
  const [students, setStudents] = useState<StudentReportData[]>([]);
  const [courses, setCourses] = useState<CourseReportData[]>([]);
  const [teachers, setTeachers] = useState<TeacherReportData[]>([]);
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Estados para el modal de vista previa
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentReportType, setCurrentReportType] = useState<'students' | 'courses' | 'teachers' | 'general'>('general');
  const [currentReportData, setCurrentReportData] = useState<any>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const end = today.toISOString().split('T')[0];
    const start = thirtyDaysAgo.toISOString().split('T')[0];
    setEndDate(end);
    setStartDate(start);
    if (start && end) {
      loadReportsData(start, end);
    }
  }, []);

  const loadReportsData = async (start: string, end: string) => {
    try {
      setLoading(true);
      console.log('📊 Cargando datos para reportes...');
      
      const [studentsData, coursesData, teachersData, generalStatsData] = await Promise.all([
        reportDataService.getStudentReportData(start, end),
        reportDataService.getCourseReportData(start, end),
        reportDataService.getTeacherReportData(start, end),
        reportDataService.getGeneralStats(start, end)
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
            students: students,
            ...generalStats,
            teachers_count: teachers.length
          };
          break;
        case 'courses':
          reportData = {
            courses: courses,
            ...generalStats,
            teachers_count: teachers.length
          };
          break;
        case 'teachers':
          reportData = {
            teachers: teachers,
            ...generalStats,
            teachers_count: teachers.length
          };
          break;
        case 'general':
          reportData = {
            ...generalStats,
            students_count: students.length, // Ya está en generalStats
            teachers_count: teachers.length, // Ya está en generalStats
            courses_count: courses.length, // Ya está en generalStats
            startDate,
            endDate
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
    if (!currentReportData || !currentReportType) return;
    
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: currentReportType,
          reportData: currentReportData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_${currentReportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Hubo un problema al generar el PDF.");
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setCurrentReportData(null);
    setGeneratingPDF(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-24 px-4 pb-20">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Cargando datos de reportes...</div>
        </div>
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

        {/* Filtro de Fechas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-700 whitespace-nowrap">Rango de Fechas:</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-600">Desde:</label>
            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border rounded-md"/>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-600">Hasta:</label>
            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border rounded-md"/>
          </div>
          <button
            onClick={() => loadReportsData(startDate, endDate)}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Aplicar Filtro'}
          </button>
        </div>

        {/* Tarjetas de Estadísticas */}
        {generalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-gray-800">{generalStats.total_usuarios}</div>
              <div className="text-gray-600 text-sm">Total Usuarios</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="text-2xl font-bold text-gray-800">{generalStats.total_cursos}</div>
              <div className="text-gray-600 text-sm">Total Cursos</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="text-2xl font-bold text-gray-800">{generalStats.total_inscripciones}</div>
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
        {generalStats && generalStats.cursos_populares.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Cursos Más Populares</h2>
            <div className="space-y-3">
              {generalStats.cursos_populares.map((curso, index) => (
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
                    {generalStats.total_inscripciones > 0 ? Math.round((curso.inscritos / generalStats.total_inscripciones) * 100) : 0}% del total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Vista Previa */}
      {isPreviewOpen && (
        <ReportPreviewModal
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          reportType={currentReportType}
          data={currentReportData}
          generatingPDF={generatingPDF}
          onGeneratePDF={async () => {
            setGeneratingPDF(true);
            await handleGeneratePDF();
            setGeneratingPDF(false);
            handleClosePreview();
          }}
        />
      )}
      <BottomNavbar/>
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