'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Interfaces simples para los datos
interface DatosCertificado {
  estudiante: string;
  curso: string;
  fecha: string;
}

export default function CertificadoPage() {
  const searchParams = useSearchParams();
  const idCurso = searchParams.get('curso');
  const idUsuario = searchParams.get('usuario');
  
  const [datos, setDatos] = useState<DatosCertificado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí deberías hacer la petición a tu backend para obtener los nombres reales
    // Ejemplo ficticio de cómo se vería la lógica de carga:
    if (idCurso && idUsuario) {
        // fetch(`${API_URL}/certificado/validar?curso=${idCurso}&usuario=${idUsuario}`)
        // .then(...)
        
        // *PARA EFECTOS DE PRUEBA INMEDIATA SIN CREAR MÁS ENDPOINTS, SIMULAREMOS DATOS:*
        setTimeout(() => {
            setDatos({
                estudiante: "Nombre del Estudiante", // Deberías traerlo del backend
                curso: "Ingeniería de Software Avanzada", // Deberías traerlo del backend
                fecha: new Date().toLocaleDateString()
            });
            setLoading(false);
        }, 1000);
    }
  }, [idCurso, idUsuario]);

  if (loading) return <div className="p-10 text-center">Generando certificado...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5">
      
      {/* Contenedor del Certificado - Este es el área que se imprimirá */}
      <div 
        id="certificado-area"
        className="bg-white border-[10px] border-double border-gray-800 p-20 text-center shadow-2xl max-w-4xl w-full mx-auto"
        style={{ fontFamily: '"Times New Roman", serif', minHeight: '600px' }}
      >
        <div className="mb-10">
            <h1 className="text-5xl font-bold uppercase tracking-widest text-gray-900 mb-4">Certificado de Finalización</h1>
            <p className="text-xl text-gray-600">Se otorga el presente reconocimiento a</p>
        </div>

        <div className="my-12">
            <h2 className="text-4xl font-bold text-blue-900 italic border-b-2 border-gray-300 inline-block pb-2 px-10">
                {datos?.estudiante}
            </h2>
        </div>

        <div className="mb-12">
            <p className="text-xl text-gray-600 mb-2">Por haber completado satisfactoriamente el curso de</p>
            <h3 className="text-3xl font-bold text-gray-800">{datos?.curso}</h3>
        </div>

        <div className="mt-20 flex justify-between items-end text-sm text-gray-500 px-10">
            <div className="text-center">
                <div className="w-40 border-t border-gray-400 mx-auto mb-2"></div>
                <p>Firma del Instructor</p>
            </div>
            <div className="text-center">
                <p className="font-bold mb-1">Fecha de Emisión</p>
                <p>{datos?.fecha}</p>
            </div>
            <div className="text-center">
                <div className="w-40 border-t border-gray-400 mx-auto mb-2"></div>
                <p>Firma del Director</p>
            </div>
        </div>
      </div>

      {/* Botón de descarga (visible solo en pantalla) */}
      <button 
        onClick={() => window.print()} 
        className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg font-bold print:hidden"
      >
        Descargar PDF
      </button>

      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            background: white;
            -webkit-print-color-adjust: exact;
          }
          /* Ocultamos todo lo que no sea el certificado */
          body > *:not(#certificado-area), 
          nav, footer, button {
            display: none !important;
          }
          /* Aseguramos que el certificado se vea */
          #certificado-area {
            display: block !important;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 5px double #333; /* Ajuste de borde para impresión */
            box-shadow: none;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}