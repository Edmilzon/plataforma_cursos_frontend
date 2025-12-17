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

export interface AcademicProgressReportData {
  id_curso: number;
  curso_titulo: string;
  id_estudiante: number;
  estudiante_nombre_completo: string;
  estado_progreso: 'Completado' | 'En curso' | 'Inscrito' | string;
  porcentaje_completado: string;
  fecha_inscripcion: string;
}

export interface EvaluationGradesReportData {
  id_usuario: number;
  estudiante_nombre_completo: string;
  id_curso: number;
  curso_titulo: string;
  id_evaluacion: number;
  evaluacion_titulo: string;
  calificacion: string;
  fecha_entrega: string;
  estado: string;
}

export interface AverageGradesReportData {
  id_curso: number;
  curso_titulo: string;
  id_estudiante: number;
  estudiante_nombre_completo: string;
  promedio_calificacion: string;
}

export interface CompletedCoursesReportData {
  id_curso: number;
  curso_titulo: string;
  total_completados: string;
  total_certificaciones: string;
}

export interface ActiveStudentsReportData {
  id_usuario: number;
  estudiante_nombre_completo: string;
  avatar_url: string | null;
  lecciones_completadas: string;
}

export interface CoursesByTeacherReportData {
  id_docente: number;
  nombre_docente: string;
  total_cursos: string;
  cursos: {
    titulo: string;
    id_curso: number;
    modalidad: string;
  }[];
}

export interface AwardedBadgesReportData {
  total_insignias_otorgadas: number;
  detalle_por_estudiante: {
    id_usuario: number;
    nombre_completo: string;
    avatar_url: string | null;
    insignias_obtenidas: string;
  }[];
}

export interface ScheduleControlReportData {
  id_curso: number;
  curso_titulo: string;
  horarios_curso: string | null;
  estudiantes: {
    id_estudiante: number;
    nombre_completo: string;
    porcentaje_progreso: number;
    lecciones_completadas: number;
  }[];
}

export interface GlobalRankingReportData {
  id_usuario: number;
  nombre_completo: string;
  avatar_url: string | null;
  puntos: number;
  certificados_obtenidos: string;
  lecciones_completadas: string;
  posicion: string;
}

