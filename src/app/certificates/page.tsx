'use client';

import { BottomNavbar } from '@/components/BottomNavbar';

export default function CertificatesPage() {
    return (
        <>
            <div className="container mx-auto mt-24 px-4 pb-20">
                <h1 className="text-3xl font-bold">Mis Certificados</h1>
                <p className="mt-4 text-lg text-gray-600">
                    Aquí encontrarás todos los certificados que has obtenido al completar tus cursos.
                </p>
                { /* Placeholder for certificates list */ }
                <div className="mt-8 p-8 border rounded-lg bg-gray-50 text-center text-gray-500">
                    <p>Aún no tienes certificados. ¡Completa un curso para obtener el primero!</p>
                </div>
            </div>
            <BottomNavbar />
        </>
    );
}
// }export default function CertificatesPage() {
//   return (
//     <main className="min-h-screen bg-gray-50 py-16 px-6">
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10">
//         <h1 className="text-4xl font-bold text-gray-900 mb-6">Certifícate con nosotros</h1>
//         <p className="text-gray-700 leading-relaxed mb-8">
//           En Polimathia, valoramos el esfuerzo y el aprendizaje. Cada curso completado te acerca a una certificación 
//           que valida tus conocimientos y puede ayudarte a destacar profesionalmente.
//         </p>
//         <ul className="list-disc list-inside space-y-3 text-gray-700">
//           <li>Obtén certificados digitales verificables.</li>
//           <li>Accede a tus logros desde tu perfil personal.</li>
//           <li>Comparte tus certificados en redes profesionales como LinkedIn.</li>
//         </ul>
//         <p className="text-gray-600 mt-8 italic">
//           Próximamente podrás visualizar tus certificados y descargar tus credenciales directamente desde tu cuenta.
//         </p>
//       </div>
//     </main>
//   );
// }
