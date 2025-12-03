"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// --- Interfaces de Datos ---

interface CourseResponse {
  id_curso: number;
  titulo: string;
  descripcion: string;
  precio: string | number;
  modalidad: string;
  imagen_portada_url: string;
  docente: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  };
}

interface UserResponse {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
}

// Interfaz basada en la respuesta de GET /inscripciones/estudiante/:id
// Nota: La API devuelve una lista, tendremos que filtrar para encontrar la actual.
interface EnrollmentResponse {
  id_inscripcion: number;
  fecha_inscripcion: string;
  estado_progreso: string;
  porcentaje_completado: string;
  id_curso: number;
  id_estudiante: number;
  // Si la API llegara a devolver metodo_pago en el futuro, lo agregaríamos aquí.
}

// Estructura interna para mostrar en el recibo
interface ReceiptData {
  transactionId: string; // Vendrá de id_inscripcion
  date: string;          // Vendrá de fecha_inscripcion
  amount: number;
  currency: string;
  courseId: number;
  courseName: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
}

// --- Componente Interno con Lógica ---

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Estados de la UI
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const courseIdParam = searchParams.get("courseId");
  const userIdParam = searchParams.get("userId");

  useEffect(() => {
    const fetchData = async () => {
      // 1. Validación de parámetros
      if (!courseIdParam || !userIdParam) {
        setError("Faltan identificadores de la transacción (courseId o userId).");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 2. Consumo de APIs en paralelo al backend (puerto 5000)
        // Agregamos la petición de inscripciones para obtener el ID real de la transacción
        const [courseRes, userRes, enrollmentsRes] = await Promise.all([
          fetch(`http://localhost:5000/cursos/${courseIdParam}`),
          fetch(`http://localhost:5000/user/${userIdParam}`),
          fetch(`http://localhost:5000/inscripciones/estudiante/${userIdParam}`)
        ]);

        // 3. Validación de respuestas HTTP
        if (!courseRes.ok) throw new Error(`Error al cargar curso: ${courseRes.statusText}`);
        if (!userRes.ok) throw new Error(`Error al cargar usuario: ${userRes.statusText}`);
        if (!enrollmentsRes.ok) throw new Error(`Error al cargar inscripciones: ${enrollmentsRes.statusText}`);

        // 4. Extracción de datos
        const courseData: CourseResponse = await courseRes.json();
        const userData: UserResponse = await userRes.json();
        const enrollmentsData: EnrollmentResponse[] = await enrollmentsRes.json();

        // 5. Lógica para encontrar la inscripción REAL
        // Buscamos en la lista de inscripciones la que coincida con el curso actual.
        // Si hay múltiples (ej. re-inscripción), tomamos la más reciente (mayor id_inscripcion).
        const currentEnrollment = enrollmentsData
          .filter(e => e.id_curso === Number(courseIdParam))
          .sort((a, b) => b.id_inscripcion - a.id_inscripcion)[0];

        if (!currentEnrollment) {
          throw new Error("No se encontró el registro de inscripción en la base de datos.");
        }

        // Formateo de fecha real proveniente de la BD
        const dbDate = new Date(currentEnrollment.fecha_inscripcion);
        const formattedDate = dbDate.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // 6. Construcción del objeto de recibo con DATOS REALES
        const newReceipt: ReceiptData = {
          transactionId: currentEnrollment.id_inscripcion.toString(), // ID Real de la BD
          date: formattedDate, // Fecha Real de la BD
          amount: Number(courseData.precio),
          currency: "USD",
          courseId: courseData.id_curso,
          courseName: courseData.titulo,
          customerName: `${userData.nombre} ${userData.apellido}`,
          customerEmail: userData.correo,
          paymentMethod: "Pago Online", // Texto estático ya que la API GET no devuelve el método específico
        };

        setReceipt(newReceipt);
        setError(null);

      } catch (err: any) {
        console.error("Error en PaymentSuccessPage:", err);
        setError(err.message || "Ocurrió un error inesperado al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseIdParam, userIdParam]);

  // --- Handlers ---

  const handlePrint = () => {
    window.print();
  };

  const handleGoToCourse = () => {
    if (receipt) {
      router.push(`/my-courses/${receipt.courseId}`);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/home");
  };

  // --- Renderizado Condicional ---

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Obteniendo recibo oficial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de Datos</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!receipt) return null;

  // --- Renderizado Principal (Éxito) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
      <div className="bg-white shadow-xl rounded-2xl max-w-3xl w-full overflow-hidden print:shadow-none print:w-full print:rounded-none">
        
        {/* Cabecera Visual (Solo Web) */}
        <div className="bg-green-600 p-8 text-center print:hidden">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-500/30 backdrop-blur-sm mb-4">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">¡Inscripción Exitosa!</h2>
          <p className="text-green-100 text-lg">Tu acceso ha sido confirmado por el sistema.</p>
        </div>

        {/* Cabecera Impresa (Solo PDF/Print) */}
        <div className="hidden print:flex justify-between items-end p-8 border-b-2 border-gray-100">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Plataforma Cursos</h1>
            <p className="text-gray-500 mt-1">Comprobante Oficial de Inscripción</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Fecha de Emisión:</p>
            <p className="font-medium text-gray-800">{receipt.date}</p>
          </div>
        </div>

        {/* Cuerpo del Recibo */}
        <div className="p-8 sm:p-12">
          
          {/* Información Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estudiante</h3>
              <p className="font-bold text-gray-900 text-xl">{receipt.customerName}</p>
              <p className="text-gray-600">{receipt.customerEmail}</p>
            </div>
            <div className="sm:text-right">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nº Inscripción (ID)</h3>
              <p className="font-mono font-medium text-gray-900 text-lg">#{receipt.transactionId}</p>
              <div className="mt-1 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold print:border print:border-green-200">
                Confirmado
              </div>
            </div>
          </div>

          {/* Detalles de la Compra */}
          <div className="border rounded-xl border-gray-200 overflow-hidden mb-10 print:border-gray-300">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 print:bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{receipt.courseName}</p>
                    <p className="text-sm text-gray-500">Acceso completo al contenido del curso</p>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {receipt.amount.toFixed(2)} {receipt.currency}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50 print:bg-gray-100">
                <tr>
                  <td className="px-6 py-4 font-bold text-gray-900 text-right">Total</td>
                  <td className="px-6 py-4 font-bold text-gray-900 text-right text-xl text-blue-600 print:text-black">
                    {receipt.amount.toFixed(2)} {receipt.currency}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Detalles Adicionales */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-10">
            <div>
              <span className="block font-medium text-gray-700">Método de Pago:</span>
              {receipt.paymentMethod}
            </div>
            <div className="text-right">
              <span className="block font-medium text-gray-700">Estado de Inscripción:</span>
              Activa
            </div>
          </div>

          {/* Botones de Acción (Ocultos al imprimir) */}
          <div className="flex flex-col gap-4 print:hidden mt-8 pt-8 border-t border-gray-100">
            <button 
              onClick={handleGoToCourse}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200 flex items-center justify-center gap-2"
            >
              <span>Ir al Aula Virtual</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Guardar como PDF
              </button>
              <button 
                onClick={handleGoToDashboard}
                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Ver mis Cursos
              </button>
            </div>
          </div>
        </div>

        {/* Footer del Recibo */}
        <div className="bg-gray-50 px-8 py-6 text-center text-xs text-gray-400 print:bg-white print:text-left print:px-8 print:border-t print:mt-8">
          <p className="mb-2">© 2024 Plataforma Cursos. Todos los derechos reservados.</p>
          <p>Este documento es un comprobante generado automáticamente y es válido sin firma ni sello.</p>
        </div>
      </div>
    </div>
  );
}

// Exportación con Suspense (Requerido por Next.js App Router para useSearchParams en cliente)
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Procesando...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}