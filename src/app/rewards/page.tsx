'use client';

import { BottomNavbar } from '@/components/BottomNavbar';

export default function RewardsPage() {
    return (
        <>
            <div className="container mx-auto mt-24 px-4 pb-20">
                <h1 className="text-3xl font-bold">Puntos y Recompensas</h1>
                <p className="mt-4 text-lg text-gray-600">
                    Canjea los puntos que has ganado por increíbles recompensas.
                </p>
                {/* Placeholder for rewards */}
                <div className="mt-8 p-8 border rounded-lg bg-gray-50 text-center text-gray-500">
                    <p>La tienda de recompensas estará disponible próximamente.</p>
                </div>
            </div>
            <BottomNavbar />
        </>
    );
}