// src/components/home-admin/ReportPreviewModal.tsx - VERSIÓN CORREGIDA
'use client';

import React from 'react';
import { ReportCharts } from './ReportCharts';
import { pdfGeneratorImage } from '@/utils/pdfGeneratorImage';

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

  const handleGeneratePDF = async () => {
    try {
      console.log('📸 Iniciando captura de vista previa para PDF...');
      const contentElement = document.getElementById('report-preview-content');
      if (contentElement) {
        await pdfGeneratorImage.generateReportPDF(contentElement, reportType);
        console.log('✅ PDF generado exitosamente');
      } else {
        console.error('No se encontró el elemento de contenido');
        alert('Error: No se pudo encontrar el contenido del reporte');
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    }
  };
  return (
    // CAMBIO IMPORTANTE: Quitar bg-opacity y usar bg-black para el overlay
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
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
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Contenido del Reporte - SIN CLASES PDF-SAFE */}
        <div className="flex-1 overflow-y-auto p-6">
          <div 
            id="report-preview-content" 
            className="bg-white"
            style={{
              backgroundColor: 'white',
              color: 'black'
            }}
          >
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

            {/* Gráficos */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Gráficos Estadísticos</h2>
              <ReportCharts reportType={reportType} data={data} />
            </div>
            
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
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Estudiante</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Edad</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Puntos</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Cursos</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Progreso</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {data.students?.slice(0, 10).map((student: any) => (
              <tr key={student.id}>
                <td className="px-4 py-2 border border-gray-300">
                  <div className="font-medium text-gray-900">
                    {student.nombre} {student.apellido}
                  </div>
                  <div className="text-sm text-gray-600">{student.correo}</div>
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  {student.edad} años
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  {student.saldo_punto} pts
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  {student.cursos_inscritos}
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-300 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${student.progreso_promedio}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{student.progreso_promedio}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );

    case 'courses':
      return (
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Curso</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Docente</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Inscritos</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Precio</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Modalidad</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {data.courses?.slice(0, 10).map((course: any) => (
              <tr key={course.id}>
                <td className="px-4 py-2 border border-gray-300">
                  <div className="font-medium text-gray-900">{course.titulo}</div>
                  <div className="text-sm text-gray-600">{course.descripcion}</div>
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  {course.docente}
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  {course.inscritos} estudiantes
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  {course.precio > 0 ? `S/. ${course.precio}` : 'Gratis'}
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                    {course.modalidad}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );

    case 'teachers':
      return (
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Docente</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Cursos</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Estudiantes</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 border border-gray-300">Registro</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {data.teachers?.map((teacher: any) => (
              <tr key={teacher.id}>
                <td className="px-4 py-2 border border-gray-300">
                  <div className="font-medium text-gray-900">
                    {teacher.nombre} {teacher.apellido}
                  </div>
                  <div className="text-sm text-gray-600">{teacher.correo}</div>
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs">
                    {teacher.cursos_count} cursos
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  {teacher.estudiantes_totales} estudiantes
                </td>
                <td className="px-4 py-2 text-gray-900 border border-gray-300">
                  {new Date(teacher.fecha_registro).toLocaleDateString('es-ES')}
                </td>
              </tr>
            ))}
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