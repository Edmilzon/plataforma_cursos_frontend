// src/components/home-admin/ReportPreviewModal.tsx - VERSIÓN CORREGIDA
'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);


import React from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  generatingPDF: boolean;
  onGeneratePDF: () => void;
}

export const ReportPreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  reportType,
  data,
  generatingPDF,
  onGeneratePDF,
}) => {
  if (!isOpen) return null;

  const handleGeneratePDF = () => onGeneratePDF();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header del Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-300">
          <h2 className="text-xl font-bold text-gray-800">
            Vista Previa -{' '}
            {reportType === 'students' && 'Reporte de Estudiantes'}
            {reportType === 'courses' && 'Reporte de Cursos'}
            {reportType === 'teachers' && 'Reporte de Docentes'}
            {reportType === 'general' && 'Reporte General'}
            {reportType === 'academicProgress' && 'Reporte de Progreso Académico'}
            {reportType === 'evaluationGrades' && 'Reporte de Notas de Evaluaciones'}
            {reportType === 'averageGrades' && 'Reporte de Promedio de Notas'}
            {reportType === 'completedCourses' && 'Reporte de Cursos Completados'}
            {reportType === 'activeStudents' && 'Reporte de Estudiantes Activos'}
            {reportType === 'coursesByTeacher' && 'Reporte de Cursos por Docente'}
            {reportType === 'globalRanking' && 'Ranking Global de Estudiantes'}
            {reportType === 'awardedBadges' && 'Reporte de Insignias Otorgadas'}
            {reportType === 'scheduleControl' && 'Reporte de Control de Horarios'}
            {reportType === 'newUserActivity' && 'Reporte de Actividad de Nuevos Usuarios'}
          </h2>
          {data?.startDate && data?.endDate && (
            <p className="text-sm text-gray-500 ml-4">
              {`Desde: ${new Date(data.startDate).toLocaleDateString('es-ES')} - Hasta: ${new Date(data.endDate).toLocaleDateString('es-ES')}`}
            </p>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
          </button>
        </div>

        {/* Contenido del Reporte - SIN CLASES PDF-SAFE */}
        <div id="report-preview-content" className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {/* RESUMEN GENERAL */}
            <div className="mb-8 p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen del Reporte</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data?.total_usuarios && (
                  <div className="text-center p-3 border border-gray-300 rounded">
                    <div className="text-xl font-bold text-blue-600">{data.total_usuarios}</div>
                    <div className="text-sm text-gray-600">Total Usuarios</div>
                  </div>
                )}
                {data?.total_cursos && (
                  <div className="text-center p-3 border border-gray-300 rounded">
                    <div className="text-xl font-bold text-green-600">{data.total_cursos}</div>
                    <div className="text-sm text-gray-600">Total Cursos</div>
                  </div>
                )}
                {data?.total_inscripciones && (
                  <div className="text-center p-3 border border-gray-300 rounded">
                    <div className="text-xl font-bold text-purple-600">{data.total_inscripciones}</div>
                    <div className="text-sm text-gray-600">Total Inscripciones</div>
                  </div>
                )}
                {data?.teachers_count && (
                  <div className="text-center p-3 border border-gray-300 rounded">
                    <div className="text-xl font-bold text-orange-600">{data.teachers_count}</div>
                    <div className="text-sm text-gray-600">Profesores</div>
                  </div>
                )}
              </div>
            </div>

            {/* Gráficos (Solo para reporte general) */}
            {data?.registros_por_mes && data?.distribucion_edades && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Visualización de Datos</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <h4 className="text-md font-semibold text-gray-700 mb-4">Registros por Mes</h4>
                    <Bar
                      options={{ responsive: true }}
                      data={{
                        labels: data?.registros_por_mes?.map((d: any) => d.mes) || [],
                        datasets: [{
                          label: 'Nuevos Usuarios',
                          data: data?.registros_por_mes?.map((d: any) => d.count) || [],
                          backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        }],
                      }}
                    />
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <h4 className="text-md font-semibold text-gray-700 mb-4">Distribución de Edades</h4>
                    <Pie
                      options={{ responsive: true }}
                      data={{
                        labels: data?.distribucion_edades?.map((d: any) => d.rango) || [],
                        datasets: [{
                          label: 'Usuarios',
                          data: data?.distribucion_edades?.map((d: any) => d.count) || [],
                          backgroundColor: [
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(255, 99, 132, 0.5)',
                          ],
                          borderColor: [
                            '#36A2EB', '#4BC0C0', '#FFCE56', '#9966FF', '#FF6384'
                          ],
                          borderWidth: 1,
                        }],
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de datos */}
            <div className="mt-6 bg-white border border-gray-300 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  {reportType === 'students' && 'Lista de Estudiantes'}
                  {reportType === 'courses' && 'Lista de Cursos'}
                  {reportType === 'teachers' && 'Lista de Docentes'}
                  {reportType === 'general' && 'Resumen General'}
                  {reportType === 'academicProgress' && 'Detalle de Progreso Académico'}
                  {reportType === 'evaluationGrades' && 'Detalle de Notas de Evaluaciones'}
                  {reportType === 'averageGrades' && 'Promedio de Notas por Estudiante'}
                  {reportType === 'completedCourses' && 'Cursos Completados y Certificaciones'}
                  {reportType === 'activeStudents' && 'Estudiantes con Más Temas Completados'}
                  {reportType === 'coursesByTeacher' && 'Detalle de Cursos por Docente'}
                  {reportType === 'globalRanking' && 'Ranking de Estudiantes Destacados'}
                  {reportType === 'awardedBadges' && 'Detalle de Insignias por Estudiante'}
                  {reportType === 'scheduleControl' && 'Control de Horarios y Sesiones'}
                  {reportType === 'newUserActivity' && 'Actividad Detallada de Nuevos Usuarios'}
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                {renderDataTable(reportType, data)}
              </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-300 bg-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
            disabled={generatingPDF}
          >
            Cerrar
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={generatingPDF}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPDF ? 'Generando PDF...' : 'Generar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Función para renderizar las tablas de datos - SIMPLIFICADA
function renderDataTable(reportType: string, data: any) {
  switch (reportType) {
    case 'students':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Puntos</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Cursos Inscritos</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Fecha Registro</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.students?.length > 0 ? data.students.map((student: any) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {student.nombre} {student.apellido}
                  </div>
                  <div className="text-sm text-gray-600">{student.correo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {student.saldo_punto} pts
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {student.cursos_inscritos}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(student.fecha_registro).toLocaleDateString('es-ES')}
                </td>
              </tr>
            )) : null}
            {(!data?.students || data.students.length === 0) && (
              <tr><td colSpan={4} className="text-center py-6 text-gray-500">No hay datos de estudiantes.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'courses':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Curso</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Docente</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Inscritos</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Fecha Inicio</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.courses?.length > 0 ? data.courses.map((course: any) => (
              <tr key={course.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{course.titulo}</div>
                  <div className="text-sm text-gray-600">{course.modalidad}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {course.docente}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {course.inscritos}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {course.precio > 0 ? `S/. ${course.precio.toFixed(2)}` : 'Gratis'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(course.fecha_inicio).toLocaleDateString('es-ES')}
                </td>
              </tr>
            )) : null}
            {(!data?.courses || data.courses.length === 0) && (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500">No hay datos de cursos.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'teachers':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Docente</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Cursos Asignados</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Total Estudiantes</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Fecha Registro</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.teachers?.length > 0 ? data.teachers.map((teacher: any) => (
              <tr key={teacher.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {teacher.nombre} {teacher.apellido}
                  </div>
                  <div className="text-sm text-gray-600">{teacher.correo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {teacher.cursos_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {teacher.estudiantes_totales} estudiantes
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(teacher.fecha_registro).toLocaleDateString('es-ES')}
                </td>
              </tr>
            )) : null}
            {(!data?.teachers || data.teachers.length === 0) && (
              <tr><td colSpan={4} className="text-center py-6 text-gray-500">No hay datos de docentes.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'academicProgress':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-cyan-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Curso</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Progreso</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Fecha Inscripción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.academicProgress?.length > 0 ? data.academicProgress.map((item: any, index: number) => (
              <tr key={`${item.id_estudiante}-${item.id_curso}-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{item.estudiante_nombre_completo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.curso_titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.estado_progreso === 'Completado' ? 'bg-green-100 text-green-800' :
                    item.estado_progreso === 'En curso' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.estado_progreso}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{parseFloat(item.porcentaje_completado).toFixed(2)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(item.fecha_inscripcion).toLocaleDateString('es-ES')}</td>
              </tr>
            )) : null}
            {(!data?.academicProgress || data.academicProgress.length === 0) && (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500">No hay datos de progreso académico.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'evaluationGrades':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Curso</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Evaluación</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Calificación</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Fecha Entrega</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.evaluationGrades?.length > 0 ? data.evaluationGrades.map((item: any, index: number) => (
              <tr key={`${item.id_usuario}-${item.id_evaluacion}-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{item.estudiante_nombre_completo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.curso_titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.evaluacion_titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{parseFloat(item.calificacion).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(item.fecha_entrega).toLocaleDateString('es-ES')}</td>
              </tr>
            )) : null}
            {(!data?.evaluationGrades || data.evaluationGrades.length === 0) && (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500">No hay datos de notas de evaluaciones.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'averageGrades':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-pink-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Curso</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Promedio Final</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.averageGrades?.length > 0 ? data.averageGrades.map((item: any, index: number) => (
              <tr key={`${item.id_estudiante}-${item.id_curso}-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{item.estudiante_nombre_completo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.curso_titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{parseFloat(item.promedio_calificacion).toFixed(2)}</td>
              </tr>
            )) : null}
            {(!data?.averageGrades || data.averageGrades.length === 0) && (
              <tr><td colSpan={3} className="text-center py-6 text-gray-500">No hay datos de promedios de notas.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'completedCourses':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Curso</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Total Completados</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Certificaciones Obtenidas</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.completedCourses?.length > 0 ? data.completedCourses.map((item: any) => (
              <tr key={item.id_curso}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{item.curso_titulo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-800">
                  {item.total_completados}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-800">{item.total_certificaciones}</td>
              </tr>
            )) : null}
            {(!data?.completedCourses || data.completedCourses.length === 0) && (
              <tr><td colSpan={3} className="text-center py-6 text-gray-500">No hay datos de cursos completados.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'activeStudents':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-yellow-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Lecciones Completadas</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.activeStudents?.length > 0 ? data.activeStudents.map((item: any) => (
              <tr key={item.id_usuario}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={item.avatar_url || '/default-avatar.png'} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{item.estudiante_nombre_completo}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-800">{item.lecciones_completadas}</td>
              </tr>
            )) : null}
            {(!data?.activeStudents || data.activeStudents.length === 0) && (
              <tr><td colSpan={2} className="text-center py-6 text-gray-500">No hay datos de estudiantes activos.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'coursesByTeacher':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Docente</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Cursos Asignados ({data?.coursesByTeacher?.reduce((acc: number, item: any) => acc + (item.cursos?.length || 0), 0) || 0})</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.coursesByTeacher?.length > 0 ? data.coursesByTeacher.map((item: any) => (
              <tr key={item.id_docente}>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                  <div className="font-bold text-gray-900">{item.nombre_docente}</div>
                  <div className="text-sm text-gray-600">{item.total_cursos} cursos</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ul className="list-disc list-inside space-y-1">
                    {item.cursos?.map((curso: any, index: number) => (
                      <li key={`${curso.id_curso}-${index}`} className="text-sm text-gray-800">
                        {curso.titulo} <span className="text-xs text-gray-500">({curso.modalidad})</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            )) : null}
            {(!data?.coursesByTeacher || data.coursesByTeacher.length === 0) && (
              <tr><td colSpan={2} className="text-center py-6 text-gray-500">No hay datos de cursos por docente.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'globalRanking':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-red-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Posición</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Puntos</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Lecciones</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Certificados</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.globalRanking?.length > 0 ? data.globalRanking.map((item: any) => (
              <tr key={item.posicion}>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-lg font-bold text-gray-700">{item.posicion}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={item.avatar_url || '/default-avatar.png'} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{item.nombre_completo}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{item.puntos}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.lecciones_completadas}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.certificados_obtenidos}</td>
              </tr>
            )) : null}
            {(!data?.globalRanking || data.globalRanking.length === 0) && (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500">No hay datos de ranking de estudiantes.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'awardedBadges':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-lime-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Insignias Obtenidas</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.detalle_por_estudiante?.length > 0 ? data.detalle_por_estudiante.map((item: any) => (
              <tr key={item.id_usuario}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={item.avatar_url || '/default-avatar.png'} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{item.nombre_completo}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className="text-lg font-bold text-gray-800">{item.insignias_obtenidas}</span>
                </td>
              </tr>
            )) : null}
            {(!data?.detalle_por_estudiante || data.detalle_por_estudiante.length === 0) && (
              <tr><td colSpan={2} className="text-center py-6 text-gray-500">No hay datos de insignias otorgadas.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'scheduleControl':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-stone-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Curso y Horario</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estudiantes y Progreso</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.scheduleControl?.length > 0 ? data.scheduleControl.map((item: any) => (
              <tr key={item.id_curso}>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                  <div className="font-bold text-gray-900">{item.curso_titulo}</div>
                  <div className="text-sm text-gray-600">{item.horarios_curso || 'Sin horario definido'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.estudiantes?.length > 0 ? (
                    <ul className="space-y-2">
                      {item.estudiantes.map((est: any) => (
                        <li key={est.id_estudiante} className="text-sm text-gray-800">
                          <div className="font-medium">{est.nombre_completo}</div>
                          <div className="text-xs text-gray-500">
                            Progreso: {est.porcentaje_progreso}% | Sesiones: {est.lecciones_completadas}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">Sin estudiantes inscritos.</div>
                  )}
                </td>
              </tr>
            )) : null}
            {(!data?.scheduleControl || data.scheduleControl.length === 0) && (
              <tr><td colSpan={2} className="text-center py-6 text-gray-500">No hay datos de control de horarios.</td></tr>
            )}
          </tbody>
        </table>
      );

    case 'newUserActivity':
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-amber-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Cursos Inscritos</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Recompensas Canjeadas</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.newUserActivity?.length > 0 ? data.newUserActivity.map((item: any) => (
              <tr key={item.id_usuario}>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                  <div className="font-bold text-gray-900">{item.nombre_completo}</div>
                  <div className="text-sm text-gray-600">{item.correo}</div>
                  <div className="text-sm text-gray-500 mt-1">Puntos: {item.saldo_punto}</div>
                  <div className="text-xs text-gray-400 mt-1">Registro: {new Date(item.fecha_registro).toLocaleDateString('es-ES')}</div>
                </td>
                <td className="px-6 py-4 align-top">
                  {item.cursos_inscritos?.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {item.cursos_inscritos.map((curso: any) => (
                        <li key={curso.id_curso} className="text-sm text-gray-800">
                          {curso.titulo}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-gray-400">Ninguno</span>
                  )}
                </td>
                <td className="px-6 py-4 align-top">
                  {item.recompensas_canjeadas?.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {item.recompensas_canjeadas.map((rec: any) => (
                        <li key={rec.id_recompensa} className="text-sm text-gray-800">
                          {rec.nombre}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-gray-400">Ninguna</span>
                  )}
                </td>
              </tr>
            )) : null}
            {(!data?.newUserActivity || data.newUserActivity.length === 0) && (
              <tr><td colSpan={3} className="text-center py-6 text-gray-500">No hay datos de actividad de nuevos usuarios.</td></tr>
            )}
          </tbody>
        </table>
      );

    default:
      return (
        <div className="p-6 text-center text-gray-600">
          Selecciona un tipo de reporte para ver los datos detallados.
        </div>
      );
  }
}