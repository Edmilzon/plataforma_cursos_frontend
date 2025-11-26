// app/home-admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { BottomNavbar } from '@/components/home-admin/BottomNavbar';
import { courseService } from '@/services/courseService';
import { userService } from '@/services/userService';

export default function HomeAdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalTeachers: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Obtener todos los cursos
        const courses = await courseService.getAllCourses();
        
        // Obtener usuarios por rol (necesitaríamos un endpoint para contar todos)
        const teachers = await userService.getUsersByRole('Docente');
        const students = await userService.getUsersByRole('Estudiante');

        setStats({
          totalUsers: teachers.length + students.length,
          totalCourses: courses.length,
          activeCourses: courses.filter((course: any) => 
            new Date(course.fecha_fin) > new Date()
          ).length,
          totalTeachers: teachers.length,
          totalStudents: students.length
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <>
        <div className="container mx-auto mt-24 px-4 pb-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
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
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona todos los aspectos de la plataforma</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Usuarios" 
            value={stats.totalUsers} 
            icon="" 
            color="blue" 
          />
          <StatCard 
            title="Total Cursos" 
            value={stats.totalCourses} 
            icon="" 
            color="green" 
          />
          <StatCard 
            title="Cursos Activos" 
            value={stats.activeCourses} 
            icon="" 
            color="purple" 
          />
          <StatCard 
            title="Profesores" 
            value={stats.totalTeachers} 
            icon="" 
            color="orange" 
          />
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton 
              href="/home-admin/courses" 
              label="Gestionar Cursos" 
              color="blue" 
            />
            <ActionButton 
              href="/home-admin/users" 
              label="Gestionar Usuarios" 
              color="green" 
            />
            <ActionButton 
              href="/home-admin/permissions" 
              label="Configurar Permisos" 
              color="purple" 
            />
            <ActionButton 
              href="/home-admin/reports" 
              label="Ver Reportes" 
              color="orange" 
            />
          </div>
        </div>
      </div>
      <BottomNavbar />
    </>
  );
}

// Componente para tarjetas de estadísticas
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50', 
    purple: 'border-purple-500 bg-purple-50',
    orange: 'border-orange-500 bg-orange-50'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center">
        <div className="text-2xl mr-4">{icon}</div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          <p className="text-gray-600 text-sm">{title}</p>
        </div>
      </div>
    </div>
  );
}

// Componente para botones de acción
function ActionButton({ href, label, color }: { href: string; label: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700', 
    orange: 'bg-orange-600 hover:bg-orange-700'
  };

  return (
    <a 
      href={href}
      className={`text-white py-3 px-4 rounded-lg transition-colors text-center ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      {label}
    </a>
  );
}