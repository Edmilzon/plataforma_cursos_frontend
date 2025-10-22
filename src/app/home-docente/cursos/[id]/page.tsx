'use client';
import { useParams } from 'next/navigation';
import NavbarDocente from '@/components/home-docente/NavbarDocente';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Module {
  id_modulo: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

export default function CursoDetalle() {
  const params = useParams();
  const courseId = params.id;
  const [modules, setModules] = useState<Module[]>([]);
  const [course, setCourse] = useState({ title: '', description: '' });

  useEffect(() => {
    setTimeout(() => {
      setCourse({ title: `Curso ${courseId}`, description: 'Descripción del curso...' });
      setModules([
        { id_modulo: 1, nombre: 'Módulo 1: Introducción', descripcion: 'Conceptos básicos', orden: 1 },
        { id_modulo: 2, nombre: 'Módulo 2: Contenido Principal', descripcion: 'Desarrollo del tema', orden: 2 }
      ]);
    }, 500);
  }, [courseId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarDocente />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-lg mb-4">Gestión del Curso</h3>
              <nav className="space-y-2">
                <Link href={`/home-docente/cursos/${courseId}/modulos`} className="block py-2 px-3 text-blue-600 hover:bg-blue-50 rounded transition-colors">Módulos</Link>
                <Link href={`/home-docente/cursos/${courseId}/lecciones`} className="block py-2 px-3 text-blue-600 hover:bg-blue-50 rounded transition-colors">Lecciones</Link>
                <Link href={`/home-docente/cursos/${courseId}/evaluaciones`} className="block py-2 px-3 text-blue-600 hover:bg-blue-50 rounded transition-colors">Evaluaciones</Link>
                <Link href={`/home-docente/cursos/${courseId}/tareas`} className="block py-2 px-3 text-blue-600 hover:bg-blue-50 rounded transition-colors">Tareas</Link>
              </nav>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Módulos del Curso</h2>
                <Link href={`/home-docente/cursos/${courseId}/modulos`} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">+ Agregar Módulo</Link>
              </div>
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id_modulo} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{module.nombre}</h3>
                    <p className="text-gray-600 text-sm mb-2">{module.descripcion}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Orden: {module.orden}</span>
                      <div className="space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                        <button className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}