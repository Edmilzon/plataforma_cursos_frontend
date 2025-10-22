'use client';

import { useAuth } from '@/hooks/useAuth';
import { courseService } from '@/services/courseService';
import { BottomNavbar } from '@/components/BottomNavbar';
import { CourseCard, type Course } from '@/components/landing/CourseCard';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const { user, isAuthenticated, loading } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setError(null);
                setCoursesLoading(true);
                const allCourses = await courseService.getAllCourses();
                setCourses(allCourses);
            } catch (err) {
                console.error("Error al obtener los cursos:", err);
                setError("No se pudieron cargar los cursos. Por favor, intenta de nuevo más tarde.");
            } finally {
                setCoursesLoading(false);
            }
        };
        fetchCourses();
    }, []);
    if (loading || coursesLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            <div className="container mx-auto mt-24 px-4 pb-20"> {/* Padding bottom para que el contenido no quede oculto por el navbar */}
                <h1 className="text-3xl font-bold">¡Bienvenido de vuelta, {user?.nombre}!</h1>
                <p className="mt-2 text-lg text-gray-600">Explora nuestros cursos y empieza a aprender hoy mismo.</p>

                {/* Courses Section */}
                <section className="py-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8">
                        Cursos Disponibles
                    </h3>
                    {error && <p className="col-span-full text-center text-red-500">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.length > 0 ? courses.map((course) => (
                            <CourseCard key={course.id_curso} course={course} />
                        )) : <p className="col-span-full text-center text-gray-500">No hay cursos disponibles en este momento.</p>}
                    </div>
                </section>
            </div>
            <BottomNavbar />
        </>
    );
}