'use client';

import Link from "next/link";

export interface Course {
  id_curso: number;
  titulo: string;
  descripcion: string;
  gradient?: string;
  docente?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  };
  precio: number;
  modalidad: string;
}

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className={`w-full h-40 ${course.gradient || 'bg-gray-200'} rounded-lg mb-4`}></div>
      <div className="flex-grow">
        <h4 className="text-lg font-bold text-gray-900 mb-2">{course.titulo}</h4>
        <p className="text-gray-600 mb-4 line-clamp-3">{course.descripcion}</p>
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href={`/cursos/${course.id_curso}`} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
        >
          Ver detalles
        </Link>
      </div>
    </div>
  );
};