// src/components/home-admin/ReportCharts.tsx
'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Registrar componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  reportType: 'students' | 'courses' | 'teachers' | 'general';
  data: any;
}

export const ReportCharts: React.FC<ChartProps> = ({ reportType, data }) => {
  // Gráfico de distribución de edades
  const ageDistributionChart = {
    labels: data.distribucion_edades?.map((item: any) => item.rango) || [],
    datasets: [
      {
        label: 'Cantidad de Usuarios',
        data: data.distribucion_edades?.map((item: any) => item.count) || [],
        backgroundColor: [
          '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'
        ],
        borderColor: '#1E40AF',
        borderWidth: 1,
      },
    ],
  };

  // Gráfico de registros por mes
  const registrationChart = {
    labels: data.registros_por_mes?.map((item: any) => item.mes) || [],
    datasets: [
      {
        label: 'Registros por Mes',
        data: data.registros_por_mes?.map((item: any) => item.count) || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Gráfico de puntos de estudiantes
  const studentPointsChart = {
    labels: data.students?.slice(0, 10).map((student: any) => 
      `${student.nombre} ${student.apellido.substring(0, 1)}.`) || [],
    datasets: [
      {
        label: 'Puntos Obtenidos',
        data: data.students?.slice(0, 10).map((student: any) => student.saldo_punto) || [],
        backgroundColor: '#8B5CF6',
        borderColor: '#7C3AED',
        borderWidth: 1,
      },
    ],
  };

  // Gráfico de cursos populares
  const popularCoursesChart = {
    labels: data.cursos_populares?.map((course: any) => course.titulo) || [],
    datasets: [
      {
        label: 'Estudiantes Inscritos',
        data: data.cursos_populares?.map((course: any) => course.inscritos) || [],
        backgroundColor: '#EC4899',
        borderColor: '#DB2777',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Estadísticas de la Plataforma',
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Título del Reporte */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {reportType === 'students' && 'Reporte de Estudiantes'}
          {reportType === 'courses' && 'Reporte de Cursos'}
          {reportType === 'teachers' && 'Reporte de Docentes'}
          {reportType === 'general' && 'Reporte General'}
        </h2>
        <p className="text-gray-600">Generado el {new Date().toLocaleDateString()}</p>
      </div>

      {/* Gráficos para Reporte General */}
      {reportType === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Distribución por Edades</h3>
            <div className="h-64">
              <Doughnut data={ageDistributionChart} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Registros por Mes</h3>
            <div className="h-64">
              <Line data={registrationChart} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Gráficos para Reporte de Estudiantes */}
      {reportType === 'students' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Top 10 Estudiantes por Puntos</h3>
            <div className="h-80">
              <Bar data={studentPointsChart} options={barOptions} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Distribución por Edades</h3>
              <div className="h-64">
                <Doughnut data={ageDistributionChart} options={chartOptions} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Registros por Mes</h3>
              <div className="h-64">
                <Line data={registrationChart} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos para Reporte de Cursos */}
      {reportType === 'courses' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Cursos Más Populares</h3>
            <div className="h-80">
              <Bar data={popularCoursesChart} options={barOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Gráficos para Reporte de Profesores */}
      {reportType === 'teachers' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Profesores: Estudiantes por Docente</h3>
            <div className="h-80">
              <Bar 
                data={{
                  labels: data.teachers?.slice(0, 10).map((t: any) => `${t.nombre} ${t.apellido}`) || [],
                  datasets: [{
                    label: 'Estudiantes',
                    data: data.teachers?.slice(0, 10).map((t: any) => t.estudiantes_totales || 0) || [],
                    backgroundColor: '#9b59b6',
                    borderColor: '#7c3aed',
                    borderWidth: 1,
                  }]
                }}
                options={barOptions}
              />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Profesores: Cursos por Docente</h3>
            <div className="h-80">
              <Bar 
                data={{
                  labels: data.teachers?.slice(0, 10).map((t: any) => `${t.nombre} ${t.apellido}`) || [],
                  datasets: [{
                    label: 'Cursos',
                    data: data.teachers?.slice(0, 10).map((t: any) => t.cursos_count || 0) || [],
                    backgroundColor: '#e74c3c',
                    borderColor: '#c0392b',
                    borderWidth: 1,
                  }]
                }}
                options={barOptions}
              />
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas Resumen */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Estadísticas Resumen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.total_usuarios || 0}</div>
            <div className="text-sm text-gray-600">Total Usuarios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.total_cursos || 0}</div>
            <div className="text-sm text-gray-600">Total Cursos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.total_inscripciones || 0}</div>
            <div className="text-sm text-gray-600">Total Inscripciones</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.teachers_count || data.teachers?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Total Docentes</div>
          </div>
        </div>
      </div>
    </div>
  );
};