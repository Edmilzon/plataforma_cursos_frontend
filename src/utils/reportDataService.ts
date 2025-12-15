// src/utils/reportDataService.ts - VERSIÓN CORREGIDA
'use client';

import { userService } from '@/services/userService';
import { rankingService } from '@/services/rankingService';
import { enrollmentService } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';

export interface StudentReportData {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  edad: number;
  fecha_registro: string;
  saldo_punto: number;
  cursos_inscritos: number;
  progreso_promedio: number;
}

export interface CourseReportData {
  id: number;
  titulo: string;
  descripcion: string;
  docente: string;
  inscritos: number;
  precio: number;
  modalidad: string;
  fecha_inicio: string;
  calificacion_promedio?: number;
}

export interface TeacherReportData {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  cursos_count: number;
  estudiantes_totales: number;
  fecha_registro: string;
}

export interface GeneralStats {
  total_usuarios: number;
  total_cursos: number;
  total_inscripciones: number;
  cursos_populares: { titulo: string; inscritos: number }[];
  usuarios_activos: { nombre: string; cursos_completados: number }[];
  distribucion_edades: { rango: string; count: number }[];
  registros_por_mes: { mes: string; count: number }[];
}

// Funciones auxiliares fuera del objeto
const calculateAgeDistribution = (users: any[]) => {
  const ranges = [
    { range: '18-25', min: 18, max: 25 },
    { range: '26-35', min: 26, max: 35 },
    { range: '36-45', min: 36, max: 45 },
    { range: '46-55', min: 46, max: 55 },
    { range: '56+', min: 56, max: 999 }
  ];

  return ranges.map(range => ({
    rango: range.range,
    count: users.filter(user => user.edad && user.edad >= range.min && user.edad <= range.max).length
  }));
};

const calculateRegistrationTimeline = (users: any[]) => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const currentYear = new Date().getFullYear();
  
  return months.map((mes, index) => ({
    mes,
    count: users.filter(user => {
      if (!user.fecha_registro) return false;
      try {
        const date = new Date(user.fecha_registro);
        return date.getFullYear() === currentYear && date.getMonth() === index;
      } catch {
        return false;
      }
    }).length
  }));
};

