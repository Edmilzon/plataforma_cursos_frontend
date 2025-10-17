'use client';

import { useAuth } from '@/hooks/useAuth';
import { courseService } from '@/services/courseService';
import { Course, CourseCard } from '@/components/landing/CourseCard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated) {
            const fetchCourses = async () => {
                try {
                    const allCourses = await courseService.getAllCourses();
                    setCourses(allCourses);
                } catch (error) {
                    console.error("Error al obtener los cursos:", error);
                } finally {
                    setCoursesLoading(false);
                }
            };
            fetchCourses();
        }
    }, [isAuthenticated, loading, router]);

    // Muestra un loader mientras se verifica la autenticación
    if (loading || !isAuthenticated || coursesLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="container mx-auto mt-24 px-4">
            <h1 className="text-3xl font-bold">¡Bienvenido de vuelta, {user?.nombre}!</h1>
            <p className="mt-2 text-lg text-gray-600">Explora nuestros cursos y empieza a aprender hoy mismo.</p>

            {/* Courses Section */}
            <section className="py-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                    Cursos Disponibles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.length > 0 ? courses.map((course) => (
                        <CourseCard key={course.id_curso} course={course} />
                    )) : <p className="col-span-full text-center text-gray-500">No hay cursos disponibles en este momento.</p>}
                </div>
            </section>
        </div>
    );
}