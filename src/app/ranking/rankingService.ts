// src/services/rankingService.ts

const API_BASE_URL = 'http://127.0.0.1:5000';

// Interfaces para los datos del ranking
export interface StudentRank {
  id_usuario: number;
  nombre: string;
  apellido: string;
  avatar_url: string;
  saldo_punto: number;
  rank: string;
}

export interface CourseRatingRank {
  id_curso: number;
  titulo: string;
  descripcion: string;
  calificacion_promedio: string;
  rank: string;
}

export interface CoursePopularityRank {
  id_curso: number;
  titulo: string;
  descripcion: string;
  cantidad_estudiantes: string;
  rank: string;
}

// Función genérica para obtener datos de la API
async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener los datos: ${response.statusText}`);
    }
    // La API de ranking parece devolver el array directamente
    return await response.json();
  } catch (error) {
    console.error(error);
    // En caso de error, devolvemos un array vacío para no romper la UI
    return [] as T;
  }
}

export const rankingService = {
  getStudentRanking(): Promise<StudentRank[]> {
    return fetchData<StudentRank[]>(`${API_BASE_URL}/ranking/students`);
  },
  getCourseRatingRanking(): Promise<CourseRatingRank[]> {
    return fetchData<CourseRatingRank[]>(`${API_BASE_URL}/ranking/courses/rating`);
  },
  getCoursePopularityRanking(): Promise<CoursePopularityRank[]> {
    return fetchData<CoursePopularityRank[]>(`${API_BASE_URL}/ranking/courses/popularity`);
  },
};