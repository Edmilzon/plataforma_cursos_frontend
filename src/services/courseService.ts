import { Course } from "@/components/landing/CourseCard";

const API_BASE_URL = 'http://127.0.0.1:5000';

interface ApiCourse {
  id_curso: number;
  titulo: string;
  descripcion: string;
  // Añade aquí otros campos que devuelva tu API
}

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    const response = await fetch(`${API_BASE_URL}/cursos/`);

    if (!response.ok) {
      throw new Error('Error al obtener los cursos');
    }

    const apiCoursesResponse = await response.json();

    // La API devuelve un objeto con una propiedad "data" que contiene el array de cursos.
    const apiCourses: ApiCourse[] = Array.isArray(apiCoursesResponse.data) ? apiCoursesResponse.data : [];

    // Adaptamos los datos de la API a lo que el componente CourseCard espera
    return apiCourses.map(course => ({
      title: course.titulo,
      description: course.descripcion,
    }));
  }
};