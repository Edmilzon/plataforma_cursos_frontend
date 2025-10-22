'use client';

import { Navbar } from '@/components/navbar';
import { BottomNavbar } from '@/components/BottomNavbar';

export default function CertificatesPage() {
    return (
        <>
            <Navbar />
            <div className="container mx-auto mt-24 px-4 pb-20">
                <h1 className="text-3xl font-bold">Mis Certificados</h1>
                <p className="mt-4 text-lg text-gray-600">
                    Aquí encontrarás todos los certificados que has obtenido al completar tus cursos.
                </p>
                {/* Placeholder for certificates list */}
                <div className="mt-8 p-8 border rounded-lg bg-gray-50 text-center text-gray-500">
                    <p>Aún no tienes certificados. ¡Completa un curso para obtener el primero!</p>
                </div>
            </div>
            <BottomNavbar />
        </>
    );
}