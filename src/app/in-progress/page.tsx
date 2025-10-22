'use client';

import { BottomNavbar } from '@/components/BottomNavbar';

export default function InProgressPage() {
    return (
        <>
            <div className="container mx-auto mt-24 px-4 pb-20">
                <h1 className="text-3xl font-bold">Cursos en Progreso</h1>
                <p className="mt-4 text-lg text-gray-600">
                    Continúa tu aprendizaje desde donde lo dejaste.
                </p>
                {/* Placeholder for in-progress courses */}
                <div className="mt-8 p-8 border rounded-lg bg-gray-50 text-center text-gray-500">
                    <p>Aquí aparecerán los cursos que has iniciado.</p>
                </div>
            </div>
            <BottomNavbar />
        </>
    );
}