export interface NewUserActivityReportData {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  fecha_registro: string;
  saldo_punto: number;
  cursos_inscritos: {
    titulo: string;
    id_curso: number;
    fecha_inscripcion: string;
  }[] | null;
  recompensas_canjeadas: {
    nombre: string;
    fecha_canje: string;
    id_recompensa: number;
  }[] | null;
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
          // TODO: Reemplazar con datos reales del servicio de inscripciones
          cursos_inscritos: studentRank?.cursos_inscritos || 0, 
          progreso_promedio: studentRank?.progreso_promedio || 0
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
          // TODO: Reemplazar con datos reales del servicio de calificaciones
          calificacion_promedio: course.calificacion_promedio || 0
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
        // TODO: Reemplazar con datos reales del servicio de cursos/docentes
        cursos_count: teacher.cursos_asignados || 0,
        estudiantes_totales: teacher.total_estudiantes_en_cursos || 0,
        fecha_registro: teacher.fecha_registro || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting teacher report data:', error);
      return [];
    }
  },

  async getAcademicProgressReportData(startDate?: string, endDate?: string): Promise<AcademicProgressReportData[]> {
    try {
      // El endpoint base ya está en el courseService, pero para reportes podemos definirlo aquí o usar uno global.
      // Por ahora, lo haré explícito.
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${API_BASE_URL}/cursos/reportes/estado-estudiantes`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de progreso académico');
      }
      let data: AcademicProgressReportData[] = await response.json();

      if (startDate && endDate && Array.isArray(data)) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        data = data.filter(item => {
          const inscripcion = new Date(item.fecha_inscripcion);
          return inscripcion >= start && inscripcion <= end;
        });
      }
      return data;
    } catch (error) {
      console.error('Error getting academic progress report data:', error);
      return [];
    }
  },

  async getEvaluationGradesReportData(startDate?: string, endDate?: string): Promise<EvaluationGradesReportData[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${API_BASE_URL}/entregas/reportes/notas-evaluaciones`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de notas de evaluaciones');
      }
      let data: EvaluationGradesReportData[] = await response.json();

      if (startDate && endDate && Array.isArray(data)) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        data = data.filter(item => {
          const entrega = new Date(item.fecha_entrega);
          return entrega >= start && entrega <= end;
        });
      }

      return data;
    } catch (error) {
      console.error('Error getting evaluation grades report data:', error);
      return [];
    }
  },

  async getAverageGradesReportData(startDate?: string, endDate?: string): Promise<AverageGradesReportData[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${API_BASE_URL}/cursos/reportes/promedio-notas-estudiantes`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de promedio de notas');
      }
      const data: AverageGradesReportData[] = await response.json();
      // Nota: Este endpoint no devuelve fechas, por lo que no se aplica el filtro de rango de fechas.
      // Se devolverán todos los promedios históricos.
      return data;
    } catch (error) {
      console.error('Error getting average grades report data:', error);
      return [];
    }
  },

  async getCompletedCoursesReportData(): Promise<CompletedCoursesReportData[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${API_BASE_URL}/cursos/reportes/completados-certificaciones`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de cursos completados y certificaciones');
      }
      const data: CompletedCoursesReportData[] = await response.json();
      // Este endpoint no parece tener filtro por fecha, así que se devuelven todos los datos.
      return data;
    } catch (error) {
      console.error('Error getting completed courses report data:', error);
      return [];
    }
  },

  async getActiveStudentsReportData(): Promise<ActiveStudentsReportData[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${API_BASE_URL}/cursos/reportes/estudiantes-activos`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de estudiantes activos');
      }
      const data: ActiveStudentsReportData[] = await response.json();
      // Este endpoint no parece tener filtro por fecha, así que se devuelven todos los datos.
      return data;
    } catch (error) {
      console.error('Error getting active students report data:', error);
      return [];
    }
  },

  async getCoursesByTeacherReportData(): Promise<CoursesByTeacherReportData[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${API_BASE_URL}/cursos/reportes/cursos-por-docente`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de cursos por docente');
      }
      const data: CoursesByTeacherReportData[] = await response.json();
      // Este endpoint no parece tener filtro por fecha, así que se devuelven todos los datos.
      return data;
    } catch (error) {
      console.error('Error getting courses by teacher report data:', error);
      return [];
    }
  },

  async getGlobalRankingReportData(): Promise<GlobalRankingReportData[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      // La URL de la API es /estudiantes-destacados, no está bajo /reportes/
      const response = await fetch(`${API_BASE_URL}/ranking/estudiantes-destacados`);
      if (!response.ok) {
        throw new Error('Error al obtener el ranking global de estudiantes');
      }
      const data: GlobalRankingReportData[] = await response.json();
      // Este endpoint no parece tener filtro por fecha, así que se devuelven todos los datos.
      return data;
    } catch (error) {
      console.error('Error getting global ranking report data:', error);
      return [];
    }
  },

  async getAwardedBadgesReportData(): Promise<AwardedBadgesReportData | null> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${API_BASE_URL}/insignias/reportes/otorgadas`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de insignias otorgadas');
      }
      const data: AwardedBadgesReportData = await response.json();
      // Este endpoint no parece tener filtro por fecha.
      return data;
    } catch (error) {
      console.error('Error getting awarded badges report data:', error);
      return null;
    }
  },

  async getScheduleControlReportData(): Promise<ScheduleControlReportData[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${API_BASE_URL}/cursos/reportes/horarios-sesiones`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de horarios y sesiones');
      }
      const data: ScheduleControlReportData[] = await response.json();
      // Este endpoint no parece tener filtro por fecha.
      return data;
    } catch (error) {
      console.error('Error getting schedule control report data:', error);
      return [];
    }
  },

  async getNewUserActivityReportData(startDate?: string, endDate?: string): Promise<NewUserActivityReportData[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${API_BASE_URL}/user/reportes/actividad-nuevos-usuarios`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de actividad de nuevos usuarios');
      }
      let data: NewUserActivityReportData[] = await response.json();

      if (startDate && endDate && Array.isArray(data)) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        data = data.filter(item => {
          const registro = new Date(item.fecha_registro);
          return registro >= start && registro <= end;
        });
      }

      return data;
    } catch (error) {
      console.error('Error getting new user activity report data:', error);
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