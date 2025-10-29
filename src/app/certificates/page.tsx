export default function CertificatesPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Certifícate con nosotros</h1>
        <p className="text-gray-700 leading-relaxed mb-8">
          En Polimathia, valoramos el esfuerzo y el aprendizaje. Cada curso completado te acerca a una certificación 
          que valida tus conocimientos y puede ayudarte a destacar profesionalmente.
        </p>
        <ul className="list-disc list-inside space-y-3 text-gray-700">
          <li>Obtén certificados digitales verificables.</li>
          <li>Accede a tus logros desde tu perfil personal.</li>
          <li>Comparte tus certificados en redes profesionales como LinkedIn.</li>
        </ul>
        <p className="text-gray-600 mt-8 italic">
          Próximamente podrás visualizar tus certificados y descargar tus credenciales directamente desde tu cuenta.
        </p>
      </div>
    </main>
  );
}