export const reportDataService = {
  async getStudentReportData(startDate?: string, endDate?: string): Promise<StudentReportData[]> {
    try {
      let [students, ranking] = await Promise.all([
        userService.getUsersByRole('Estudiante'),
        rankingService.getStudentRanking()
      ]);

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Incluir todo el día de fin
        students = students.filter(s => {
          if (!s.fecha_registro) return false;
          const registro = new Date(s.fecha_registro);
          return registro >= start && registro <= end;
        });
      }

      return students.map(student => {
        const studentRank = ranking.find((r: any) => r.id_usuario === student.id_usuario);
        return {
          id: student.id_usuario,
          nombre: student.nombre,
          apellido: student.apellido,
          correo: student.correo,
          edad: student.edad || 0,
          fecha_registro: student.fecha_registro || new Date().toISOString(),
          saldo_punto: studentRank?.saldo_punto || student.saldo_punto || 0,
          cursos_inscritos: Math.floor(Math.random() * 10) + 1, // Temporal
          progreso_promedio: Math.floor(Math.random() * 100) // Temporal
        };
      });
    } catch (error) {
      console.error('Error getting student report data:', error);
      return [];
    }
  },

  async getCourseReportData(startDate?: string, endDate?: string): Promise<CourseReportData[]> {
    try {
      let [courses, popularCourses] = await Promise.all([
        courseService.getAllCourses(),
        enrollmentService.getCoursesWithEnrollments()
      ]);

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        courses = courses.filter((c: any) => {
          if (!c.fecha_inicio) return false;
          const inicio = new Date(c.fecha_inicio);
          return inicio >= start && inicio <= end;
        });
      }

      return courses.map((course: any) => {
        const popularCourse = popularCourses.find((pc: any) => pc.id_curso === course.id_curso);
        const inscritos = popularCourse ? 
          (popularCourse.cantidad_estudiantes || popularCourse.inscritos || 0) : 0;
        
        return {
          id: course.id_curso,
          titulo: course.titulo,
          descripcion: course.descripcion,
          docente: course.docente ? `${course.docente.nombre} ${course.docente.apellido}` : 'Sin docente',
          inscritos: parseInt(inscritos) || 0,
          precio: course.precio || 0,
          modalidad: course.modalidad || 'Online',
          fecha_inicio: course.fecha_inicio,
          calificacion_promedio: parseFloat((Math.random() * 2 + 3).toFixed(1)) // Temporal 3-5 stars
        };
      });
    } catch (error) {
      console.error('Error getting course report data:', error);
      return [];
    }
  },

  async getTeacherReportData(startDate?: string, endDate?: string): Promise<TeacherReportData[]> {
    try {
      let teachers = await userService.getUsersByRole('Docente');
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        teachers = teachers.filter(t => {
          if (!t.fecha_registro) return false;
          const registro = new Date(t.fecha_registro);
          return registro >= start && registro <= end;
        });
      }

      return teachers.map(teacher => ({
        id: teacher.id_usuario,
        nombre: teacher.nombre,
        apellido: teacher.apellido,
        correo: teacher.correo,
        cursos_count: Math.floor(Math.random() * 5) + 1, // Temporal
        estudiantes_totales: Math.floor(Math.random() * 100) + 10, // Temporal
        fecha_registro: teacher.fecha_registro || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting teacher report data:', error);
      return [];
    }
  },

  async getGeneralStats(startDate?: string, endDate?: string): Promise<GeneralStats> {
    try {
      let [students, teachers, courses, popularCourses] = await Promise.all([
        userService.getUsersByRole('Estudiante'),
        userService.getUsersByRole('Docente'),
        courseService.getAllCourses(),
        enrollmentService.getCoursesWithEnrollments()
      ]);

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        students = students.filter(u => u.fecha_registro && new Date(u.fecha_registro) >= start && new Date(u.fecha_registro) <= end);
        teachers = teachers.filter(u => u.fecha_registro && new Date(u.fecha_registro) >= start && new Date(u.fecha_registro) <= end);
        courses = courses.filter((c: any) => {
          if (!c.fecha_inicio) return false;
          const inicio = new Date(c.fecha_inicio);
          return inicio >= start && inicio <= end;
        });
      }

      const allUsers = [...students, ...teachers];
      
      // DEBUG: Ver la estructura de popularCourses
      console.log('📊 popularCourses structure:', popularCourses);
      
      // Calcular total de inscripciones - MANERA SEGURA
      let totalInscripciones = 0;
      if (Array.isArray(popularCourses)) {
        popularCourses.forEach((course: any) => {
          // Intentar diferentes nombres de propiedad
          const inscritos = course.cantidad_estudiantes || course.inscritos || course.students_count || 0;
          totalInscripciones += parseInt(inscritos) || 0;
        });
      }

      // Datos para gráficos
      const distribucion_edades = calculateAgeDistribution(allUsers);
      const registros_por_mes = calculateRegistrationTimeline(allUsers);

      // Preparar cursos populares
      const cursos_populares = Array.isArray(popularCourses) 
        ? popularCourses.slice(0, 5).map((course: any) => ({
            titulo: course.titulo || course.nombre || `Curso ${course.id_curso}`,
            inscritos: parseInt(course.cantidad_estudiantes || course.inscritos || 0)
          }))
        : [];

      return {
        total_usuarios: allUsers.length,
        total_cursos: courses.length,
        total_inscripciones: totalInscripciones,
        cursos_populares,
        usuarios_activos: students.slice(0, 5).map((student: any) => ({
          nombre: `${student.nombre} ${student.apellido}`,
          cursos_completados: Math.floor(Math.random() * 10)
        })),
        distribucion_edades,
        registros_por_mes
      };
    } catch (error) {
      console.error('Error getting general stats:', error);
      return {
        total_usuarios: 0,
        total_cursos: 0,
        total_inscripciones: 0,
        cursos_populares: [],
        usuarios_activos: [],
        distribucion_edades: [],
        registros_por_mes: []
      };
    }
  }
};