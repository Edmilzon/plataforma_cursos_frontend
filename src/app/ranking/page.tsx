'use client';

import { BottomNavbar } from '@/components/BottomNavbar';

export default function RankingPage() {
    return (
        <>
            <div className="container mx-auto mt-24 px-4 pb-20">
                <h1 className="text-3xl font-bold">Ranking de Estudiantes</h1>
                <p className="mt-4 text-lg text-gray-600">
                    Aquí podrás ver tu posición y la de otros estudiantes basada en los puntos acumulados. ¡Sigue aprendiendo para subir en el ranking!
                </p>
                {/* Placeholder for ranking list */}
                <div className="mt-8 p-8 border rounded-lg bg-gray-50 text-center text-gray-500">
                    <p>El ranking estará disponible próximamente.</p>
                </div>
            </div>
            <BottomNavbar />
        </>
    );
}