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
  reportType: 'students' | 'courses' | 'teachers' | 'general';
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

    default:
      return (
        <div className="p-6 text-center text-gray-600">
          Selecciona un tipo de reporte para ver los datos detallados.
        </div>
      );
  }
}