'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Course {
  id_curso: number;
  title: string;
  description: string;
  estudiantes_inscritos: number;
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCourses([
        { id_curso: 1, title: "Matemáticas Avanzadas", description: "Curso de cálculo diferencial", estudiantes_inscritos: 25 },
        { id_curso: 2, title: "Programación Web", description: "React y Next.js", estudiantes_inscritos: 30 }
      ]);
     
      setLoading(false);
    }, 1000);
     // aca debemos poner la llamada a la API para obtener los cursos del docente, para eso borramos curso 1 y 2 remplazamos con esto:
  //     try {
  //     const courseData = await courseService.getCourseById(courseId);
  //     const modulesData = await moduleService.getModulesByCourse(courseId);
  //     setCourse(courseData);
  //     setModules(modulesData);
  //   } catch (error) {
  //     console.error("Error cargando datos del curso:", error);
  //     setCourse({ title: '', description: '' });
  //     setModules([]);
  //   }
  // };
  
  // fetchCourseData();
  }, []);

  if (loading) return <div className="text-center">Cargando cursos...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.id_curso} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{course.estudiantes_inscritos} estudiantes</span>
            <Link href={`/home-docente/cursos/${course.id_curso}`} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors">Gestionar</Link>
          </div>
        </div>
      ))}
    </div>
  );
}